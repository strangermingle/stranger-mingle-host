'use client'

import { Heart, Calendar, Crown, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardOverviewProps {
  userId: string
  data: {
    hostPages: any[]
    events: any[]
  }
}

export function DashboardOverview({ userId, data }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { 
            label: 'Host Profile', 
            count: data.hostPages.length > 0 ? 1 : 0, 
            icon: <Crown className="h-4 w-4" />, 
            color: 'text-slate-600', 
            bg: 'bg-slate-50' 
          },
          { 
            label: 'Active Events', 
            count: data.events.filter((e: any) => e.status === 'published').length, 
            icon: <Calendar className="h-4 w-4" />, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50' 
          },
          { 
            label: 'Analytics Index', 
            count: data.hostPages.reduce((acc, p) => acc + (p.follower_count || 0), 0), 
            icon: <Heart className="h-4 w-4" />, 
            color: 'text-rose-600', 
            bg: 'bg-rose-50' 
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="mt-1 text-4xl font-black text-gray-900 group-hover:scale-110 transition-transform origin-left">{stat.count}</p>
              </div>
              <div className={`${stat.color} ${stat.bg} p-3 rounded-2xl group-hover:rotate-12 transition-all shadow-sm`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest  border-l-4 border-indigo-600 pl-4">Global Profile</h2>
            <Link href="/host-profile" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Edit Profile</Link>
         </div>
         <div className="grid gap-4">
            {data.hostPages.slice(0, 1).map((page: any) => (
              <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                     {page.logo_url && <img src={page.logo_url} className="h-full w-full object-cover" />}
                     {!page.logo_url && <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-400"><Users className="w-5 h-5" /></div>}
                   </div>
                   <div>
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{page.display_name}</h3>
                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Host Since {new Date(page.created_at).getFullYear()}</p>
                   </div>
                </div>
                <Link href={`/host-dashboard/${page.id}`} className="px-5 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all">
                  Enter Studio
                </Link>
              </div>
            ))}
            {data.hostPages.length === 0 && (
              <div className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest">
                No host profile set up
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
