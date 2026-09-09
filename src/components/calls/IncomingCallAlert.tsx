'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { respondToCallAction } from '@/actions/call.actions'
import { Phone, PhoneOff, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface IncomingCallAlertProps {
  hostId: string
}

export default function IncomingCallAlert({ hostId }: IncomingCallAlertProps) {
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [isResponding, setIsResponding] = useState(false)
  const router = useRouter()
  const audioContextRef = useRef<AudioContext | null>(null)
  const ringIntervalRef = useRef<any>(null)

  // Start gentle synthesizer ringtone via Web Audio API
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      audioContextRef.current = new AudioCtx()

      const playChime = () => {
        if (!audioContextRef.current) return
        const ctx = audioContextRef.current
        const now = ctx.currentTime

        // 2-tone melodic chime
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(523.25, now) // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.2) // E5

        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(659.25, now)
        osc2.frequency.setValueAtTime(783.99, now + 0.2) // G5

        gainNode.gain.setValueAtTime(0.15, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

        osc1.connect(gainNode)
        osc2.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc1.start(now)
        osc2.start(now)
        osc1.stop(now + 0.6)
        osc2.stop(now + 0.6)
      }

      playChime()
      ringIntervalRef.current = setInterval(playChime, 2200)
    } catch (e) {
      console.warn('AudioContext ringtone unavailable:', e)
    }
  }

  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current)
      ringIntervalRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
  }

  useEffect(() => {
    if (!hostId) return

    const supabase = createClient()

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
        (payload) => {
          if (payload.new && payload.new.status === 'ringing') {
            setIncomingCall(payload.new)
            startRingtone()
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
        (payload) => {
          if (payload.new) {
            if (payload.new.status === 'ringing') {
              setIncomingCall(payload.new)
              startRingtone()
            } else if (
              incomingCall?.id === payload.new.id &&
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
      stopRingtone()
      supabase.removeChannel(channel)
    }
  }, [hostId, incomingCall?.id])

  const handleAccept = async () => {
    if (!incomingCall) return
    setIsResponding(true)
    stopRingtone()

    try {
      const res = await respondToCallAction(incomingCall.id, 'accept')
      if (res.success) {
        toast.success('Call accepted! Connecting to audio room...')
        router.push(`/phone-a-friend/call/${incomingCall.id}`)
      } else {
        toast.error(res.error || 'Failed to accept call')
        setIncomingCall(null)
      }
    } catch {
      toast.error('An error occurred while accepting the call')
      setIncomingCall(null)
    } finally {
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
