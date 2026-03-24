'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createEventAction, updateEventAction, uploadImageAction, deleteImageAction, createEventFeeOrderAction, verifyEventFeePaymentAction } from '@/actions/event.actions'
import { Button, Input, Textarea } from '@/components/ui'
import { toast } from 'sonner'
import { 
  Calendar, MapPin, Clock, Users, IndianRupee, Info, Plus, Trash2, Camera, X, Loader2, 
  Type, Ticket, HelpCircle, Banknote, CheckCircle2, Globe, Tag, Image as ImageIcon 
} from 'lucide-react'
import Script from 'next/script'
import LocationPicker from './LocationPicker'

interface Category {
  id: string
  name: string
}

interface HostProfile {
  id: string
  display_name: string
}

interface EventCreateFormProps {
  categories: Category[]
  hostProfiles: HostProfile[]
  initialData?: any
  eventId?: string
}

export default function EventCreateForm({ categories, hostProfiles, initialData, eventId }: EventCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  // Separate Date/Time state
  const [timing, setTiming] = useState({
    startDate: initialData?.start_datetime ? new Date(initialData.start_datetime).toISOString().split('T')[0] : '',
    startTime: initialData?.start_datetime ? new Date(initialData.start_datetime).toLocaleTimeString('en-GB').substring(0, 5) : '19:00',
    endDate: initialData?.end_datetime ? new Date(initialData.end_datetime).toISOString().split('T')[0] : '',
    endTime: initialData?.end_datetime ? new Date(initialData.end_datetime).toLocaleTimeString('en-GB').substring(0, 5) : '22:00'
  })

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    host_id: initialData?.host_id || hostProfiles[0]?.id || '',
    category_id: initialData?.category_id || categories[0]?.id || '',
    start_datetime: initialData?.start_datetime || '',
    end_datetime: initialData?.end_datetime || '',
    timezone: initialData?.timezone || 'Asia/Kolkata',
    ticketing_mode: initialData?.ticketing_mode || 'platform',
    event_type: initialData?.event_type || 'in_person',
    cover_image_url: initialData?.cover_image_url || '',
    vertical_poster_url: initialData?.vertical_poster_url || '',
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
    location_id: initialData?.location_id || '',
    location: initialData?.location || {
      venue_name: '',
      address_line_1: '',
      city: '',
      state: '',
      country: 'India',
      postal_code: ''
    },
    online_event_url: initialData?.online_event_url || '',
    online_platform: initialData?.online_platform || 'Zoom',
    online_url_reveal: initialData?.online_url_reveal || 'after_booking',
    max_capacity: initialData?.max_capacity || 100,
    is_age_restricted: initialData?.is_age_restricted || false,
    min_age: initialData?.min_age || 18,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    cover_image_alt: initialData?.cover_image_alt || '',
    vertical_poster_alt: initialData?.vertical_poster_alt || '',
    ticket_tiers: initialData?.ticket_tiers || [
      {
        name: 'General Admission',
        tier_type: 'paid',
        price: 499,
        total_quantity: 100,
        max_per_booking: 5,
        tier_category: 'general'
      }
    ]
  })

  // Sync timing to ISO
  useEffect(() => {
    if (timing.startDate) {
      const start = new Date(`${timing.startDate}T${timing.startTime}:00`)
      setFormData(prev => ({ ...prev, start_datetime: start.toISOString() }))
    }
    if (timing.endDate) {
      const end = new Date(`${timing.endDate}T${timing.endTime}:00`)
      setFormData(prev => ({ ...prev, end_datetime: end.toISOString() }))
    }
  }, [timing])

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_url' | 'vertical_poster_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    // Delete existing image if any
    const existingUrl = formData[field]
    if (existingUrl) {
      deleteImageAction(existingUrl, eventId)
    }
    
    setUploading(field)
    const uploadData = new FormData()
    uploadData.append('file', file)
    const res = await uploadImageAction(eventId || 'new-event', uploadData, field === 'vertical_poster_url' ? 'vertical' : 'landscape')
    setUploading(null)
    if (res.success && res.url) {
      handleChange(field, res.url)
      toast.success('Uploaded')
    } else {
      toast.error(res.error || 'Upload failed')
    }
  }

  const handleRemoveImage = async (field: 'cover_image_url' | 'vertical_poster_url') => {
    const url = formData[field]
    if (!url) return

    // Clear local state immediately for responsiveness
    setFormData(prev => ({ ...prev, [field]: '' }))
    
    const res = await deleteImageAction(url, eventId)
    if (!res.success) {
      console.error('Failed to cleanup Cloudinary:', res.error)
    }
  }

  const handleTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...formData.ticket_tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setFormData(prev => ({ ...prev, ticket_tiers: newTiers }))
  }

  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      ticket_tiers: [
        ...prev.ticket_tiers,
        {
          name: 'Early Entry',
          tier_type: 'paid',
          price: 999,
          total_quantity: 50,
          max_per_booking: 5,
          tier_category: 'vip'
        }
      ]
    }))
  }

  const handleRemoveTier = (index: number) => {
    if (formData.ticket_tiers.length === 1) return
    setFormData(prev => ({
      ...prev,
      ticket_tiers: prev.ticket_tiers.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSaveDraft = async () => {
    if (!formData.start_datetime || !formData.end_datetime) {
      toast.error('Set date & time')
      return
    }
    setLoading(true)
    const submissionData = new FormData()
    submissionData.append('data', JSON.stringify({ ...formData, status: 'draft' }))
    
    const result = eventId 
      ? await updateEventAction(eventId, submissionData)
      : await createEventAction(submissionData)
      
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(eventId ? 'Work saved!' : 'Draft saved successfully!')
      if (!eventId) {
        router.push(`/events/drafts`)
      }
    }
  }

  const handlePublish = async () => {
    if (!formData.start_datetime || !formData.end_datetime) {
      toast.error('Set date & time')
      return
    }
    
    setLoading(true)
    
    const targetStatus = initialData?.creation_fee_paid ? 'published' : 'draft'
    const submissionData = new FormData()
    submissionData.append('data', JSON.stringify({ ...formData, status: targetStatus }))
    
    const result = eventId 
      ? await updateEventAction(eventId, submissionData)
      : await createEventAction(submissionData)
    
    if (result.error || (!result.id && !eventId)) {
      setLoading(false)
      toast.error(result.error || 'Failed to initialize event')
      return
    }

    if (initialData?.creation_fee_paid) {
      setLoading(false)
      toast.success('Event updated & published!')
      router.push('/events/published')
      return
    }

    const currentEventId = (eventId || result.id) as string

    // 2. Create Razorpay Order
    const orderResult = await createEventFeeOrderAction(currentEventId)
    if (orderResult.error) {
      setLoading(false)
      toast.error(orderResult.error)
      return
    }

    // 3. Open Razorpay Checkout
    const options = {
      key: orderResult.keyId,
      amount: orderResult.amount,
      currency: "INR",
      name: "Stranger Mingle",
      description: `Event Platform Fee - ${formData.title}`,
      image: "/logo-black.svg",
      order_id: orderResult.orderId,
      handler: async function (response: any) {
        setLoading(true)
        const verifyResult = await verifyEventFeePaymentAction(currentEventId, {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })

        if (verifyResult.success) {
          toast.success('Payment successful! Event published.')
          router.push(`/events/published`)
        } else {
          toast.error(verifyResult.error || 'Payment verification failed')
        }
        setLoading(false)
      },
      prefill: {
        name: hostProfiles.find(hp => hp.id === formData.host_id)?.display_name || "",
        email: "",
        contact: ""
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: function() {
          setLoading(false)
          toast.info('Payment cancelled')
        }
      }
    };

    if (!(window as any).Razorpay) {
      setLoading(false)
      toast.error('Razorpay SDK not loaded yet. Please wait a moment.')
      return
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This is handled by specific buttons now
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Main Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section: Identity (Labels only, no boxes) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[14px] font-black uppercase tracking-widest text-zinc-400">Event Title</label>
                <Input
                  placeholder="Stranger Weekend Meetup..."
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="h-14 border-gray-100 bg-white rounded-lg font-regular text-base shadow-sm focus:border-zinc-800 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-bold uppercase tracking-widest text-zinc-400">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleChange('category_id', e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-100 bg-white font-bold text-sm appearance-none shadow-sm focus:border-zinc-950"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-black uppercase tracking-widest text-zinc-400">Short Description</label>
                <Input
                  placeholder="One sentence to grab attention..."
                  value={formData.short_description}
                  onChange={(e) => handleChange('short_description', e.target.value)}
                  className="h-12 border-gray-100 bg-white rounded-lg font-bold text-sm shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Full event details</label>
              <Textarea
                placeholder="Paint a picture of the experience..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-[140px] border-gray-100 bg-white rounded-lg p-4 font-bold text-sm leading-relaxed shadow-sm"
              />
            </div>
          </div>

          {/* SEO & Discoverability (New Section) */}
          <div className="bg-indigo-50/30 p-6 rounded-xl border border-indigo-100/50 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-indigo-100/50">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-900">SEO & Search Engine Ranking</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Meta Title (SEO)</label>
                <Input
                  placeholder="Appears in Google search results..."
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  className="h-10 border-gray-100 bg-white rounded-lg font-bold text-xs shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Meta Description</label>
                <Input
                  placeholder="Brief summary for search engines..."
                  value={formData.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  className="h-10 border-gray-100 bg-white rounded-lg font-bold text-xs shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Logistics (Compact Box) */}
          <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
              <Clock className="w-4 h-4 text-zinc-950" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Timing & Location</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">Start Date</label>
                    <Input type="date" value={timing.startDate} onChange={(e) => setTiming(prev => ({ ...prev, startDate: e.target.value }))} className="h-10 border-gray-100 rounded-lg font-bold text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">Start Time</label>
                    <Input type="time" value={timing.startTime} onChange={(e) => setTiming(prev => ({ ...prev, startTime: e.target.value }))} className="h-10 border-gray-100 rounded-lg font-bold text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">End Date</label>
                    <Input type="date" value={timing.endDate} onChange={(e) => setTiming(prev => ({ ...prev, endDate: e.target.value }))} className="h-10 border-gray-100 rounded-lg font-bold text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">End Time</label>
                    <Input type="time" value={timing.endTime} onChange={(e) => setTiming(prev => ({ ...prev, endTime: e.target.value }))} className="h-10 border-gray-100 rounded-lg font-bold text-xs" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Format</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-white border border-gray-100 rounded-lg">
                    {['in_person', 'online', 'hybrid'].map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => handleChange('event_type', t)}
                        className={`h-8 rounded text-[9px] font-black uppercase tracking-widest transition-all ${formData.event_type === t ? 'bg-zinc-950 text-white shadow-md' : 'text-gray-300 hover:text-zinc-600'
                          }`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.event_type !== 'online' ? (
                  <LocationPicker 
                    selectedId={formData.location_id} 
                    onSelect={(id) => handleChange('location_id', id)} 
                  />
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formData.online_platform}
                        onChange={(e) => handleChange('online_platform', e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-100 bg-white font-bold text-[10px] appearance-none shadow-sm focus:border-zinc-950"
                      >
                        <option value="Zoom">Zoom</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Discord">Discord</option>
                        <option value="YouTube Live">YouTube Live</option>
                        <option value="Custom">Custom Platform</option>
                      </select>
                      <select
                        value={formData.online_url_reveal}
                        onChange={(e) => handleChange('online_url_reveal', e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-100 bg-white font-bold text-[10px] appearance-none shadow-sm focus:border-zinc-950"
                      >
                        <option value="after_booking">Reveal after booking</option>
                        <option value="day_of">Reveal on day of event</option>
                        <option value="public">Make link public</option>
                      </select>
                    </div>
                    <Input placeholder="Link / Platform URL" value={formData.online_event_url} onChange={(e) => handleChange('online_event_url', e.target.value)} className="h-10 border-gray-100 rounded-lg font-bold text-xs bg-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Capacity & Age</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">Max Capacity</label>
                    <Input 
                      type="number" 
                      value={formData.max_capacity} 
                      onChange={(e) => handleChange('max_capacity', parseInt(e.target.value))} 
                      className="h-10 border-gray-100 rounded-lg font-bold text-xs bg-white" 
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-tighter">Min Age</label>
                      <button 
                        type="button"
                        onClick={() => handleChange('is_age_restricted', !formData.is_age_restricted)}
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded transition-colors ${formData.is_age_restricted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {formData.is_age_restricted ? 'Restricted' : 'No Limit'}
                      </button>
                    </div>
                    <Input 
                      type="number" 
                      disabled={!formData.is_age_restricted}
                      value={formData.min_age} 
                      onChange={(e) => handleChange('min_age', parseInt(e.target.value))} 
                      className={`h-10 border-gray-100 rounded-lg font-bold text-xs bg-white ${!formData.is_age_restricted && 'opacity-30'}`} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-6">

            {/* Visuals (Completely Clean) */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              <div className="space-y-1">
                <div className={`aspect-video relative rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-yellow-50/50 group ${formData.cover_image_url ? 'border-zinc-950' : 'border-gray-100'}`}>
                  {formData.cover_image_url ? (
                    <>
                      <img src={formData.cover_image_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white bg-black/50 px-3 py-1 rounded-full uppercase tracking-widest">Change Image</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveImage('cover_image_url'); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-yellow-600 transition-colors">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Cover Image (16:9)</span>
                    </div>
                  )}
                  {/* Entire box trigger */}
                  <label className="absolute inset-0 cursor-pointer z-10">
                    <input type="file" onChange={(e) => handleImageUpload(e, 'cover_image_url')} className="hidden" accept="image/*" disabled={uploading === 'cover_image_url'} />
                  </label>
                  {uploading === 'cover_image_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-black animate-pulse z-30">UPLOADING...</div>}
                </div>
                {formData.cover_image_url && (
                  <Input
                    placeholder="Describe image (Alt Text)..."
                    value={formData.cover_image_alt}
                    onChange={(e) => handleChange('cover_image_alt', e.target.value)}
                    className="h-8 border-gray-100 bg-transparent rounded-lg font-bold text-[10px] shadow-none focus:bg-white"
                  />
                )}
              </div>

              <div className="space-y-1">
                <div className={`aspect-[4/5] relative rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-blue-50/50 group ${formData.vertical_poster_url ? 'border-zinc-950' : 'border-gray-100'}`}>
                  {formData.vertical_poster_url ? (
                    <>
                      <img src={formData.vertical_poster_url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white bg-black/50 px-3 py-1 rounded-full uppercase tracking-widest">Change Poster</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveImage('vertical_poster_url'); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Vertical Poster (4:5)</span>
                    </div>
                  )}
                  {/* Entire box trigger */}
                  <label className="absolute inset-0 cursor-pointer z-10">
                    <input type="file" onChange={(e) => handleImageUpload(e, 'vertical_poster_url')} className="hidden" accept="image/*" disabled={uploading === 'vertical_poster_url'} />
                  </label>
                  {uploading === 'vertical_poster_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-black animate-pulse z-30">UPLOADING...</div>}
                </div>
                {formData.vertical_poster_url && (
                  <Input
                    placeholder="Describe poster (Alt Text)..."
                    value={formData.vertical_poster_alt}
                    onChange={(e) => handleChange('vertical_poster_alt', e.target.value)}
                    className="h-8 border-gray-100 bg-transparent rounded-lg font-bold text-[10px] shadow-none focus:bg-white"
                  />
                )}
              </div>
            </div>

            {/* Ticketing Tiers */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-zinc-950 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-3.5 h-3.5 text-white" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Ticketing</h3>
                </div>
                <div className="relative group">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-600 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-3 w-44 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-[9px] font-bold leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
                    Create tiers (VIP, Early Bird). Linked to <code className="text-indigo-400">ticket_tiers</code> in DB.
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
                {formData.ticket_tiers.map((tier: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-2 relative group/tier">
                    <Input
                      placeholder="Tier Name"
                      value={tier.name}
                      onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                      className="h-8 rounded-md text-[11px] font-bold bg-white border-gray-100"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={tier.price}
                        onChange={(e) => handleTierChange(idx, 'price', parseFloat(e.target.value))}
                        className="h-8 rounded-md text-[11px] font-bold bg-white border-gray-100"
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={tier.total_quantity}
                        onChange={(e) => handleTierChange(idx, 'total_quantity', parseInt(e.target.value))}
                        className="h-8 rounded-md text-[11px] font-bold bg-white border-gray-100"
                      />
                    </div>
                    {formData.ticket_tiers.length > 1 && (
                      <button type="button" onClick={() => handleRemoveTier(idx)} className="absolute top-1 right-1 opacity-0 group-hover/tier:opacity-100 transition-opacity p-1 bg-white rounded shadow-sm">
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddTier} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors">
                  + Add New Tier
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="bg-zinc-950 rounded-xl p-6 text-white space-y-4 shadow-xl shadow-zinc-950/20">
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <p className="text-[14px] font-black uppercase tracking-wider text-center">Platform Fee: <span className="line-through text-zinc-600">₹499</span> ₹199</p>
                </div>
                <p className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-tighter">Limited Time Offer</p>
              </div>
              
              <Script 
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
              />

              <Button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="w-full h-18 rounded-lg bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-[16px] transition-all active:scale-95 flex flex-col items-center justify-center gap-0 py-4"
              >
                <span>{loading ? 'Processing...' : 'Publish Event'}</span>
                {!loading && <span className="text-[10px] opacity-70 font-bold">₹199 (Discounted from ₹499)</span>}
              </Button>
              
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="w-full h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-widest text-[11px] transition-all active:scale-95"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
