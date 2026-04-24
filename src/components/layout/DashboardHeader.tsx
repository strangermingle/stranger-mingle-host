'use client'

import Link from 'next/link'
import { logoutAction } from '@/actions/auth.actions'
import { NotificationBell } from '@/components/layout/NotificationBell'

interface DashboardHeaderProps {
  user: {
    id: string
    email?: string
  }
  dbUser: {
    id: string
    username?: string
    avatar_url?: string | null
  }
}

export function DashboardHeader({ user, dbUser }: DashboardHeaderProps) {
  const displayName = dbUser?.username || user?.email?.split('@')[0] || 'Host'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="fixed top-0 left-0 right-0 z-[10000] h-[73px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
      {/* Logo / Brand */}
      <Link href="/" className="flex items-center gap-2 select-none">
        <span className="text-indigo-600 font-black text-xl tracking-tight">SM</span>
        <span className="hidden md:block text-gray-800 font-semibold text-sm">Host Dashboard</span>
      </Link>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        <NotificationBell userId={dbUser.id} />

        <div className="flex items-center gap-2">
          {dbUser?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dbUser.avatar_url}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-100"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm ring-2 ring-indigo-50">
              {initial}
            </div>
          )}
          <span className="hidden md:block text-sm font-medium text-gray-700 truncate max-w-[120px]">
            {displayName}
          </span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
