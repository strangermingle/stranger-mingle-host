'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Wifi,
  Loader2,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { useAgoraVoiceRoom } from '@/hooks/useAgoraVoiceRoom'
import { endCallAction } from '@/actions/call.actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface HostCallRoomProps {
  call: any
  agoraParams: {
    appId: string
    channelName: string
    token: string
    account: string
  }
}

export default function HostCallRoom({ call, agoraParams }: HostCallRoomProps) {
  const router = useRouter()
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [isEnding, setIsEnding] = useState(false)
  const [hostNotes, setHostNotes] = useState('')

  const {
    isConnected,
    isMuted,
    toggleMute,
    leaveRoom,
    remoteUserAudioOnline,
    localVolume,
    remoteVolume,
    networkQuality,
    error,
  } = useAgoraVoiceRoom(agoraParams)

  // Timer
  useEffect(() => {
    if (!isConnected) return
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isConnected])

  // Remote termination listener (when user ends or cancels the call)
  useEffect(() => {
    if (!call?.id) return
    const supabase = createClient()
    if (!supabase || !supabase.channel) return

    const channel = supabase
      .channel(`host_call_room_status_${call.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'phone_a_friend_calls',
          filter: `id=eq.${call.id}`,
        },
        async (payload: any) => {
          if (payload.new && ['completed', 'rejected', 'cancelled'].includes(payload.new.status)) {
            try {
              await leaveRoom()
            } catch {}
            toast.info('Call ended')
            router.push('/phone-a-friend')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [call?.id, leaveRoom, router])

  // Dynamic duration auto-drop
  const durationLimitSeconds = (call?.duration_minutes || 15) * 60
  const remainingSeconds = Math.max(0, durationLimitSeconds - secondsElapsed)
  const isNearDrop = isConnected && remainingSeconds <= 15 && remainingSeconds > 0

  useEffect(() => {
    if (!isConnected) return
    if (secondsElapsed >= durationLimitSeconds && !isEnding) {
      handleEndCall()
    }
  }, [secondsElapsed, isConnected, durationLimitSeconds, isEnding])

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndCall = async () => {
    if (isEnding) return
    setIsEnding(true)
    try {
      await leaveRoom()
      await endCallAction(call.id)
      toast.success('Call ended successfully')
      router.push('/phone-a-friend')
    } catch {
      toast.error('Failed to end call properly')
      router.push('/phone-a-friend')
    } finally {
      setIsEnding(false)
    }
  }

  const callerName = call.user?.anonymous_alias || call.user?.username || 'Anonymous Caller'

  return (
    <div className="min-h-[85vh] bg-zinc-950 text-white rounded-[2.5rem] border border-zinc-800/80 p-6 md:p-12 relative overflow-hidden flex flex-col justify-between shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 15-Second Grace Warning Banner */}
      {isNearDrop && (
        <div className="relative z-20 mb-4 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Session duration expiring. Call will drop gracefully in <strong>{remainingSeconds}s</strong>.</span>
          </div>
          <span className="text-[11px] font-bold text-amber-300">Auto-Wrapping Up</span>
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-white uppercase">
              Phone a Friend
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isConnected ? 'Connected • Live Audio' : 'Connecting Audio Room...'}
              </span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-[11px] font-medium text-zinc-400">100% Private</span>
            </div>
          </div>
        </div>

        {/* Network and Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300">
            <Wifi className={`w-3.5 h-3.5 ${networkQuality === 'good' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="capitalize">{networkQuality} Audio</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 font-mono text-sm font-black text-white">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Center Stage: Caller Avatar & Voice Waveform */}
      <div className="relative z-10 my-12 flex flex-col items-center justify-center text-center space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-bold max-w-md">
            {error}
          </div>
        )}

        {/* Avatar with dynamic reactive ring */}
        <div className="relative flex items-center justify-center">
          {/* Animated rings based on remote speaking volume */}
          <div
            className="absolute rounded-full border border-indigo-500/20 transition-all duration-100 ease-out pointer-events-none"
            style={{
              width: `${160 + remoteVolume * 1.5}px`,
              height: `${160 + remoteVolume * 1.5}px`,
              opacity: remoteVolume > 5 ? 0.8 : 0.2,
            }}
          />
          <div
            className="absolute rounded-full bg-indigo-600/10 blur-xl transition-all duration-100 ease-out pointer-events-none"
            style={{
              width: `${140 + remoteVolume * 1.2}px`,
              height: `${140 + remoteVolume * 1.2}px`,
              opacity: remoteVolume > 5 ? 0.6 : 0.1,
            }}
          />

          <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-900 to-indigo-950 border-2 border-zinc-700 flex items-center justify-center shadow-2xl overflow-hidden">
            <span className="text-4xl font-black text-white tracking-wider">
              {callerName.substring(0, 2).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white tracking-tight">{callerName}</h3>
          <p className="text-xs text-zinc-400 font-medium">
            {remoteUserAudioOnline ? 'Speaking...' : 'Listening...'}
          </p>
        </div>

        {/* Local mic level feedback indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-[11px] font-bold text-zinc-400">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isMuted ? '#ef4444' : localVolume > 5 ? '#10b981' : '#6b7280' }} />
          <span>{isMuted ? 'Microphone Muted' : 'Your Mic is Live'}</span>
        </div>
      </div>

      {/* Bottom Controls Dock */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 border-t border-zinc-800/80">
        <div className="flex items-center gap-4">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-500/10 border-2 border-red-500/40 text-red-400 hover:bg-red-500/20'
                : 'bg-zinc-800 border-2 border-zinc-700 text-white hover:bg-zinc-700 shadow-lg'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call */}
          <button
            onClick={handleEndCall}
            disabled={isEnding}
            className="h-14 px-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-950 transition-all border border-red-500/30"
          >
            {isEnding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <PhoneOff className="w-5 h-5" />
            )}
            End Session
          </button>
        </div>
      </div>
    </div>
  )
}
