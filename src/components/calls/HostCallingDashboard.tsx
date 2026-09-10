'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PhoneCall, 
  Power, 
  Clock, 
  Star, 
  ShieldAlert, 
  Loader2, 
  IndianRupee, 
  Save, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Mic, 
  Volume2, 
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react'
import { 
  toggleHostOnlineAction, 
  updateHostCallingPricingAction 
} from '@/actions/call.actions'
import { 
  registerHostPushSubscription, 
  requestScreenWakeLock, 
  releaseScreenWakeLock 
} from '@/lib/pushNotifications'
import { toast } from 'sonner'

interface HostCallingDashboardProps {
  hostProfile: any
  settings: any
  slots?: any[]
  recentCalls: any[]
}

export default function HostCallingDashboard({
  hostProfile,
  settings,
  recentCalls,
}: HostCallingDashboardProps) {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(Boolean(settings?.is_online))
  const [isTogglingOnline, setIsTogglingOnline] = useState(false)

  // Call Pricing state
  const [callPrice, setCallPrice] = useState(settings?.rate_per_session || 49)
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)

  // Push notification state
  const [pushStatus, setPushStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default')
  const [isSettingUpPush, setIsSettingUpPush] = useState(false)

  // Microphone status and testing
  const [micStatus, setMicStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0)
  const [showMicHelp, setShowMicHelp] = useState(false)
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null)

  // Unlock AudioContext on initial interaction
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {})
          }
        }
      } catch {}
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }

    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  // Check notification & safe mic status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        setPushStatus(Notification.permission)
      } catch {
        setPushStatus('unsupported')
      }
    } else {
      setPushStatus('unsupported')
    }

    // Safely check microphone permission via Permissions API (Safari throws if unhandled)
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).permissions?.query) {
        (navigator as any).permissions.query({ name: 'microphone' }).then((perm: any) => {
          setMicStatus(perm.state)
          perm.onchange = () => setMicStatus(perm.state)
        }).catch(() => {
          // Unsupported query in Safari/WebKit
        })
      }
    } catch {}
  }, [])

  // Heartbeat while online to keep last_seen_at updated in database
  useEffect(() => {
    if (!isOnline || !hostProfile?.id) return

    const interval = setInterval(async () => {
      try {
        await fetch('/api/host/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostId: hostProfile.id, isOnline: true })
        })
      } catch {}
    }, 30000)

    return () => clearInterval(interval)
  }, [isOnline, hostProfile?.id])

  // Screen Wake Lock while online
  useEffect(() => {
    if (isOnline) {
      requestScreenWakeLock().catch(() => {})
    } else {
      releaseScreenWakeLock()
    }
    return () => {
      releaseScreenWakeLock()
    }
  }, [isOnline])

  // Toggle Online/Offline with dual-layer database fallback
  const handleToggleOnline = async () => {
    setIsTogglingOnline(true)
    const nextOnline = !isOnline

    // Optimistic UI update so the slider responds instantly
    setIsOnline(nextOnline)

    try {
      // 1. Try Next.js Server Action
      let updateSucceeded = false
      try {
        const res = await toggleHostOnlineAction(nextOnline)
        if (res?.success) {
          updateSucceeded = true
        }
      } catch (actionErr) {
        console.warn('Server action failed, trying direct API route fallback:', actionErr)
      }

      // 2. Direct API route fallback (vital for incognito / restricted cookie environments)
      if (!updateSucceeded) {
        const apiRes = await fetch('/api/host/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostId: hostProfile.id, isOnline: nextOnline })
        })
        const apiJson = await apiRes.json()
        if (apiRes.ok && apiJson.success) {
          updateSucceeded = true
        } else {
          throw new Error(apiJson.error || 'Could not update host status in database')
        }
      }

      if (nextOnline) {
        toast.success("You are now ONLINE in the database and ready to receive calls!", {
          duration: 4000
        })
        requestScreenWakeLock().catch(() => {})
        if (pushStatus !== 'granted' && pushStatus !== 'unsupported') {
          enablePushNotifications()
        }
      } else {
        toast.info("You are now OFFLINE in the database. Incoming calls are paused.", {
          duration: 4000
        })
        releaseScreenWakeLock()
      }
    } catch (err: any) {
      // Revert state if both failed
      setIsOnline(!nextOnline)
      toast.error(err.message || 'Failed to update online status in database. Please check your internet connection.')
    } finally {
      setIsTogglingOnline(false)
    }
  }

  // Robust Microphone Testing across Chrome, Safari, Firefox, Edge & Incognito
  const testAndGrantMicrophone = async () => {
    setIsTestingMic(true)
    setShowMicHelp(false)
    setMicErrorMessage(null)
    setMicVolumeLevel(0)

    // 1. Check Secure Context requirement (Chrome/Safari block getUserMedia on plain HTTP)
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setIsTestingMic(false)
      setMicStatus('denied')
      const msg = 'Microphone access is restricted by browsers on non-HTTPS origins. Please access via https://'
      setMicErrorMessage(msg)
      setShowMicHelp(true)
      toast.error(msg, { duration: 6000 })
      return
    }

    // 2. Check if mediaDevices API is available
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setIsTestingMic(false)
      setMicStatus('denied')
      const msg = 'Audio devices (getUserMedia) not supported by your browser or disabled in incognito settings.'
      setMicErrorMessage(msg)
      setShowMicHelp(true)
      toast.error(msg, { duration: 6000 })
      return
    }

    try {
      // Request audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Microphone permission GRANTED! Now measure real volume using Web Audio API
      let streamTracksStopped = false
      const stopTracks = () => {
        if (!streamTracksStopped) {
          stream.getTracks().forEach((t) => t.stop())
          streamTracksStopped = true
        }
      }

      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          const ctx = new AudioCtx()
          if (ctx.state === 'suspended') {
            await ctx.resume().catch(() => {})
          }
          const source = ctx.createMediaStreamSource(stream)
          const analyser = ctx.createAnalyser()
          analyser.fftSize = 256
          source.connect(analyser)

          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          let count = 0

          // Visualizer loop for 2.5 seconds
          const interval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray)
            let sum = 0
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i]
            }
            const avg = Math.min(100, Math.round((sum / dataArray.length) / 1.5))
            setMicVolumeLevel(avg)
            count++
            if (count >= 12) {
              clearInterval(interval)
              setMicVolumeLevel(0)
              stopTracks()
              ctx.close().catch(() => {})
            }
          }, 200)
        } else {
          setTimeout(stopTracks, 1000)
        }
      } catch {
        stopTracks()
      }

      setMicStatus('granted')
      setShowMicHelp(false)
      toast.success('Microphone verified & allowed! Voice input is active and ready for calls.', {
        duration: 5000
      })
    } catch (err: any) {
      console.warn('[Microphone Permission Error]:', err)
      setMicStatus('denied')
      setShowMicHelp(true)

      let friendlyMsg = 'Microphone permission was not granted.'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyMsg = 'Microphone was blocked by your browser. Please allow it in the URL bar settings.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyMsg = 'No microphone device found. Please connect an earphone or microphone.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        friendlyMsg = 'Microphone is already occupied by another app (e.g. Zoom, Meet, or phone call).'
      }

      setMicErrorMessage(friendlyMsg)
      toast.error(friendlyMsg, { duration: 6000 })
    } finally {
      setIsTestingMic(false)
    }
  }

  // Web Audio Ringtone Chime Test
  const testRingtoneChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) {
        toast.info('AudioContext is not supported on this device.')
        return
      }
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.2) // E5
      osc2.frequency.setValueAtTime(659.25, now)
      osc2.frequency.setValueAtTime(783.99, now + 0.2) // G5

      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.6)
      osc2.stop(now + 0.6)

      toast.success('Ringtone chime played! If you heard the sound, your speaker is ready for incoming calls.', {
        duration: 4000
      })
    } catch (e: any) {
      toast.error('Could not play audio chime: ' + e?.message)
    }
  }

  // Push Notifications with incognito handling
  const enablePushNotifications = async () => {
    setIsSettingUpPush(true)
    try {
      const res = await registerHostPushSubscription(hostProfile.id)
      if (res.success) {
        setPushStatus('granted')
        toast.success('Screen-off call alerts enabled! You will be notified even when your phone screen is locked.')
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setPushStatus(Notification.permission)
        }
        toast.info(res.error || 'Push notifications could not be registered on this browser session.')
      }
    } catch {
      toast.error('Failed to setup push notifications on this browser.')
    } finally {
      setIsSettingUpPush(false)
    }
  }

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPrice(true)
    try {
      const res = await updateHostCallingPricingAction(Number(callPrice), 15)
      if (res.success) {
        toast.success(`Call pricing updated to ₹${callPrice} (${callPrice * 10} pts) per 15-minute call!`)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update pricing')
      }
    } catch {
      toast.error('An error occurred while updating pricing')
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  const isApprovedForCalling = Boolean(settings?.is_enabled)

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header with Clear Red/Green Toggle Switch Slider */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-widest uppercase text-indigo-600">
              Stranger Mingle
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Audio Call Service
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Phone a Friend Hub
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage your online availability, audio readiness, and per-session pricing.
          </p>
        </div>

        {isApprovedForCalling && (
          <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-3xl border border-gray-200">
            {/* The Clear Red & Green Toggle Switch Slider */}
            <button
              type="button"
              role="switch"
              aria-checked={isOnline}
              onClick={handleToggleOnline}
              disabled={isTogglingOnline}
              className={`relative inline-flex h-12 w-28 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 select-none ${
                isOnline 
                  ? 'bg-emerald-600 focus:ring-emerald-300 shadow-md shadow-emerald-500/30' 
                  : 'bg-rose-600 focus:ring-rose-300 shadow-md shadow-rose-500/30'
              }`}
            >
              <span className="sr-only">Toggle Online Status</span>
              {/* Inner label text on the switch */}
              <span className="absolute inset-0 flex items-center justify-between px-3 text-[11px] font-black uppercase tracking-wider text-white pointer-events-none">
                <span className={isOnline ? 'opacity-100' : 'opacity-0'}>ON</span>
                <span className={!isOnline ? 'opacity-100' : 'opacity-0'}>OFF</span>
              </span>
              {/* Sliding Knob */}
              <span
                className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
                  isOnline ? 'translate-x-16' : 'translate-x-0.5'
                }`}
              >
                {isTogglingOnline ? (
                  <Loader2 className={`w-5 h-5 animate-spin ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`} />
                ) : (
                  <Power className={`w-5 h-5 ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`} />
                )}
              </span>
            </button>

            {/* Clear Status text badge */}
            <div className="flex flex-col pr-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`text-xs font-black uppercase tracking-wider ${isOnline ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isOnline ? 'ONLINE • RECEIVING' : 'OFFLINE • PAUSED'}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 font-medium">
                {isOnline ? 'Callers across India can reach you' : 'Slide switch right to go online'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Call Readiness & Hardware Permissions Checklist */}
      <div className="bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-900 border border-indigo-900/40 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Host Call Readiness</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Hardware & Browser Permissions
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Verify your microphone, ringtone chime, and notification permissions to receive calls without interruption.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Mic Permission & Test Button */}
            <button
              onClick={testAndGrantMicrophone}
              disabled={isTestingMic}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                micStatus === 'granted'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                  : micStatus === 'denied'
                  ? 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-900/40'
              }`}
            >
              {isTestingMic ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : micStatus === 'granted' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              <span>
                {isTestingMic
                  ? 'Testing Voice Input...'
                  : micStatus === 'granted'
                  ? 'Microphone Ready ✓'
                  : micStatus === 'denied'
                  ? 'Allow Microphone (Blocked ⚠️)'
                  : 'Allow Microphone 🎙️'}
              </span>
            </button>

            {/* Test Audio Chime */}
            <button
              onClick={testRingtoneChime}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Test Ringtone 🔊</span>
            </button>
          </div>
        </div>

        {/* Live Audio Level Bar if microphone is actively being tested */}
        {isTestingMic && micVolumeLevel > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1">
              <span>Speaking detected...</span>
              <span>{micVolumeLevel}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-150"
                style={{ width: `${micVolumeLevel}%` }}
              />
            </div>
          </div>
        )}

        {/* Clear Instructions if Browser Blocked Microphone */}
        {showMicHelp && (
          <div className="bg-rose-950/70 border border-rose-800/80 rounded-2xl p-4 text-rose-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-100">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Browser Has Blocked Microphone Access</span>
            </div>
            <p className="text-rose-200/90 leading-relaxed font-normal">
              {micErrorMessage || 'Because browsers strictly guard privacy, once a permission is denied, the website cannot show the popup automatically.'}
            </p>
            <div className="bg-rose-900/50 rounded-xl p-3 border border-rose-800/50 space-y-1.5 text-zinc-200">
              <div className="font-bold text-white text-[11px] uppercase tracking-wider">How to unblock in 5 seconds:</div>
              <ol className="list-decimal list-inside space-y-1 text-xs text-rose-100">
                <li>Look at the address bar at the very top of your browser (where you see <span className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">strangermingle.com</span>).</li>
                <li>Click the <strong>🔒 Lock</strong> or <strong>🎛️ Settings</strong> icon next to the website address.</li>
                <li>Find <strong>Microphone</strong> and switch it from <em>Block</em> to <strong>Allow</strong>.</li>
                <li>Click the button below to re-verify.</li>
              </ol>
            </div>
            <button
              onClick={testAndGrantMicrophone}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-test Microphone Now
            </button>
          </div>
        )}
      </div>

      {/* Verification Notice */}
      {!isApprovedForCalling ? (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-amber-900">Phone a Friend Access Pending</h3>
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              This calling service is reserved for approved and verified hosts. Our administrative team will review your host profile and enable calling access shortly.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Alert Card: Mobile Screen-Off Push Notifications */}
          <div className={`rounded-3xl p-6 border transition-all ${
            pushStatus === 'granted'
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-indigo-50/70 border-indigo-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  pushStatus === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {pushStatus === 'granted' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Smartphone className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-gray-900">
                      Screen-Off Incoming Call Alerts
                    </h4>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      pushStatus === 'granted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {pushStatus === 'granted' ? 'Active on this Device' : 'Action Needed'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed max-w-2xl">
                    {pushStatus === 'granted'
                      ? 'Push notifications are enabled. Even if your phone screen is off or locked, you will receive high-priority call alerts and ringing notifications.'
                      : 'Ensure you receive calls when your phone is in your pocket or screen is turned off. Enable push notifications for this device.'}
                  </p>
                </div>
              </div>

              {pushStatus !== 'granted' && pushStatus !== 'unsupported' && (
                <button
                  type="button"
                  onClick={enablePushNotifications}
                  disabled={isSettingUpPush}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
                >
                  {isSettingUpPush ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                  Enable Screen-Off Alerts
                </button>
              )}
            </div>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed Calls</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {settings?.total_calls_completed || 0}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Talk Time</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {settings?.total_call_minutes || 0} Mins
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Caller Rating</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {settings?.rating_avg || '5.00'} / 5.0
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Settings Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-100/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  Call Pricing & Session Rate
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Set how much callers redeem (₹{callPrice} / {callPrice * 10} pts) per 15-minute 1-on-1 audio call session.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePricing} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 max-w-xl">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Price per 15-min Call (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={callPrice}
                    onChange={(e) => setCallPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPrice}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-sm"
              >
                {isUpdatingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Pricing
              </button>
            </form>
          </div>

          {/* Call History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Sessions</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                History of your 1-on-1 audio conversations with callers.
              </p>
            </div>

            {(!recentCalls || recentCalls.length === 0) ? (
              <div className="py-12 text-center text-gray-400 font-medium text-sm">
                No completed call sessions yet. Once users call you, they will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="py-3 px-4">Caller</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.map((call) => (
                      <tr key={call.id} className="border-b border-gray-100 text-xs font-medium text-gray-700">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {call.user?.anonymous_alias || 'Anonymous Caller'}
                        </td>
                        <td className="py-3 px-4">
                          {call.duration_seconds > 0 ? `${Math.round(call.duration_seconds / 60)} mins` : '-'}
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-[10px] text-gray-500">
                          {call.call_type}
                        </td>
                        <td className="py-3 px-4">
                          {call.user_rating ? (
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{call.user_rating}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(call.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
