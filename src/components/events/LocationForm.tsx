'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { MapPin, Loader2, Globe } from 'lucide-react'
import { createLocationAction } from '@/actions/location.actions'
import { toast } from 'sonner'

interface LocationFormProps {
  onSuccess?: (location: any) => void
  onCancel?: () => void
}

export default function LocationForm({ onSuccess, onCancel }: LocationFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    venue_name: '',
    address_line1: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    google_maps_url: ''
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.venue_name || !formData.city) {
      toast.error('Venue name and city are required')
      return
    }

    setLoading(true)
    const submissionData = new FormData()
    submissionData.append('data', JSON.stringify(formData))

    const result = await createLocationAction(submissionData)
    setLoading(false)

    if (result.success) {
      toast.success('Location saved successfully!')
      onSuccess?.(result.location)
    } else {
      toast.error(result.error || 'Failed to save location')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Venue Name</label>
          <Input 
            placeholder="e.g. Social Offline, Hauz Khas" 
            value={formData.venue_name} 
            onChange={(e) => handleChange('venue_name', e.target.value)} 
            className="h-10 text-xs font-bold"
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address Line 1</label>
          <Input 
            placeholder="Street address..." 
            value={formData.address_line1} 
            onChange={(e) => handleChange('address_line1', e.target.value)} 
            className="h-10 text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">City</label>
          <Input 
            placeholder="City" 
            value={formData.city} 
            onChange={(e) => handleChange('city', e.target.value)} 
            className="h-10 text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">State / Region</label>
          <Input 
            placeholder="State" 
            value={formData.state} 
            onChange={(e) => handleChange('state', e.target.value)} 
            className="h-10 text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Postal Code</label>
          <Input 
            placeholder="e.g. 110016" 
            value={formData.postal_code} 
            onChange={(e) => handleChange('postal_code', e.target.value)} 
            className="h-10 text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Google Maps URL</label>
          <Input 
            placeholder="Link to location..." 
            value={formData.google_maps_url} 
            onChange={(e) => handleChange('google_maps_url', e.target.value)} 
            className="h-10 text-xs font-bold"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
        <Button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px]"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <MapPin className="w-3 h-3 mr-2" />}
          Save Location
        </Button>
        {onCancel && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="px-6 font-bold text-[10px] uppercase tracking-widest text-gray-400"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
