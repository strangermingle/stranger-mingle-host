'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface VoiceRoomParams {
  appId: string
  channelName: string
  token: string
  account: string
}

export function useAgoraVoiceRoom({ appId, channelName, token, account }: VoiceRoomParams) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [remoteUserAudioOnline, setRemoteUserAudioOnline] = useState(false)
  const [localVolume, setLocalVolume] = useState(0)
  const [remoteVolume, setRemoteVolume] = useState(0)
  const [networkQuality, setNetworkQuality] = useState<'good' | 'fair' | 'poor'>('good')
  const [error, setError] = useState<string | null>(null)

  // Audio permission and autoplay states
  const [isMicBlocked, setIsMicBlocked] = useState(false)
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState<boolean | null>(null)
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false)

  const clientRef = useRef<any>(null)
  const localAudioTrackRef = useRef<any>(null)
  const remoteAudioTracksRef = useRef<Map<string | number, any>>(new Map())

  const leaveRoom = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop()
        localAudioTrackRef.current.close()
        localAudioTrackRef.current = null
      }
      if (clientRef.current) {
        await clientRef.current.leave()
        clientRef.current = null
      }
      remoteAudioTracksRef.current.clear()
      setIsConnected(false)
    } catch (err: any) {
      console.warn('Error during voice room leave:', err)
    }
  }, [])

  const toggleMute = useCallback(async () => {
    if (!localAudioTrackRef.current) return
    const nextMuted = !isMuted
    await localAudioTrackRef.current.setEnabled(!nextMuted)
    setIsMuted(nextMuted)
  }, [isMuted])

  // Resume playback if browser blocks autoplay
  const resumeAutoplay = useCallback(async () => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
      if (typeof (AgoraRTC as any).resumeAudioContext === 'function') {
        await (AgoraRTC as any).resumeAudioContext()
      }
      remoteAudioTracksRef.current.forEach((track) => {
        try {
          track.play()
        } catch {}
      })
      setIsAutoplayBlocked(false)
    } catch (err) {
      console.warn('Failed to resume autoplay in host room:', err)
    }
  }, [])

  // Retry/re-request mic permission
  const requestMicPermission = useCallback(async () => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default
      if (!clientRef.current) return

      let micTrack: any
      try {
        micTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          ANS: true,
          AGC: true,
        })
      } catch {
        micTrack = await AgoraRTC.createMicrophoneAudioTrack()
      }

      localAudioTrackRef.current = micTrack
      await clientRef.current.publish([micTrack])

      setIsMicBlocked(false)
      setIsMicPermissionGranted(true)
      setError(null)
    } catch (micErr: any) {
      console.warn('[VoiceRoom] Retry host mic failed:', micErr)
      setIsMicBlocked(true)
      setIsMicPermissionGranted(false)
      setError('Microphone permission denied. Please allow microphone access in your browser.')
    }
  }, [])

  useEffect(() => {
    if (!appId) {
      setError('Agora App ID is missing. Please ensure AGORA_APP_ID is configured in the environment variables.')
      return
    }
    if (!channelName || !token) {
      setError('Agora session credentials missing. Unable to join voice room.')
      return
    }

    let isMounted = true

    async function initCall() {
      try {
        console.log('[VoiceRoom] Host connecting to Agora channel:', channelName, 'with App ID:', appId?.slice(0, 6) + '...')
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default

        // Handle browser autoplay policy
        AgoraRTC.onAudioAutoplayFailed = () => {
          if (isMounted) {
            setIsAutoplayBlocked(true)
          }
        }

        // Create audio-focused RTC client
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
        clientRef.current = client

        // Enable real-time volume indicator
        client.enableAudioVolumeIndicator()
        client.on('volume-indicator', (volumes) => {
          if (!isMounted) return
          volumes.forEach((v) => {
            if (v.uid === account || String(v.uid) === String(account)) {
              setLocalVolume(v.level)
            } else {
              setRemoteVolume(v.level)
            }
          })
        })

        // Remote peer published audio track
        client.on('user-published', async (user, mediaType) => {
          if (mediaType === 'audio') {
            try {
              const remoteTrack = await client.subscribe(user, 'audio')
              remoteAudioTracksRef.current.set(user.uid, remoteTrack)
              remoteTrack.play()
              if (isMounted) setRemoteUserAudioOnline(true)
            } catch (trackErr) {
              console.warn('[VoiceRoom] Failed playing remote user track:', trackErr)
              if (isMounted) setIsAutoplayBlocked(true)
            }
          }
        })

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            remoteAudioTracksRef.current.delete(user.uid)
            if (isMounted) setRemoteUserAudioOnline(false)
          }
        })

        client.on('network-quality', (stats) => {
          if (!isMounted) return
          const uplink = stats.uplinkNetworkQuality
          if (uplink <= 2) setNetworkQuality('good')
          else if (uplink <= 4) setNetworkQuality('fair')
          else setNetworkQuality('poor')
        })

        // Join room using string account name or numeric UID
        await client.join(appId, channelName, token, account)

        if (isMounted) {
          setIsConnected(true)
          setError(null)
        }

        // Create microphone audio track with AEC, ANS, AGC and fallback
        try {
          let micTrack: any
          try {
            micTrack = await AgoraRTC.createMicrophoneAudioTrack({
              AEC: true,
              ANS: true,
              AGC: true,
            })
          } catch {
            micTrack = await AgoraRTC.createMicrophoneAudioTrack()
          }
          localAudioTrackRef.current = micTrack

          // Publish local mic track
          await client.publish([micTrack])

          if (isMounted) {
            setIsMicBlocked(false)
            setIsMicPermissionGranted(true)
          }
        } catch (micErr: any) {
          console.warn('[VoiceRoom] Failed to initialize microphone track:', micErr)
          if (isMounted) {
            setIsMicBlocked(true)
            setIsMicPermissionGranted(false)
            setError('Microphone access is blocked. Please allow microphone in your browser settings.')
          }
        }
      } catch (err: any) {
        console.error('[VoiceRoom] Failed to initialize audio call:', err)
        if (isMounted) {
          setError(err.message || 'Failed to connect to audio room')
        }
      }
    }

    initCall()

    return () => {
      isMounted = false
      leaveRoom()
    }
  }, [appId, channelName, token, account, leaveRoom])

  return {
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
    isMicPermissionGranted,
    isAutoplayBlocked,
    resumeAutoplay,
    requestMicPermission,
  }
}
