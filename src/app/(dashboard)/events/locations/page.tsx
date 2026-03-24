'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Search, Loader2, Globe, ArrowRight } from 'lucide-react'
import { getLocationsAction } from '@/actions/location.actions'
import { Button, Input } from '@/components/ui'
import LocationForm from '@/components/events/LocationForm'

interface Location {
  id: string
  venue_name: string | null
  address_line1: string | null
  city: string
  state: string | null
  postal_code: string | null
  google_maps_url: string | null
}

export default function EventLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Your <span className="text-indigo-600">Venues</span></h1>
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Manage saved locations for lighting-fast event creation.</p>
        </div>
        
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={`h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl hover:shadow-2xl ${showForm ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200 shadow-none' : 'bg-zinc-950 text-white hover:bg-zinc-800'}`}
        >
          {showForm ? 'Close Editor' : 'Add New Venue'}
          {showForm ? null : <Plus className="w-4 h-4 ml-2" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Creation Form Sidebar/Top */}
        {showForm && (
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-100/50 sticky top-8 animate-in slide-in-from-left-4 duration-500">
            <div className="mb-8 space-y-1">
              <h2 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">Create <span className="text-indigo-600">Legendary</span> Venue</h2>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Saved venues appear in the event dropdown.</p>
            </div>
            <LocationForm 
              onSuccess={(loc) => {
                fetchLocations()
                setShowForm(false)
              }} 
            />
          </div>
        )}

        {/* Location List */}
        <div className={`${showForm ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6`}>
          <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="pl-4">
              <Search className="w-4 h-4 text-gray-300" />
            </div>
            <Input 
              placeholder="Filter venues by name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none shadow-none focus:ring-0 font-bold text-xs bg-transparent"
            />
          </div>

          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading venues...</p>
            </div>
          ) : filteredLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredLocations.map((loc) => (
                <div key={loc.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500">
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <div className="px-3 py-1 bg-gray-50 rounded-full group-hover:bg-indigo-50 transition-colors">
                        <span className="text-[9px] font-black text-gray-400 group-hover:text-indigo-600 uppercase tracking-tight">{loc.city}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{loc.venue_name || 'Unnamed Venue'}</h3>
                      <p className="text-[11px] font-bold text-gray-400 leading-relaxed max-w-[80%]">{loc.address_line1}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">State</span>
                          <span className="text-[10px] font-bold text-gray-600">{loc.state || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Postcode</span>
                          <span className="text-[10px] font-bold text-gray-600">{loc.postal_code || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {loc.google_maps_url && (
                        <a 
                          href={loc.google_maps_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-zinc-950 hover:text-white transition-all shadow-sm"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No venues saved yet</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8 max-w-xs mx-auto">Start by adding your first event location to make it reusable.</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] h-12 px-10 rounded-2xl shadow-xl shadow-indigo-100"
              >
                Add Your First Venue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
