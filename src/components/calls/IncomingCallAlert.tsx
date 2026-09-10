'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { respondToCallAction, getCallerReputationAction } from '@/actions/call.actions'
import { Phone, PhoneOff, User, Loader2, Star, MessageSquare, ShieldCheck, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

interface IncomingCallAlertProps {
  hostId: string
}

export default function IncomingCallAlert({ hostId }: IncomingCallAlertProps) {
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const incomingCallRef = useRef<any>(null)
  incomingCallRef.current = incomingCall

  const [callerReputation, setCallerReputation] = useState<{
    totalCalls: number
    averageRating: number | null
    ratingCount: number
    recentNotes: string[]
  } | null>(null)
  const [isResponding, setIsResponding] = useState(false)
  const router = useRouter()
  const audioContextRef = useRef<AudioContext | null>(null)
  const ringIntervalRef = useRef<any>(null)

  // Gentle synthesizer ringtone via Web Audio API
  const startRingtone = useCallback(() => {
    try {
      if (ringIntervalRef.current) return
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      audioContextRef.current = ctx

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      const playChime = () => {
        if (!audioContextRef.current) return
        const actx = audioContextRef.current
        if (actx.state === 'suspended') {
          actx.resume().catch(() => {})
        }
        const now = actx.currentTime

        // 2-tone melodic chime
        const osc1 = actx.createOscillator()
        const osc2 = actx.createOscillator()
        const gainNode = actx.createGain()

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(523.25, now) // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.2) // E5

        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(659.25, now)
        osc2.frequency.setValueAtTime(783.99, now + 0.2) // G5

        gainNode.gain.setValueAtTime(0.2, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

        osc1.connect(gainNode)
        osc2.connect(gainNode)
        gainNode.connect(actx.destination)

        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.6)
        osc2.stop(now + 0.6)
      }

      playChime()
      ringIntervalRef.current = setInterval(playChime, 2200)

      // Vibration on mobile devices
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([500, 250, 500, 250, 500])
      }
    } catch (e) {
      console.warn('AudioContext ringtone warning:', e)
    }
  }, [])

  const stopRingtone = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current)
      ringIntervalRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
  }, [])

  const triggerBrowserNotification = (call: any) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification('📞 Incoming Stranger Mingle Voice Call!', {
          body: `A member is calling you (₹${call.amount || 49}). Tap to answer immediately!`,
          tag: `incoming-call-${call.id}`,
          requireInteraction: true,
        })
        n.onclick = () => {
          window.focus()
          n.close()
        }
      } catch {}
    }
  }

  // Active call poller & realtime listener
  useEffect(() => {
    if (!hostId) return

    const supabase = createClient()

    // 1. Direct fetch for active ringing calls
    const checkForActiveRingingCalls = async () => {
      try {
        const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
        const { data, error } = await (supabase as any)
          .from('phone_a_friend_calls')
          .select('*')
          .eq('host_id', hostId)
          .eq('status', 'ringing')
          .gte('created_at', oneMinuteAgo)
          .order('created_at', { ascending: false })
          .limit(1)

        if (!error && data && data.length > 0) {
          const currentRinging = data[0] as any
          if (!incomingCallRef.current || incomingCallRef.current.id !== currentRinging.id) {
            setIncomingCall(currentRinging)
            startRingtone()
            triggerBrowserNotification(currentRinging)
          }
        } else if (incomingCallRef.current) {
          // No ringing call found anymore
          stopRingtone()
          setIncomingCall(null)
        }
      } catch (pollErr) {
        console.warn('[IncomingCallAlert] Polling error:', pollErr)
      }
    }

    // Check immediately on mount and on window focus
    checkForActiveRingingCalls()
    const handleFocus = () => checkForActiveRingingCalls()
    window.addEventListener('focus', handleFocus)

    // Poll every 3 seconds as a resilient fallback
    const pollInterval = setInterval(checkForActiveRingingCalls, 3000)

    // 2. Supabase Realtime channel for instant push alerts
    const channel = supabase
      .channel(`incoming_calls_${hostId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'phone_a_friend_calls',
          filter: `host_id=eq.${hostId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.status === 'ringing') {
            setIncomingCall(payload.new)
            startRingtone()
            triggerBrowserNotification(payload.new)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'phone_a_friend_calls',
          filter: `host_id=eq.${hostId}`,
        },
        (payload: any) => {
          if (payload.new) {
            if (payload.new.status === 'ringing') {
              setIncomingCall(payload.new)
              startRingtone()
            } else if (
              incomingCallRef.current?.id === payload.new.id &&
              ['cancelled', 'rejected', 'missed', 'completed'].includes(payload.new.status)
            ) {
              stopRingtone()
              setIncomingCall(null)
            }
          }
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(pollInterval)
      stopRingtone()
      supabase.removeChannel(channel)
    }
  }, [hostId, startRingtone, stopRingtone])

  // Fetch caller reputation when an incoming call arrives
  useEffect(() => {
    if (incomingCall?.user_id) {
      getCallerReputationAction(incomingCall.user_id)
        .then((rep) => setCallerReputation(rep))
        .catch(() => setCallerReputation(null))
    } else {
      setCallerReputation(null)
    }
  }, [incomingCall?.user_id])

  const handleAccept = async () => {
    if (!incomingCall) return
    setIsResponding(true)

    // Verify microphone permission before accepting incoming call
    try {
      if (typeof window !== 'undefined' && navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
      }
    } catch (permErr: any) {
      console.warn('Microphone permission check failed on host accept:', permErr)
      setIsResponding(false)
      toast.error('Microphone permission is required to accept calls. Please allow microphone in your browser settings.')
      return
    }

    stopRingtone()

    try {
      const res = await respondToCallAction(incomingCall.id, 'accept')
      if (res.success) {
        toast.success('Call accepted! Connecting to audio room...')
        window.location.assign(`/phone-a-friend/call/${incomingCall.id}`)
      } else {
        toast.error(res.error || 'Failed to accept call')
        setIsResponding(false)
      }
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred while accepting the call')
      setIsResponding(false)
    }
  }

  const handleReject = async () => {
    if (!incomingCall) return
    setIsResponding(true)
    stopRingtone()

    try {
      await respondToCallAction(incomingCall.id, 'reject')
      toast.info('Call declined')
      setIncomingCall(null)
    } catch {
      toast.error('Failed to decline call')
      setIncomingCall(null)
    } finally {
      setIsResponding(false)
    }
  }

  if (!incomingCall) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-zinc-950 text-white border border-zinc-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-8 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulse animation icon */}
        <div className="relative mx-auto w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
          <Phone className="w-10 h-10 text-emerald-400 relative z-10 animate-bounce" />
        </div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Incoming Audio Call
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            A friend is calling you
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Session: 1-on-1 private voice call • ₹{incomingCall.amount}
          </p>
        </div>

        {/* Caller Reputation & Previous Host Reviews (Private to Host) */}
        {callerReputation && (
          <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 text-left space-y-2.5 relative z-10 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Host Rating</span>
              </div>
              {callerReputation.averageRating !== null ? (
                <span className="inline-flex items-center gap-1 font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {callerReputation.averageRating} / 5 ({callerReputation.ratingCount} {callerReputation.ratingCount === 1 ? 'review' : 'reviews'})
                </span>
              ) : (
                <span className="text-zinc-500 font-medium italic">New Caller (No ratings yet)</span>
              )}
            </div>

            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800/60">
              <span className="text-[11px]">Past Completed Calls:</span>
              <span className="font-bold text-zinc-200">{callerReputation.totalCalls}</span>
            </div>

            {callerReputation.recentNotes && callerReputation.recentNotes.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-zinc-400" />
                  Notes from Hosts:
                </div>
                {callerReputation.recentNotes.slice(0, 2).map((note, i) => (
                  <p key={i} className="text-zinc-300 text-[11px] bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/70 italic">
                    &ldquo;{note}&rdquo;
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 relative z-10 pt-2">
          {/* Decline button */}
          <button
            onClick={handleReject}
            disabled={isResponding}
            className="flex-1 py-4 px-6 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-zinc-700"
          >
            <PhoneOff className="w-4 h-4 text-red-400" />
            Decline
          </button>

          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={isResponding}
            className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 border border-emerald-400/30 active:scale-95"
          >
            {isResponding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
