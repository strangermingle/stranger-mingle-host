'use client'

import React from 'react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

/**
 * Host-dashboard provider: initializes notification subscriptions only.
 * Messaging / favorites / search listeners have been removed (not in scope).
 */
export function RealtimeProvider({
  userId,
  children,
}: {
  userId?: string
  children: React.ReactNode
}) {
  useRealtimeNotifications(userId)
  return <>{children}</>
}
