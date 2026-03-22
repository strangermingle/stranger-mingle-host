'use client'
import { useState } from 'react'
import { DraftEventCard } from './DraftEventCard'
import { LayoutGrid, LayoutList, Search } from 'lucide-react'
import { Input } from '@/components/ui'

interface DraftsListProps {
  initialDrafts: any[]
}

export function DraftsList({ initialDrafts }: DraftsListProps) {
  const [drafts, setDrafts] = useState(initialDrafts)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')

  const handleDelete = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id))
  }

  const filteredDrafts = drafts.filter(d => 
    d.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-12">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-zinc-100">
        <div className="flex items-center gap-1.5 font-black uppercase text-[14px]">
          <span className="text-zinc-950">{filteredDrafts.length}</span>
          <span className="text-zinc-400">Total Drafts found</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-zinc-950 transition-colors" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..." 
              className="h-12 w-full md:w-64 pl-12 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 shadow-sm transition-all font-bold text-sm"
            />
          </div>
          
          <div className="h-12 p-1.5 bg-zinc-100 rounded-2xl flex items-center shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20' : 'space-y-6 pb-20'}>
        {filteredDrafts.map(draft => (
          <DraftEventCard 
            key={draft.id} 
            event={draft} 
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {filteredDrafts.length === 0 && search && (
        <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border border-zinc-100">
           <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px]">No matches for "{search}" found on this set.</p>
        </div>
      )}
    </div>
  )
}
