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
  AlertTriangle,
  Star,
  Volume2
} from 'lucide-react'
import { useAgoraVoiceRoom } from '@/hooks/useAgoraVoiceRoom'
import { endCallAction, submitHostCallerReviewAction } from '@/actions/call.actions'
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
  const initialElapsed = call?.actual_start_time
    ? Math.max(0, Math.floor((Date.now() - new Date(call.actual_start_time).getTime()) / 1000))
    : 0
  const [secondsElapsed, setSecondsElapsed] = useState(initialElapsed)
  const [isEnding, setIsEnding] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [callerRating, setCallerRating] = useState(5)
  const [callerNotes, setCallerNotes] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

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
    isMicBlocked,
    isAutoplayBlocked,
    resumeAutoplay,
    requestMicPermission,
  } = useAgoraVoiceRoom(agoraParams)

  // Dynamic duration auto-drop
  const durationLimitSeconds = (call?.duration_minutes || 15) * 60
  const remainingSeconds = Math.max(0, durationLimitSeconds - secondsElapsed)
  const isNearDrop = remainingSeconds <= 15 && remainingSeconds > 0

  // Timer (ticks reliably based on timestamp)
  useEffect(() => {
    const startTs = call?.actual_start_time
      ? new Date(call.actual_start_time).getTime()
      : Date.now() - (initialElapsed * 1000)

    const interval = setInterval(() => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startTs) / 1000))
      setSecondsElapsed(elapsed)
      if (elapsed >= durationLimitSeconds && !isEnding) {
        handleEndCall()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [call?.actual_start_time, durationLimitSeconds, isEnding, initialElapsed])

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
            setShowReviewModal(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [call?.id, leaveRoom])

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
      setShowReviewModal(true)
    } catch {
      toast.error('Failed to end call properly')
      setShowReviewModal(true)
    } finally {
      setIsEnding(false)
    }
  }

  const handleSubmitReview = async () => {
    setIsSubmittingReview(true)
    try {
      await submitHostCallerReviewAction({
        callId: call.id,
        rating: callerRating,
        notes: callerNotes,
      })
      toast.success('Caller feedback submitted successfully')
      router.push('/phone-a-friend')
    } catch {
      toast.error('Failed to save feedback')
      router.push('/phone-a-friend')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleSkipReview = () => {
    router.push('/phone-a-friend')
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

        {/* Prominent Host Live Call Time Display */}
        <div className="flex flex-col items-center gap-1.5 py-1.5 px-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl max-w-xs w-full">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Live Session</span>
            </div>
            <span className="text-zinc-700 font-light">|</span>
            <span className="font-mono text-xl font-black text-white tracking-widest">
              {formatTimer(secondsElapsed)}
            </span>
            <span className="text-zinc-600 font-mono text-xs">/</span>
            <span className="font-mono text-xs text-zinc-400">
              {formatTimer(durationLimitSeconds)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{remainingSeconds > 0 ? `${formatTimer(remainingSeconds)} left in paid session` : 'Session ending...'}</span>
          </div>
        </div>

        {/* Autoplay blocked banner */}
        {isAutoplayBlocked && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-medium flex items-center justify-between gap-3 max-w-md w-full shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Audio is muted by browser</span>
            </div>
            <button
              type="button"
              onClick={resumeAutoplay}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0"
            >
              Tap to Unmute
            </button>
          </div>
        )}

        {/* Microphone blocked banner */}
        {isMicBlocked && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex flex-col items-center gap-2 text-center max-w-md w-full shadow-lg">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <MicOff className="w-4 h-4" />
              <span>Microphone Access Blocked</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Your browser is blocking microphone access. Please allow microphone permissions in your browser URL bar, then click below.
            </p>
            <button
              type="button"
              onClick={requestMicPermission}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
            >
              Enable Microphone
            </button>
          </div>
        )}

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

      {/* Post-Call Host Caller Rating & Notes Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 text-white border border-zinc-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 text-center relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                Private Host Review
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Rate This Caller
              </h3>
              <p className="text-xs text-zinc-400">
                How was your conversation with <span className="text-zinc-200 font-bold">{callerName}</span>? This feedback is private and only seen by hosts.
              </p>
            </div>

            {/* 1-5 Star Rating */}
            <div className="flex items-center justify-center gap-2 relative z-10 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCallerRating(star)}
                  className="p-1 hover:scale-125 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= callerRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Host Private Notes Textarea */}
            <div className="space-y-2 text-left relative z-10">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Private Host Notes
              </label>
              <textarea
                value={callerNotes}
                onChange={(e) => setCallerNotes(e.target.value)}
                placeholder="E.g., Respectful, good listener... (Not visible to caller)"
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 relative z-10 pt-2">
              <button
                type="button"
                onClick={handleSkipReview}
                disabled={isSubmittingReview}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider border border-zinc-800 transition-all"
              >
                Skip
              </button>

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Submit & Finish'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
