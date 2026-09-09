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

  const clientRef = useRef<any>(null)
  const localAudioTrackRef = useRef<any>(null)

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

  useEffect(() => {
    if (!appId || !channelName || !token) return

    let isMounted = true

    async function initCall() {
      try {
        // Dynamic import to avoid SSR errors
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default

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
            const remoteTrack = await client.subscribe(user, 'audio')
            remoteTrack.play()
            if (isMounted) setRemoteUserAudioOnline(true)
          }
        })

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
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

        // Create high quality microphone audio track with AEC, ANS, AGC
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'high_quality_stereo',
          AEC: true,
          ANS: true,
          AGC: true,
        })
        localAudioTrackRef.current = micTrack

        // Publish local mic track
        await client.publish([micTrack])

        if (isMounted) {
          setIsConnected(true)
          setError(null)
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
  }
}
