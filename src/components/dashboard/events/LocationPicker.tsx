'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Loader2, X, Search } from 'lucide-react'
import { getLocationsAction } from '@/actions/location.actions'
import { Button, Input } from '@/components/ui'
import LocationForm from './LocationForm'

interface Location {
  id: string
  venue_name: string | null
  city: string
  address_line1?: string | null
}

interface LocationPickerProps {
  selectedId: string
  onSelect: (id: string) => void
}

export default function LocationPicker({ selectedId, onSelect }: LocationPickerProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setLoading(true)
    const result = await getLocationsAction()
    if (result.success && result.locations) {
      setLocations(result.locations)
    }
    setLoading(false)
  }

  const filteredLocations = locations.filter(loc => 
    (loc.venue_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedLocation = locations.find(loc => loc.id === selectedId)

  return (
    <div className="relative w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Event Location</label>
        <button 
          type="button"
          onClick={() => setShowForm(true)}
          className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add New Venue
        </button>
      </div>

      <div className="relative group">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full min-h-[50px] px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedLocation ? 'border-zinc-950 bg-white' : 'border-gray-100 bg-gray-50'}`}
        >
          <MapPin className={`w-4 h-4 ${selectedLocation ? 'text-indigo-600' : 'text-gray-400'}`} />
          <div className="flex-1 text-left">
            {selectedLocation ? (
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-tight">{selectedLocation.venue_name}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{selectedLocation.city}</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-400">Select a saved venue...</span>
            )}
          </div>
          <Search className="w-4 h-4 text-gray-300 group-hover:text-zinc-400 transition-colors" />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] max-h-[300px] overflow-hidden flex flex-col">
            <div className="p-2">
              <Input 
                autoFocus
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 text-xs border-zinc-100 bg-zinc-50 rounded-lg"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-300 mx-auto" />
                </div>
              ) : filteredLocations.length > 0 ? (
                <div className="space-y-1">
                  {filteredLocations.map(loc => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        onSelect(loc.id)
                        setIsOpen(false)
                        setSearchTerm('')
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 hover:bg-zinc-50 ${selectedId === loc.id ? 'bg-indigo-50/50 ring-1 ring-indigo-100' : ''}`}
                    >
                      <MapPin className={`w-3.5 h-3.5 ${selectedId === loc.id ? 'text-indigo-600' : 'text-zinc-400'}`} />
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase ${selectedId === loc.id ? 'text-indigo-900' : 'text-zinc-900'}`}>{loc.venue_name || 'Unnamed Venue'}</span>
                        <span className="text-[9px] font-bold text-zinc-400 tracking-wider font-mono">{loc.city}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No matching venues found</p>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      setShowForm(true)
                    }}
                    className="text-[11px] font-black uppercase text-indigo-600 underline"
                  >
                    Create "{searchTerm}" instead?
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay for Add New Location */}
      {showForm && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-xl shadow-2xl relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
            
            <div className="mb-8 space-y-2">
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tighter">Add New <span className="text-indigo-600">Legendary</span> Venue</h2>
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Saved locations are available for all your future events.</p>
            </div>

            <LocationForm 
              onSuccess={(loc) => {
                fetchLocations()
                onSelect(loc.id)
                setShowForm(false)
              }} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
