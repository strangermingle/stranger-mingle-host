'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  createEventAction, 
  updateEventAction, 
  uploadImageAction, 
  deleteImageAction, 
  createEventFeeOrderAction, 
  verifyEventFeePaymentAction,
  getTagsAction,
  getOtherHostsAction
} from '@/actions/event.actions'
import { Button, Input, Textarea } from '@/components/ui'
import { toast } from 'sonner'
import {
  Calendar,  Clock,
  Users,
  MapPin,
  Tag,
  Plus,
  CheckCircle2,
  Trash2,
  Camera,
  X,
  Ticket,
  HelpCircle,
  Info,
  Settings,
  Share2,
  Globe,
  Search,
  ChevronRight,
  Loader2,
  MessageCircle,
  Banknote,
  Shield
} from 'lucide-react';
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
  initialData?: Record<string, unknown>
  eventId?: string
}

interface TicketTier {
  id?: string
  name: string
  tier_type: string
  price: number
  total_quantity: number
  max_per_booking: number
  description: string
  sale_start_at?: string
  sale_end_at?: string
  perks?: string[]
}

interface AgendaItem {
  title: string
  description?: string
  start_time: string
  end_time?: string
}

interface FAQItem {
  question: string
  answer: string
}

interface AgeRestriction {
  restriction_text: string
  min_age: number | null
}

interface EventFormData {
  title: string
  host_id: string
  category_id: string
  start_datetime: string
  end_datetime: string
  timezone: string
  ticketing_mode: 'platform' | 'external' | 'free' | 'rsvp' | 'none'
  event_type: 'in_person' | 'online' | 'hybrid'
  cover_image_url: string
  vertical_poster_url: string
  description: string
  short_description: string
  location_id: string
  location: {
    venue_name: string
    address_line_1: string
    city: string
    state: string
    country: string
    postal_code: string
    latitude?: string
    longitude?: string
  }
  online_event_url: string
  online_platform: string
  online_url_reveal: string
  max_capacity: number
  is_age_restricted: boolean
  min_age: number
  is_recurring: boolean
  recurrence_rule: string
  doors_open_at: string
  meta_title: string
  meta_description: string
  cover_image_alt: string
  vertical_poster_alt: string
  ticket_tiers: TicketTier[]
  agenda: AgendaItem[]
  faqs: FAQItem[]
  status: string;
  tags: string[];
  cohosts: string[];
  age_restrictions: AgeRestriction[];
}

interface InitialEventData {
  title?: string;
  host_id?: string;
  category_id?: string;
  start_datetime?: string;
  end_datetime?: string;
  timezone?: string;
  ticketing_mode?: 'platform' | 'external' | 'free' | 'rsvp' | 'none';
  event_type?: 'in_person' | 'online' | 'hybrid';
  cover_image_url?: string;
  vertical_poster_url?: string;
  description?: string;
  short_description?: string;
  location_id?: string;
  location?: {
    venue_name: string;
    address_line_1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  online_event_url?: string;
  online_platform?: string;
  online_url_reveal?: string;
  max_capacity?: number;
  is_age_restricted?: boolean;
  min_age?: number;
  meta_title?: string;
  meta_description?: string;
  cover_image_alt?: string;
  vertical_poster_alt?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  doors_open_at?: string;
  ticket_tiers?: (TicketTier & { id?: string })[];
  agenda?: AgendaItem[];
  faqs?: FAQItem[];
  tags?: { tag: { name: string } }[];
  cohosts?: { host_user_id: string }[];
  age_restrictions?: AgeRestriction[];
  status?: string;
  creation_fee_paid?: boolean;
}

export default function EventCreateForm({ categories, hostProfiles, initialData: rawInitialData, eventId }: EventCreateFormProps) {
  const initialData = rawInitialData as InitialEventData | undefined;
  const router = useRouter()
  const [loadingPublish, setLoadingPublish] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const loading = loadingPublish || loadingDraft
  const [uploading, setUploading] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<{id: string, name: string}[]>([])
  const [otherHosts, setOtherHosts] = useState<{user_id: string, display_name: string, organisation_name: string | null}[]>([])

  // Separate Date/Time state
  // Remove unused states
  const [customTag, setCustomTag] = useState('')

  const [timing, setTiming] = useState({
    startDate: initialData?.start_datetime ? new Date(initialData.start_datetime).toISOString().split('T')[0] : '',
    startTime: initialData?.start_datetime ? new Date(initialData.start_datetime).toLocaleTimeString('en-GB').substring(0, 5) : '19:00',
    endDate: initialData?.end_datetime ? new Date(initialData.end_datetime).toISOString().split('T')[0] : '',
    endTime: initialData?.end_datetime ? new Date(initialData.end_datetime).toLocaleTimeString('en-GB').substring(0, 5) : '22:00'
  })

  const [formData, setFormData] = useState<EventFormData>({
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
      postal_code: '',
      latitude: '',
      longitude: ''
    },
    online_event_url: initialData?.online_event_url || '',
    online_platform: initialData?.online_platform || '',
    online_url_reveal: initialData?.online_url_reveal || 'after_booking',
    max_capacity: initialData?.max_capacity || 100,
    is_age_restricted: initialData?.is_age_restricted || false,
    min_age: initialData?.min_age || 18,
    is_recurring: initialData?.is_recurring || false,
    recurrence_rule: initialData?.recurrence_rule || '',
    doors_open_at: initialData?.doors_open_at || '',
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || '',
    cover_image_alt: initialData?.cover_image_alt || '',
    vertical_poster_alt: initialData?.vertical_poster_alt || '',
    ticket_tiers: initialData?.ticket_tiers?.map(t => ({
      id: t.id,
      name: t.name || '',
      tier_type: t.tier_type || 'paid',
      price: t.price || 0,
      total_quantity: t.total_quantity || 0,
      max_per_booking: t.max_per_booking || 10,
      description: t.description || ''
    })) || [
      {
        name: 'General Admission',
        tier_type: 'paid',
        price: 499,
        total_quantity: 100,
        max_per_booking: 5,
        description: ''
      }
    ],
    agenda: initialData?.agenda?.map((item: any) => ({
      title: item.title || '',
      description: item.description || '',
      start_time: item.starts_at ? new Date(item.starts_at).toLocaleTimeString('en-GB').substring(0, 5) : '19:00',
      end_time: item.ends_at ? new Date(item.ends_at).toLocaleTimeString('en-GB').substring(0, 5) : '20:00'
    })) || [],
    faqs: initialData?.faqs?.map((item: any) => ({
      question: item.question || '',
      answer: item.answer || ''
    })) || [],
    tags: initialData?.tags?.map((t: { tag: { name: string }}) => t.tag.name) || [],
    cohosts: (initialData?.cohosts as { host_user_id: string }[])?.map(c => c.host_user_id) || [],
    age_restrictions: (initialData?.age_restrictions as AgeRestriction[]) || [],
    status: (initialData?.status as string) || 'draft'
  })

  // Auto-calculate max_capacity from ticket_tiers
  useEffect(() => {
    const total = formData.ticket_tiers.reduce((sum: number, tier) => sum + (tier.total_quantity || 0), 0)
    if (formData.max_capacity !== total) {
      setFormData(prev => ({ ...prev, max_capacity: total }))
    }
  }, [formData.ticket_tiers, formData.max_capacity])

  // Fetch Tags and Hosts
  useEffect(() => {
    async function fetchData() {
      const [tagsRes, hostsRes] = await Promise.all([
        getTagsAction(),
        getOtherHostsAction()
      ])
      if (tagsRes.success) setAllTags((tagsRes.tags as {id: string, name: string}[]) || [])
      if (hostsRes.success) setOtherHosts((hostsRes.hosts as {user_id: string, display_name: string, organisation_name: string | null}[]) || [])
    }
    fetchData()
  }, [])

  const handleChange = (field: string, value: string | number | boolean | object | null) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.') as [keyof EventFormData, string]
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] as object),
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
      await deleteImageAction(existingUrl, eventId)
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
    
    setUploading(field)
    const res = await deleteImageAction(url, eventId)
    setUploading(null)
    if (res.success) {
      handleChange(field, '')
      toast.success('Image removed')
    } else {
      toast.error(res.error || 'Failed to remove image')
    }
  }

  const handleAddAgendaItem = () => {
    setFormData(prev => ({
      ...prev,
      agenda: [...prev.agenda, { title: '', description: '', start_time: '19:00', end_time: '20:00' }]
    }))
  }

  const handleRemoveAgendaItem = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== idx)
    }))
  }

  const handleAgendaChange = (idx: number, field: keyof AgendaItem, value: string) => {
    setFormData(prev => {
      const newAgenda = [...prev.agenda]
      newAgenda[idx] = { ...newAgenda[idx], [field]: value }
      return { ...prev, agenda: newAgenda }
    })
  }

  const handleAddFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }))
  }

  const handleRemoveFAQ = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx)
    }))
  }

  const handleFAQChange = (idx: number, field: keyof FAQItem, value: string) => {
    setFormData(prev => {
      const newFAQs = [...prev.faqs]
      newFAQs[idx] = { ...newFAQs[idx], [field]: value }
      return { ...prev, faqs: newFAQs }
    })
  }

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tagName) 
        ? prev.tags.filter((t: string) => t !== tagName)
        : [...prev.tags, tagName]
      return { ...prev, tags }
    })
  }

  const handleCustomTagAdd = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return
    e.preventDefault()
    
    const tag = customTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setCustomTag('')
    }
  }

  const handleCohostToggle = (userId: string) => {
    setFormData(prev => {
      const cohosts = prev.cohosts.includes(userId)
        ? prev.cohosts.filter((id: string) => id !== userId)
        : [...prev.cohosts, userId]
      return { ...prev, cohosts }
    })
  }

  const handleAddRestriction = () => {
    setFormData(prev => ({
      ...prev,
      age_restrictions: [...prev.age_restrictions, { restriction_text: '', min_age: 18 }]
    }))
  }

  const handleRemoveRestriction = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      age_restrictions: prev.age_restrictions.filter((_, i) => i !== idx)
    }))
  }

  const handleRestrictionChange = (idx: number, field: keyof AgeRestriction, value: any) => {
    setFormData(prev => {
      const newRules = [...prev.age_restrictions]
      newRules[idx] = { ...newRules[idx], [field]: value }
      return { ...prev, age_restrictions: newRules }
    })
  }

  const handleTierChange = (idx: number, field: keyof TicketTier, value: any) => {
    setFormData(prev => {
      const newTiers = [...prev.ticket_tiers]
      newTiers[idx] = { ...newTiers[idx], [field]: value }
      
      const totalQty = newTiers.reduce((sum, t) => sum + (t.total_quantity || 0), 0)
      
      return {
        ...prev,
        ticket_tiers: newTiers,
        max_capacity: totalQty
      }
    })
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
          description: ''
        }
      ]
    }))
  }

  const handleRemoveTier = (index: number) => {
    if (formData.ticket_tiers.length === 1) return
    setFormData(prev => ({
      ...prev,
      ticket_tiers: prev.ticket_tiers.filter((_, i) => i !== index)
    }))
  }

  const handleSaveDraft = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!formData.start_datetime || !formData.end_datetime) {
      toast.error('Set date & time')
      return
    }
    setLoadingDraft(true)
    const submissionData = new FormData()
    submissionData.append('data', JSON.stringify({ ...formData, status: 'draft' }))
    
    try {
      const result = eventId 
        ? await updateEventAction(eventId, submissionData)
        : await createEventAction(submissionData)
        
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(eventId ? 'Work saved!' : 'Draft saved successfully!')
        if (!eventId) {
          router.push(`/events/drafts`)
        }
      }
    } catch (err) {
      console.error('Save draft error:', err)
      toast.error('Failed to save draft')
    } finally {
      setLoadingDraft(false)
    }
  }

  const handlePublish = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!formData.start_datetime || !formData.end_datetime) {
      toast.error('Set date & time')
      return
    }
    
    setLoadingPublish(true)
    
    try {
      const targetStatus = initialData?.creation_fee_paid ? 'published' : 'draft'
      const submissionData = new FormData()
      submissionData.append('data', JSON.stringify({ ...formData, status: targetStatus }))
      
      const result = eventId 
        ? await updateEventAction(eventId, submissionData)
        : await createEventAction(submissionData)
      
      if (result.error || (!result.id && !eventId)) {
        toast.error(result.error || 'Failed to initialize event')
        setLoadingPublish(false)
        return
      }

      if (initialData?.creation_fee_paid) {
        setLoadingPublish(false)
        toast.success('Event updated & published!')
        router.push('/events/published')
        return
      }

      const currentEventId = (eventId || result.id) as string

      // 2. Create Razorpay Order
      const orderResult = await createEventFeeOrderAction(currentEventId)
      if (orderResult.error) {
        setLoadingPublish(false)
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
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          setLoadingPublish(true)
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
          setLoadingPublish(false)
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
            setLoadingPublish(false)
            toast.info('Payment cancelled')
          }
        }
      };

      if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
        setLoadingPublish(false)
        toast.error('Payment gateway is still loading. Please try again in a few seconds.')
        return
      }

      // @ts-expect-error - Razorpay is loaded dynamically via script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      console.error('handlePublish error:', err)
      toast.error('Something went wrong. Please try again.')
      setLoadingPublish(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // This is handled by specific buttons now
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-12 pb-24">
      <div className="space-y-12">
          {/* Section: Identity */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 md:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-10" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">Basic Information</h2>
              </div>
              <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">The Essentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Event Title</label>
                <Input
                  placeholder="e.g. The Secret Rooftop Social"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="h-14 border-zinc-100 bg-zinc-50/50 rounded-2xl font-bold text-lg shadow-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Category</label>
                <div className="relative group">
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleChange('category_id', e.target.value)}
                    className="w-full h-14 px-5 rounded-2xl border border-zinc-100 bg-zinc-50/50 font-black text-sm appearance-none shadow-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer text-zinc-900"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Short Catchphrase</label>
                <Input
                  placeholder="One sentence that hooks them..."
                  value={formData.short_description}
                  onChange={(e) => handleChange('short_description', e.target.value)}
                  className="h-14 border-zinc-100 bg-zinc-50/50 rounded-2xl font-bold text-sm shadow-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Detailed Story</label>
              <Textarea
                placeholder="Describe the mood, the music, and the people. What makes this night special?"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-[200px] border-zinc-100 bg-zinc-50/50 rounded-[2rem] p-6 font-bold text-sm leading-relaxed shadow-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
              />
            </div>
          </div>

          {/* SEO & Discoverability */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 md:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -z-10" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">Discoverability</h2>
              </div>
              <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Search & SEO</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Meta Title</label>
                <Input
                  placeholder="How it appears in Google..."
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  className="h-14 border-zinc-100 bg-zinc-50/50 rounded-2xl font-bold text-sm shadow-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Meta Description</label>
                <Input
                  placeholder="Summary for search results..."
                  value={formData.meta_description}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  className="h-14 border-zinc-100 bg-zinc-50/50 rounded-2xl font-bold text-sm shadow-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 md:p-10 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-[5rem] -z-10" />
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">Logistics</h2>
              </div>
              <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Time & Place</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Start Date</label>
                    <Input type="date" value={timing.startDate} onChange={(e) => setTiming(prev => ({ ...prev, startDate: e.target.value }))} className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Start Time</label>
                    <Input type="time" value={timing.startTime} onChange={(e) => setTiming(prev => ({ ...prev, startTime: e.target.value }))} className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">End Date</label>
                    <Input type="date" value={timing.endDate} onChange={(e) => setTiming(prev => ({ ...prev, endDate: e.target.value }))} className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">End Time</label>
                    <Input type="time" value={timing.endTime} onChange={(e) => setTiming(prev => ({ ...prev, endTime: e.target.value }))} className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm focus:bg-white focus:ring-4 focus:ring-amber-500/10 transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Experience Format</label>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    {['in_person', 'online', 'hybrid'].map(t => (
                      <button
                        key={t} type="button"
                        onClick={() => handleChange('event_type', t)}
                        className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${formData.event_type === t ? 'bg-zinc-950 text-white shadow-xl' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                          }`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.event_type !== 'online' ? (
                  <div className="pt-2">
                    <LocationPicker 
                      selectedId={formData.location_id} 
                      onSelect={(id) => handleChange('location_id', id)} 
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <select
                          value={formData.online_platform}
                          onChange={(e) => handleChange('online_platform', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 font-black text-[11px] uppercase tracking-widest appearance-none focus:bg-white focus:ring-4 focus:ring-zinc-500/10 transition-all"
                        >
                          <option value="Zoom">Zoom</option>
                          <option value="Google Meet">Google Meet</option>
                          <option value="Discord">Discord</option>
                          <option value="YouTube Live">YouTube Live</option>
                          <option value="Custom">Custom Platform</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={formData.online_url_reveal}
                          onChange={(e) => handleChange('online_url_reveal', e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-zinc-100 bg-zinc-50/50 font-black text-[11px] uppercase tracking-widest appearance-none focus:bg-white focus:ring-4 focus:ring-zinc-500/10 transition-all"
                        >
                          <option value="after_booking">Reveal after booking</option>
                          <option value="day_of">Reveal on day of event</option>
                          <option value="public">Make link public</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </div>
                      </div>
                    </div>
                    <Input placeholder="Link / Platform URL" value={formData.online_event_url} onChange={(e) => handleChange('online_event_url', e.target.value)} className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm focus:bg-white transition-all" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-10 border-t border-zinc-50">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <label className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950">Event Capacity</label>
                </div>
                <div className="max-w-[200px] space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Max Capacity</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.max_capacity} 
                      readOnly
                      placeholder="0"
                      className="h-12 border-zinc-100 bg-zinc-50 rounded-xl font-bold text-sm cursor-not-allowed text-zinc-400" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-zinc-300 uppercase italic ml-1">* Auto-calculated from tickets</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agenda Section */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 md:p-10 space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-[5rem] -z-10" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">Experience Flow</h2>
                </div>
                <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Event Agenda</h3>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddAgendaItem} 
                className="h-12 px-6 rounded-2xl border-zinc-100 bg-zinc-50 font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
              >
                + Add Session
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {formData.agenda.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] border-2 border-dashed border-emerald-50 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-300">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-[12px] text-zinc-400 font-black uppercase tracking-widest italic text-center">No agenda items added yet.</p>
                </div>
              )}
              {formData.agenda.map((item: AgendaItem, idx: number) => (
                <div key={idx} className="p-8 rounded-[2rem] border border-zinc-100 bg-zinc-50/30 space-y-6 relative group animate-in zoom-in-95 duration-300 shadow-sm hover:shadow-md transition-all">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAgendaItem(idx)} 
                    className="absolute top-6 right-6 p-2 rounded-xl bg-white border border-zinc-100 text-zinc-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Session Title</label>
                      <Input placeholder="e.g. Welcome Drinks & Mixology" value={item.title} onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)} className="h-12 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Start Time</label>
                        <Input type="time" value={item.start_time} onChange={(e) => handleAgendaChange(idx, 'start_time', e.target.value)} className="h-12 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">End Time</label>
                        <Input type="time" value={item.end_time} onChange={(e) => handleAgendaChange(idx, 'end_time', e.target.value)} className="h-12 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Description (Optional)</label>
                    <Input placeholder="Brief details about this specific session..." value={item.description} onChange={(e) => handleAgendaChange(idx, 'description', e.target.value)} className="h-12 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 md:p-10 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/50 rounded-bl-[5rem] -z-10" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">Common Questions</h2>
                </div>
                <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Support & FAQs</h3>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddFAQ} 
                className="h-12 px-6 rounded-2xl border-zinc-100 bg-zinc-50 font-black uppercase tracking-widest text-[10px] hover:bg-violet-50 hover:text-violet-600 hover:border-violet-100 transition-all shadow-sm"
              >
                + Add FAQ
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {formData.faqs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] border-2 border-dashed border-violet-50 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center text-violet-300">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p className="text-[12px] text-zinc-400 font-black uppercase tracking-widest italic text-center">No FAQs added yet.</p>
                </div>
              )}
              {formData.faqs.map((faq: FAQItem, idx: number) => (
                <div key={idx} className="p-8 rounded-[2rem] border border-zinc-100 bg-zinc-50/30 space-y-6 relative group animate-in zoom-in-95 duration-300 shadow-sm hover:shadow-md transition-all">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveFAQ(idx)} 
                    className="absolute top-6 right-6 p-2 rounded-xl bg-white border border-zinc-100 text-zinc-300 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">The Question</label>
                    <Input placeholder="e.g. Is valet parking available at the venue?" value={faq.question} onChange={(e) => handleFAQChange(idx, 'question', e.target.value)} className="h-12 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">The Answer</label>
                    <Textarea placeholder="Provide a helpful and detailed answer..." value={faq.answer} onChange={(e) => handleFAQChange(idx, 'answer', e.target.value)} className="min-h-[100px] border-zinc-100 bg-white rounded-2xl p-4 font-bold text-sm shadow-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discovery & Collaboration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tags Section */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950">Tags</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Add..." 
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={handleCustomTagAdd}
                    className="h-8 w-24 border-zinc-100 bg-zinc-50 text-[10px] font-bold px-3 rounded-full focus:bg-white transition-all shadow-none"
                  />
                  <Button type="button" onClick={handleCustomTagAdd} variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-full">
                    <Plus className="w-4 h-4 text-zinc-950" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                      formData.tags.includes(tag.name)
                        ? 'bg-zinc-950 border-zinc-950 text-white shadow-lg scale-105'
                        : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
                {formData.tags.filter((tn: string) => !allTags.find(t => t.name === tn)).map((tagName: string) => (
                  <button
                    key={tagName}
                    type="button"
                    onClick={() => handleTagToggle(tagName)}
                    className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-950 border-zinc-950 text-white shadow-lg scale-105 border transition-all"
                  >
                    #{tagName}
                  </button>
                ))}
                {allTags.length === 0 && formData.tags.length === 0 && <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-tighter italic">No tags added yet.</p>}
              </div>
            </div>

            {/* Cohosts Section */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 space-y-8 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950">Partners</h2>
              </div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {otherHosts.map((host) => (
                  <button
                    key={host.user_id}
                    type="button"
                    onClick={() => handleCohostToggle(host.user_id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      formData.cohosts.includes(host.user_id)
                        ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10'
                        : 'bg-zinc-50/50 border-zinc-100 hover:bg-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    <div className="flex flex-col items-start px-1">
                      <span className={`text-[12px] font-black uppercase tracking-tighter ${formData.cohosts.includes(host.user_id) ? 'text-indigo-900' : 'text-zinc-900'}`}>{host.display_name}</span>
                      <span className="text-[9px] font-bold text-zinc-400 capitalize">{host.organisation_name || 'Individual Host'}</span>
                    </div>
                    {formData.cohosts.includes(host.user_id) ? (
                       <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 animate-in zoom-in duration-300">
                         <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                       </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-zinc-200 bg-white" />
                    )}
                  </button>
                ))}
                {otherHosts.length === 0 && <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-tighter italic">No other hosts found.</p>}
              </div>
            </div>
          </div>

          {/* Age Restrictions Section */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 md:p-10 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-bl-[5rem] -z-10" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">Entry Rules</h2>
                </div>
                <h3 className="text-3xl font-black text-zinc-950 uppercase tracking-tighter">Age Controls</h3>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddRestriction} 
                className="h-12 px-6 rounded-2xl border-zinc-100 bg-zinc-50 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
              >
                + Add Custom Rule
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Primary Age Limit</label>
                  <div className="flex items-center gap-3 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                    <Input 
                      type="number" 
                      value={formData.min_age} 
                      onChange={(e) => handleChange('min_age', parseInt(e.target.value))} 
                      className="h-12 w-24 border-zinc-200 rounded-xl font-black text-lg text-zinc-900 bg-white" 
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-zinc-950 uppercase tracking-tighter">Years & Above</span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Minimum Requirement</span>
                    </div>
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Status</label>
                  <button 
                    type="button"
                    onClick={() => handleChange('is_age_restricted', !formData.is_age_restricted)}
                    className={`h-[82px] w-full rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-1 shadow-sm border ${
                      formData.is_age_restricted 
                        ? 'bg-red-600 border-red-500 text-white shadow-red-200' 
                        : 'bg-white border-zinc-100 text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {formData.is_age_restricted ? (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Restriction Active</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 opacity-40" />
                        <span>Open to All</span>
                      </>
                    )}
                  </button>
               </div>
            </div>

            <div className="space-y-4 pt-6">
              {formData.age_restrictions.map((res: AgeRestriction, idx: number) => (
                <div key={idx} className="flex gap-4 items-end p-6 rounded-2xl bg-zinc-50/50 border border-zinc-100 group animate-in slide-in-from-right-2">
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Rule Description</label>
                    <Input 
                      placeholder="e.g. Valid ID required for verification..." 
                      value={res.restriction_text} 
                      onChange={(e) => handleRestrictionChange(idx, 'restriction_text', e.target.value)} 
                      className="h-12 border-zinc-100 text-sm font-bold bg-white rounded-xl" 
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.1em] ml-1">Min Age</label>
                    <Input 
                      type="number" 
                      value={res.min_age ?? ''} 
                      onChange={(e) => handleRestrictionChange(idx, 'min_age', parseInt(e.target.value))} 
                      className="h-12 border-zinc-200 text-sm font-black bg-white rounded-xl" 
                    />
                  </div>
                  <button type="button" onClick={() => handleRemoveRestriction(idx)} className="h-12 w-12 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-white border border-transparent hover:border-red-100 rounded-xl transition-all shadow-none hover:shadow-sm">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supplementary Content (Previously Sidebar) */}
        <div className="space-y-12">

            {/* Visuals */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 p-8 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50/80 rounded-bl-[5rem] -z-10" />
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-950">Visuals</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Cover Image (16:9)</label>
                  <div className={`aspect-video relative rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-zinc-50 group hover:bg-zinc-100/50 ${formData.cover_image_url ? 'border-zinc-950 bg-white' : 'border-zinc-100'}`}>
                    {formData.cover_image_url ? (
                      <>
                        <Image 
                          src={formData.cover_image_url} 
                          alt={formData.cover_image_alt || "Cover"} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                          <span className="text-[10px] font-black text-white bg-black/50 px-5 py-2 rounded-full uppercase tracking-widest border border-white/20">Change Image</span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveImage('cover_image_url'); }}
                          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-2xl bg-red-600 text-white shadow-2xl hover:bg-red-700 hover:scale-110 transition-all z-30"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-zinc-300 group-hover:text-zinc-500 transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-white border border-zinc-50 flex items-center justify-center shadow-sm">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Landscape Cover</span>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer z-10">
                      <input type="file" onChange={(e) => handleImageUpload(e, 'cover_image_url')} className="hidden" accept="image/*" disabled={!!uploading} />
                    </label>
                    {uploading === 'cover_image_url' && (
                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3 z-40">
                         <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Uploading...</span>
                      </div>
                    )}
                  </div>
                  {formData.cover_image_url && (
                    <Input
                      placeholder="Image alt text (for accessibility)..."
                      value={formData.cover_image_alt}
                      onChange={(e) => handleChange('cover_image_alt', e.target.value)}
                      className="h-10 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-xs shadow-none focus:bg-white transition-all italic"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Vertical Poster (4:5)</label>
                  <div className={`aspect-[4/5] relative rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-zinc-50 group hover:bg-zinc-100/50 ${formData.vertical_poster_url ? 'border-zinc-950 bg-white' : 'border-zinc-100'}`}>
                    {formData.vertical_poster_url ? (
                      <>
                        <Image 
                          src={formData.vertical_poster_url} 
                          alt={formData.vertical_poster_alt || "Poster"} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                          <span className="text-[10px] font-black text-white bg-black/50 px-5 py-2 rounded-full uppercase tracking-widest border border-white/20">Change Poster</span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleRemoveImage('vertical_poster_url'); }}
                          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-2xl bg-red-600 text-white shadow-2xl hover:bg-red-700 hover:scale-110 transition-all z-30"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-zinc-300 group-hover:text-zinc-500 transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-white border border-zinc-50 flex items-center justify-center shadow-sm">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Portrait Poster</span>
                      </div>
                    )}
                    <label className="absolute inset-0 cursor-pointer z-10">
                      <input type="file" onChange={(e) => handleImageUpload(e, 'vertical_poster_url')} className="hidden" accept="image/*" disabled={!!uploading} />
                    </label>
                    {uploading === 'vertical_poster_url' && (
                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3 z-40">
                         <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Uploading...</span>
                      </div>
                    )}
                  </div>
                  {formData.vertical_poster_url && (
                    <Input
                      placeholder="Poster alt text..."
                      value={formData.vertical_poster_alt}
                      onChange={(e) => handleChange('vertical_poster_alt', e.target.value)}
                      className="h-10 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-xs shadow-none focus:bg-white transition-all italic"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Ticketing Tiers */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-10" />
              
              <div className="bg-zinc-950 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="w-4 h-4 text-white" />
                  <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Guest List</h3>
                </div>
                <div className="relative group">
                  <HelpCircle className="w-4 h-4 text-zinc-600 cursor-help transition-colors group-hover:text-white" />
                  <div className="absolute bottom-full right-0 mb-4 w-56 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-[10px] font-bold leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50">
                    Create multiple ticket tiers (VIP, Member Early Bird). Max capacity is auto-calculated.
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                {formData.ticket_tiers.map((tier, idx) => (
                  <div key={idx} className="p-6 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 space-y-6 relative group/tier shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3">
                         <div className="flex-1 space-y-2">
                           <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tier Name</label>
                           <Input
                            placeholder="e.g. Early Bird Access"
                            value={tier.name}
                            onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                            className="h-11 rounded-xl text-[13px] font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10"
                          />
                         </div>
                         {formData.ticket_tiers.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTier(idx)} 
                              className="mt-6 w-11 h-11 flex items-center justify-center bg-white rounded-xl border border-red-50 text-red-300 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Pricing Model</label>
                         <select
                          value={tier.tier_type}
                          onChange={(e) => handleTierChange(idx, 'tier_type', e.target.value)}
                          className={`h-11 w-full px-4 rounded-xl border border-zinc-100 font-black text-[10px] appearance-none shadow-none uppercase tracking-widest transition-all ${
                            tier.tier_type === 'free' ? 'bg-green-100/50 text-green-700 border-green-200' : 
                            tier.tier_type === 'donation' ? 'bg-purple-100/50 text-purple-700 border-purple-200' : 'bg-white text-zinc-900 border-zinc-100'
                          }`}
                        >
                          <option value="paid">Standard Entry (Paid)</option>
                          <option value="free">Complimentary (Free)</option>
                          <option value="donation">Contribution (Donation)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100/50">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Price (₹)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={tier.price}
                          disabled={tier.tier_type === 'free'}
                          onChange={(e) => handleTierChange(idx, 'price', parseFloat(e.target.value))}
                          className="h-12 rounded-xl text-lg font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Inventory Qty</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={tier.total_quantity}
                          onChange={(e) => handleTierChange(idx, 'total_quantity', parseInt(e.target.value) || 0)}
                          className="h-12 rounded-xl text-lg font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Sale Starts</label>
                        <Input
                          type="datetime-local"
                          value={tier.sale_start_at || ''}
                          onChange={(e) => handleTierChange(idx, 'sale_start_at', e.target.value)}
                          className="h-10 rounded-xl text-[10px] font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Sale Ends</label>
                        <Input
                          type="datetime-local"
                          value={tier.sale_end_at || ''}
                          onChange={(e) => handleTierChange(idx, 'sale_end_at', e.target.value)}
                          className="h-10 rounded-xl text-[10px] font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-100/50">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tier Perks</label>
                      <div className="flex flex-wrap gap-2">
                        {(tier.perks || []).map((perk, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-indigo-100 animate-in zoom-in-95 duration-200">
                            {perk}
                            <button 
                              type="button" 
                              onClick={() => {
                                const newPerks = (tier.perks || []).filter((_, i) => i !== pIdx)
                                handleTierChange(idx, 'perks', newPerks)
                              }}
                              className="hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <div className="w-full relative">
                          <Input 
                            placeholder="Add feature (e.g. Free Drink)..." 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const target = e.target as HTMLInputElement
                                const val = target.value.trim()
                                if (val) {
                                  handleTierChange(idx, 'perks', [...(tier.perks || []), val])
                                  target.value = ''
                                }
                              }
                            }}
                            className="h-10 rounded-xl text-[11px] font-bold bg-white border-dashed border-zinc-200 w-full pr-10"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={handleAddTier} 
                  className="w-full py-8 border-2 border-dashed border-zinc-100 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-indigo-600 hover:bg-indigo-50/30 hover:border-indigo-100 transition-all shadow-sm flex flex-col items-center justify-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                    <Plus className="w-6 h-6" />
                  </div>
                  New Guest Tier
                </button>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 text-white space-y-8 shadow-2xl shadow-zinc-950/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -z-0" />
              
              <div className="flex flex-col items-center justify-center space-y-3 relative z-10">
                <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <p className="text-[12px] font-black uppercase tracking-widest text-emerald-400">Total Fee: <span className="line-through text-white/30 ml-2 mr-1">₹499</span> ₹199</p>
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-tight text-center">One-time launch fee applies to all new experiences</p>
              </div>

              <div className="space-y-4 relative z-10">
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full h-20 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.1em] text-[18px] transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-0 py-6 group/pub shadow-xl shadow-emerald-900/40 border-b-4 border-emerald-700 hover:border-emerald-600"
                >
                  <span className="group-hover/pub:translate-y-[-1px] transition-transform">{loadingPublish ? 'Processing...' : 'Go Live Now'}</span>
                  {!loadingPublish && <span className="text-[10px] opacity-60 font-black tracking-widest">PROCEED TO PAYMENT</span>}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="w-full h-14 rounded-[1.2rem] bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white font-black uppercase tracking-widest text-[11px] transition-all active:scale-[0.98] border border-zinc-700"
                >
                  {loadingDraft ? 'Saving...' : 'Keep as Draft'}
                </Button>
              </div>

          </div>
        </div>
      </form>
    )
  }
