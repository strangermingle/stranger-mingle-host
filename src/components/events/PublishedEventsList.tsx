'use client'
import { useState } from 'react'
import { Search, Grid, LayoutList } from 'lucide-react'
import { PublishedEventCard } from './PublishedEventCard'

interface PublishedEventsListProps {
  initialEvents: any[]
}

export function PublishedEventsList({ initialEvents }: PublishedEventsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredEvents = initialEvents.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-12">
      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 p-4 rounded-[2.5rem] border border-zinc-100">
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search within published events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-6 rounded-[1.5rem] bg-white border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-indigo-50 font-black uppercase tracking-widest text-[10px] text-zinc-950 placeholder:text-zinc-400 shadow-sm transition-all"
          />
        </div>

        <div className="flex bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm self-stretch sm:self-auto">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
          >
            <Grid className="w-5 h-5 font-black" strokeWidth={3} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
          >
            <LayoutList className="w-5 h-5 font-black" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Events Grid/List */}
      {filteredEvents.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">No matching live events found</p>
        </div>
      ) : (
        <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredEvents.map(event => (
            <PublishedEventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
