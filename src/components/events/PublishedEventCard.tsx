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
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 flex flex-col h-full border-t-4 border-t-indigo-500">
      {/* Visual Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        <Image
          src={imgUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
        
        <div className="absolute top-4 right-4 capitalize">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950">Live</span>
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
          <h3 className="text-xl font-black text-zinc-950 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
            {event.title || 'Untitled Event'}
          </h3>
          <div className="flex items-center gap-4 text-zinc-400 font-bold text-[11px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 text-indigo-500" />
              {event.event_type === 'online' ? 'Online' : (event.city || 'TBD')}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-50 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Booked</p>
              <p className="text-sm font-black text-zinc-950 mt-1">{event.booking_count || 0}</p>
            </div>
          </div>
          <div className="bg-zinc-50 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Growth</p>
              <p className="text-sm font-black text-zinc-950 mt-1">Steady</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 grid grid-cols-2 gap-3 mt-auto">
          <Link href={`https://strangermingle.com/events/${event.slug}`} target="_blank" className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-11 rounded-xl border-gray-100 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-zinc-50 hover:border-zinc-200"
            >
              <Eye className="w-3.5 h-3.5" />
              Public View
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`} className="w-full">
            <Button 
              className="w-full h-11 rounded-xl bg-zinc-950 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-xl shadow-zinc-950/5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Manage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
