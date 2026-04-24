'use client'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, Edit3, Trash2, Eye, Users, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui'
import { deleteEventAction } from '@/actions/event.actions'
import { toast } from 'sonner'
import { useState } from 'react'

interface PublishedEventCardProps {
  event: {
    id: string
    title: string
    slug: string
    start_datetime: string
    cover_image_url: string | null
    vertical_poster_url: string | null
    event_type: string
    venue_name?: string
    city?: string
    booking_count?: number
  }
}

export function PublishedEventCard({ event }: PublishedEventCardProps) {
  const startDate = new Date(event.start_datetime || new Date())
  const formattedDate = startDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const imgUrl = event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 flex flex-col h-full border-t-4 border-t-indigo-600">
      {/* Visual Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        <Image
          src={imgUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
        
        <div className="absolute top-4 right-4">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 border border-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950">Active Now</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-sm flex items-center gap-1.5 ring-1 ring-zinc-950/5">
            {event.event_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-black text-zinc-950 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-[1.2] uppercase tracking-tighter">
            {event.title || 'Untitled Event'}
          </h3>
          <div className="flex items-center gap-4 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-lg">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-lg">
              <MapPinIcon className="w-3.5 h-3.5 text-indigo-500" />
              {event.event_type === 'online' ? 'Online' : (event.city || 'TBD')}
            </div>
          </div>
        </div>

        {/* Quick Stats — Matching Dashboard/Earnings Style */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-zinc-50/50 rounded-2xl p-4 flex flex-col gap-1 border border-zinc-100/50">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Bookings</p>
            <div className="flex items-center justify-between mt-1">
               <p className="text-lg font-black text-zinc-950">{event.booking_count || 0}</p>
               <Users className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="bg-zinc-50/50 rounded-2xl p-4 flex flex-col gap-1 border border-zinc-100/50">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Capacity</p>
            <div className="flex items-center justify-between mt-1">
               <p className="text-lg font-black text-zinc-950">Stable</p>
               <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 grid grid-cols-2 gap-3 mt-auto">
          <Link href={`https://strangermingle.com/events/${event.slug}`} target="_blank" className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-zinc-200 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-zinc-50 hover:border-zinc-300"
            >
              <Eye className="w-4 h-4" />
              View Live
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`} className="w-full">
            <Button 
              className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-xl shadow-zinc-950/10"
            >
              <Edit3 className="w-4 h-4" />
              Manage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
