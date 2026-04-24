'use client'

import { Calendar, PlusCircle, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ManageEventsViewProps {
  userId: string
  data: {
    events: any[]
    hostPages: any[]
  }
}

export function ManageEventsView({ userId, data }: ManageEventsViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest  border-l-4 border-indigo-600 pl-4">Manage Experiences</h2>
          <p className="text-xs font-bold text-gray-400 mt-2 ml-4 uppercase tracking-[0.2em]">Displaying all your events across all profiles</p>
        </div>
        <Link 
            href="/create-event"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          New Event
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.events.length > 0 ? (
          data.events.map((evt: any) => {
              const isPublished = evt.status === 'published'
              const isDraft = evt.status === 'draft'

              return (
              <div key={evt.id} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col">
                  <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                    {evt.cover_image_url ? (
                      <img src={evt.cover_image_url} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Calendar className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                          isPublished ? 'bg-emerald-500 text-white' : 
                          isDraft ? 'bg-amber-500 text-white' : 
                          'bg-zinc-500 text-white'
                        }`}>
                          {evt.status}
                        </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight line-clamp-1 mb-2">{evt.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                        <Clock className="w-3 h-3" />
                        {new Date(evt.start_datetime).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50/50 p-3 rounded-2xl">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Bookings</p>
                          <p className="text-sm font-black text-zinc-700">{evt.booking_count || 0}</p>
                        </div>
                        <div className="bg-gray-50/50 p-3 rounded-2xl">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Status</p>
                          <p className={`text-[10px] font-black uppercase ${isPublished ? 'text-emerald-600' : 'text-amber-600'}`}>{evt.status}</p>
                        </div>
                    </div>

                    <div className="mt-auto flex gap-2">
                        <Link 
                          href={`/host-dashboard/${evt.host_id}/events/${evt.id}/edit`}
                          className="flex-1 px-4 py-3 bg-zinc-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-xl text-center hover:bg-black transition-all"
                        >
                          Edit Details
                        </Link>
                        <Link 
                          href={`/events/${evt.slug}`}
                          className="px-4 py-3 bg-white border border-gray-100 text-zinc-400 rounded-xl hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center"
                          target="_blank"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                  </div>
              </div>
              )
          })
        ) : (
          <div className="col-span-full py-32 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Calendar className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 uppercase">Your Calendar is Empty</h3>
              <p className="text-zinc-400 mt-2 text-sm max-w-xs mx-auto">Create your first experience to start hosting on Stranger Mingle.</p>
              <Link href="/create-event" className="mt-8 inline-flex px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Create Event</Link>
          </div>
        )}
      </div>
    </div>
  )
}
