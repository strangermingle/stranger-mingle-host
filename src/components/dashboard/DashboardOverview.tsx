'use client'

import { useEffect } from 'react'
import {
  Calendar,
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  FileEdit,
  ArrowUpRight,
  Star,
  Ticket,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { sendGAEvent, setGAUserProperties } from '@/lib/gtag'
import { format } from 'date-fns'

interface DashboardOverviewProps {
  userId: string
  data: {
    hostPages: any[]
    events: any[]
  }
}

function QuickStatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  href,
}: {
  label: string
  value: string | number
  icon: any
  color: string
  bg: string
  href?: string
}) {
  const Card = (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="mt-2 text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">
            {value}
          </p>
        </div>
        <div className={`${color} ${bg} p-3 rounded-2xl group-hover:rotate-6 transition-all shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">View Details</span>
          <ArrowUpRight className="w-3 h-3 text-indigo-600" />
        </div>
      )}
    </div>
  )

  return href ? <Link href={href}>{Card}</Link> : Card
}

export function DashboardOverview({ userId, data }: DashboardOverviewProps) {
  const hostPage = data.hostPages[0]

  useEffect(() => {
    sendGAEvent({
      action: 'page_view',
      category: 'dashboard',
      label: 'overview',
      host_id: hostPage?.id,
    })
    if (hostPage) {
      setGAUserProperties({
        host_id: hostPage.id,
        host_name: hostPage.display_name,
        host_type: hostPage.host_type,
      })
    }
  }, [hostPage])

  const publishedEvents = data.events.filter((e: any) => e.status === 'published')
  const draftEvents = data.events.filter((e: any) => e.status === 'draft')
  const upcomingEvents = publishedEvents.filter((e: any) => new Date(e.start_datetime) > new Date())
  const pastEvents = publishedEvents.filter((e: any) => new Date(e.end_datetime) < new Date())

  return (
    <div className="space-y-8">
      {/* Host Status Banner */}
      {hostPage && (
        <div className="relative bg-gradient-to-r from-zinc-950 to-zinc-800 rounded-3xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-[40%] w-[200px] h-[200px] rounded-full bg-violet-500/10 blur-[60px]" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 shrink-0">
              {hostPage.logo_url || hostPage.profile_image ? (
                <img src={hostPage.logo_url || hostPage.profile_image} className="h-full w-full object-cover" alt="" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white/30">
                  <Crown className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-white tracking-tight truncate">{hostPage.display_name}</h2>
              <p className="text-xs text-zinc-400 font-medium mt-0.5">
                {hostPage.tagline || `Active Host Since ${new Date(hostPage.created_at).getFullYear()}`}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${hostPage.is_approved ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {hostPage.is_approved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-black uppercase tracking-widest">{hostPage.is_approved ? 'Approved' : 'Pending'}</span>
              </div>
              <Link
                href="/profile"
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-white/5"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          label="Published Events"
          value={publishedEvents.length}
          icon={Calendar}
          color="text-indigo-600"
          bg="bg-indigo-50"
          href="/events/published"
        />
        <QuickStatCard
          label="Drafts"
          value={draftEvents.length}
          icon={FileEdit}
          color="text-amber-600"
          bg="bg-amber-50"
          href="/events/drafts"
        />
        <QuickStatCard
          label="Total Revenue"
          value={`₹${parseFloat(hostPage?.total_revenue || '0').toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="text-green-600"
          bg="bg-green-50"
          href="/billing/earnings"
        />
        <QuickStatCard
          label="Tickets Sold"
          value={hostPage?.total_tickets_sold || 0}
          icon={Ticket}
          color="text-purple-600"
          bg="bg-purple-50"
          href="/attendance/all"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickStatCard
          label="Followers"
          value={hostPage?.follower_count || 0}
          icon={Users}
          color="text-rose-600"
          bg="bg-rose-50"
        />
        <QuickStatCard
          label="Average Rating"
          value={`${hostPage?.rating_avg?.toFixed(1) || '0.0'} ★`}
          icon={Star}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <QuickStatCard
          label="Total Events"
          value={hostPage?.total_events_hosted || 0}
          icon={TrendingUp}
          color="text-cyan-600"
          bg="bg-cyan-50"
        />
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Upcoming Events</h2>
          </div>
          <Link href="/events/published" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
            View All
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {upcomingEvents.slice(0, 5).map((event: any) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}/edit`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-100 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{event.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {format(new Date(event.start_datetime), 'dd MMM yyyy · hh:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                    {event.status}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No upcoming events</p>
            <Link href="/events/create" className="inline-flex mt-4 px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors">
              Create Event
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Create Event', href: '/events/create', icon: Calendar, color: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' },
          { label: 'View Attendance', href: '/attendance/events', icon: Users, color: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-gray-100' },
          { label: 'Check Earnings', href: '/billing/earnings', icon: TrendingUp, color: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-gray-100' },
          { label: 'Scan Tickets', href: '/attendance/scanner', icon: Eye, color: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-gray-100' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-lg ${action.color}`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
