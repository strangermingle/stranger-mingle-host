'use client'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, Edit3, Rocket } from 'lucide-react'
import { Button } from '@/components/ui'
import { sendGAEvent } from '@/lib/gtag'

interface DraftEventCardProps {
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
  }
}

export function DraftEventCard({ event }: DraftEventCardProps) {
  const startDate = new Date(event.start_datetime || new Date())
  const formattedDate = startDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const imgUrl = event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-amber-100/50 transition-all duration-500 flex flex-col h-full border-t-4 border-t-amber-400">
      {/* Visual Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
        <Image
          src={imgUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
        <div className="absolute top-4 right-4">
          <div className="bg-amber-400/95 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-950 shadow-xl border border-amber-300/20">
            Work in Progress
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
          <h3 className="text-xl font-black text-zinc-950 group-hover:text-amber-600 transition-colors line-clamp-2 leading-[1.2] uppercase tracking-tighter">
            {event.title || 'Untitled Event'}
          </h3>
          <div className="flex items-center gap-4 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-lg">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-lg">
              <MapPinIcon className="w-3.5 h-3.5 text-amber-500" />
              {event.event_type === 'online' ? 'Online' : (event.city || 'TBD')}
            </div>
          </div>
        </div>

        <div className="pt-2 bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100/50">
           <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2">Stage</p>
           <p className="text-xs font-bold text-zinc-600 italic leading-relaxed font-serif">&ldquo;Every masterpiece starts with a rough draft...&rdquo;</p>
        </div>

        {/* Actions — No Delete per policy */}
        <div className="pt-2 grid grid-cols-2 gap-3 mt-auto">
          <Link href={`/events/${event.id}/edit`} className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-zinc-200 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-zinc-50 hover:border-zinc-300"
              onClick={() => sendGAEvent({ action: 'click', category: 'events', label: 'edit_draft', event_id: event.id })}
            >
              <Edit3 className="w-4 h-4" />
              Resume
            </Button>
          </Link>
          <Link href={`/events/${event.id}/edit`} className="w-full">
            <Button 
              className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-xl shadow-zinc-950/10"
              onClick={() => sendGAEvent({ action: 'click', category: 'events', label: 'complete_publish_draft', event_id: event.id })}
            >
              <Rocket className="w-4 h-4" />
              Publish
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
