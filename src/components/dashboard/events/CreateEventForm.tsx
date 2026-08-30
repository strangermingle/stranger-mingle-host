'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Calendar,
  Clock,
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
  Globe,
  ChevronDown,
  Loader2,
  MessageCircle,
  Banknote,
  Shield,
  Sparkles,
  AlertCircle,
  ChevronsUpDown,
  Check
} from 'lucide-react'
import LocationPicker from './LocationPicker'

interface Category {
  id: string
  name: string
}

interface HostProfile {
  id: string
  display_name: string
}

interface PlatformConfig {
  gst_rate_pct: number
  platform_fee_pct: number
  max_tickets_per_booking: number
  currency_default: string
  waitlist_enabled: boolean
}

interface EventCreateFormProps {
  categories: Category[]
  hostProfiles: HostProfile[]
  initialData?: Record<string, unknown>
  eventId?: string
  platformConfig?: PlatformConfig
}

interface TicketTier {
  id?: string
  name: string
  tier_type: string
  price: number
  total_quantity: number
  max_per_booking: number
  description: string
  sale_start_at?: string | null
  sale_end_at?: string | null
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
    latitude?: string | number | null
    longitude?: string | number | null
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
  status: string
  tags: string[]
  cohosts: string[]
  age_restrictions: AgeRestriction[]
}

interface InitialEventData {
  title?: string
  host_id?: string
  category_id?: string
  start_datetime?: string
  end_datetime?: string
  timezone?: string
  ticketing_mode?: 'platform' | 'external' | 'free' | 'rsvp' | 'none'
  event_type?: 'in_person' | 'online' | 'hybrid'
  cover_image_url?: string
  vertical_poster_url?: string
  description?: string
  short_description?: string
  location_id?: string
  location?: {
    venue_name?: string
    address_line_1?: string
    city?: string
    state?: string
    country?: string
    postal_code?: string
    latitude?: number | null
    longitude?: number | null
  }
  online_event_url?: string
  online_platform?: string
  online_url_reveal?: string
  max_capacity?: number
  is_age_restricted?: boolean
  min_age?: number
  meta_title?: string
  meta_description?: string
  cover_image_alt?: string
  vertical_poster_alt?: string
  is_recurring?: boolean
  recurrence_rule?: string
  doors_open_at?: string
  ticket_tiers?: (TicketTier & { id?: string })[]
  agenda?: AgendaItem[]
  faqs?: FAQItem[]
  tags?: { tag: { name: string } }[]
  cohosts?: { host_user_id: string }[]
  age_restrictions?: AgeRestriction[]
  status?: string
  creation_fee_paid?: boolean
  event_images?: { image_url: string; is_cover: boolean; alt_text?: string | null }[]
}

// Format date string to YYYY-MM-DDTHH:mm for datetime-local input
const formatToDateTimeLocal = (dateStr?: string | null): string => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

// Current local time formatted for datetime-local input
const getNowDateTimeLocal = (): string => {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventCreateForm({ categories, hostProfiles, initialData: rawInitialData, eventId, platformConfig }: EventCreateFormProps) {
  const initialData = rawInitialData as InitialEventData | undefined
  const router = useRouter()
  const [loadingPublish, setLoadingPublish] = useState(false)
  const [loadingDraft, setLoadingDraft] = useState(false)
  const loading = loadingPublish || loadingDraft
  const [uploading, setUploading] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<{id: string, name: string}[]>([])
  const [otherHosts, setOtherHosts] = useState<{user_id: string, display_name: string, organisation_name: string | null}[]>([])
  const [customTag, setCustomTag] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Section open/collapsed states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    essentials: true,
    logistics: true,
    visuals: true,
    tickets: true,
    agenda: false,
    faqs: false,
    discovery: false,
    rules: false,
    seo: false
  })

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const toggleAllSections = (expand: boolean) => {
    setOpenSections({
      essentials: expand,
      logistics: expand,
      visuals: expand,
      tickets: expand,
      agenda: expand,
      faqs: expand,
      discovery: expand,
      rules: expand,
      seo: expand
    })
  }

  // Initial timing state
  const [timing, setTiming] = useState({
    startDate: initialData?.start_datetime ? new Date(initialData.start_datetime).toISOString().split('T')[0] : '',
    startTime: initialData?.start_datetime ? new Date(initialData.start_datetime).toLocaleTimeString('en-GB').substring(0, 5) : '19:00',
    endDate: initialData?.end_datetime ? new Date(initialData.end_datetime).toISOString().split('T')[0] : '',
    endTime: initialData?.end_datetime ? new Date(initialData.end_datetime).toLocaleTimeString('en-GB').substring(0, 5) : '22:00'
  })

  // Resolve cover and vertical poster from initialData or event_images
  const resolvedCoverImage = useMemo(() => {
    return initialData?.cover_image_url || initialData?.event_images?.find(i => i.is_cover)?.image_url || ''
  }, [initialData])

  const resolvedVerticalPoster = useMemo(() => {
    return initialData?.vertical_poster_url || initialData?.event_images?.find(i => !i.is_cover)?.image_url || ''
  }, [initialData])

  const defaultSaleEnd = useMemo(() => {
    if (initialData?.end_datetime) return formatToDateTimeLocal(initialData.end_datetime)
    if (timing.endDate && timing.endTime) return `${timing.endDate}T${timing.endTime}`
    return ''
  }, [initialData?.end_datetime, timing.endDate, timing.endTime])

  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    host_id: initialData?.host_id || hostProfiles[0]?.id || '',
    category_id: initialData?.category_id || categories[0]?.id || '',
    start_datetime: initialData?.start_datetime || '',
    end_datetime: initialData?.end_datetime || '',
    timezone: initialData?.timezone || 'Asia/Kolkata',
    ticketing_mode: initialData?.ticketing_mode || 'platform',
    event_type: initialData?.event_type || 'in_person',
    cover_image_url: resolvedCoverImage,
    vertical_poster_url: resolvedVerticalPoster,
    description: initialData?.description || '',
    short_description: initialData?.short_description || '',
    location_id: initialData?.location_id || '',
    location: {
      venue_name: initialData?.location?.venue_name || '',
      address_line_1: initialData?.location?.address_line_1 || '',
      city: initialData?.location?.city || '',
      state: initialData?.location?.state || '',
      country: initialData?.location?.country || 'India',
      postal_code: initialData?.location?.postal_code || '',
      latitude: initialData?.location?.latitude ?? '',
      longitude: initialData?.location?.longitude ?? ''
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
    cover_image_alt: initialData?.cover_image_alt || initialData?.event_images?.find(i => i.is_cover)?.alt_text || '',
    vertical_poster_alt: initialData?.vertical_poster_alt || initialData?.event_images?.find(i => !i.is_cover)?.alt_text || '',
    ticket_tiers: (initialData?.ticket_tiers && initialData.ticket_tiers.length > 0)
      ? initialData.ticket_tiers.map(t => ({
          id: t.id,
          name: t.name || '',
          tier_type: t.tier_type || 'paid',
          price: t.price || 0,
          total_quantity: t.total_quantity || 0,
          max_per_booking: t.max_per_booking || 10,
          description: t.description || '',
          sale_start_at: formatToDateTimeLocal(t.sale_start_at) || getNowDateTimeLocal(),
          sale_end_at: formatToDateTimeLocal(t.sale_end_at) || defaultSaleEnd,
          perks: t.perks || []
        }))
      : [
          {
            name: 'General Admission',
            tier_type: 'paid',
            price: 499,
            total_quantity: 100,
            max_per_booking: 5,
            description: '',
            sale_start_at: getNowDateTimeLocal(),
            sale_end_at: defaultSaleEnd,
            perks: []
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

  // Sync timing state to formData and automatically sync ticket tiers sale_end_at
  useEffect(() => {
    let start_datetime = formData.start_datetime
    if (timing.startDate && timing.startTime) {
      try {
        start_datetime = new Date(`${timing.startDate}T${timing.startTime}`).toISOString()
      } catch (e) {}
    }
    
    let end_datetime = formData.end_datetime
    let localEndString = ''
    if (timing.endDate && timing.endTime) {
      localEndString = `${timing.endDate}T${timing.endTime}`
      try {
        end_datetime = new Date(localEndString).toISOString()
      } catch (e) {}
    }

    setFormData(prev => {
      let updatedTiers = prev.ticket_tiers
      // If event end datetime is updated, automatically update ticket sale end dates if previously empty or synced
      if (localEndString) {
        updatedTiers = prev.ticket_tiers.map(t => {
          if (!t.sale_end_at || t.sale_end_at.startsWith(timing.endDate)) {
            return { ...t, sale_end_at: localEndString }
          }
          return t
        })
      }

      if (prev.start_datetime !== start_datetime || prev.end_datetime !== end_datetime || updatedTiers !== prev.ticket_tiers) {
        return { 
          ...prev, 
          start_datetime, 
          end_datetime,
          ticket_tiers: updatedTiers
        }
      }
      return prev
    })
  }, [timing.startDate, timing.startTime, timing.endDate, timing.endTime])

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

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    }
  }

  const handleChange = (field: string, value: string | number | boolean | object | null) => {
    clearFieldError(field)
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

  const handleTimingChange = (field: 'startDate' | 'startTime' | 'endDate' | 'endTime', value: string) => {
    clearFieldError(field)
    clearFieldError('dateTimeOrder')
    setTiming(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_url' | 'vertical_poster_url') => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    const existingUrl = formData[field]
    if (existingUrl) {
      await deleteImageAction(existingUrl, eventId)
    }
    
    setUploading(field)
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('type', field === 'vertical_poster_url' ? 'vertical' : 'landscape')
    const res = await uploadImageAction(eventId || 'new-event', uploadData, field === 'vertical_poster_url' ? 'vertical' : 'landscape')
    setUploading(null)
    if (res.success && res.url) {
      handleChange(field, res.url)
      clearFieldError(field)
      toast.success(field === 'vertical_poster_url' ? 'Vertical poster uploaded' : 'Cover image uploaded')
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
    if (!openSections.agenda) setOpenSections(prev => ({ ...prev, agenda: true }))
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
    if (!openSections.faqs) setOpenSections(prev => ({ ...prev, faqs: true }))
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
    if (!openSections.rules) setOpenSections(prev => ({ ...prev, rules: true }))
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
    clearFieldError(`tier_${field}_${idx}`)
    clearFieldError('ticket_tiers')
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
    const currentEndDateTime = (timing.endDate && timing.endTime) ? `${timing.endDate}T${timing.endTime}` : ''
    setFormData(prev => ({
      ...prev,
      ticket_tiers: [
        ...prev.ticket_tiers,
        {
          name: 'VIP Admission',
          tier_type: 'paid',
          price: 999,
          total_quantity: 50,
          max_per_booking: 5,
          description: '',
          sale_start_at: getNowDateTimeLocal(),
          sale_end_at: currentEndDateTime,
          perks: []
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

  // Section completion status helpers
  const isEssentialsComplete = useMemo(() => {
    return formData.title.trim().length >= 3 && !!formData.category_id
  }, [formData.title, formData.category_id])

  const isLogisticsComplete = useMemo(() => {
    const hasDates = !!timing.startDate && !!timing.startTime && !!timing.endDate && !!timing.endTime
    if (!hasDates) return false
    if (formData.event_type === 'online') {
      return !!(formData.online_platform || formData.online_event_url)
    }
    return !!(formData.location_id || formData.location.venue_name || formData.location.city)
  }, [timing, formData.event_type, formData.online_platform, formData.online_event_url, formData.location_id, formData.location])

  const isVisualsComplete = useMemo(() => {
    return !!formData.cover_image_url || !!formData.vertical_poster_url
  }, [formData.cover_image_url, formData.vertical_poster_url])

  const isTicketsComplete = useMemo(() => {
    return formData.ticket_tiers.length > 0 && formData.ticket_tiers.every(t => t.name.trim().length > 0 && t.total_quantity > 0)
  }, [formData.ticket_tiers])

  // Validation function
  const validateForm = (isDraft: boolean = true) => {
    const errors: Record<string, string> = {}
    const errorSections: string[] = []

    if (!formData.title || formData.title.trim().length < 3) {
      errors.title = 'Event title is required (at least 3 characters)'
      if (!errorSections.includes('essentials')) errorSections.push('essentials')
    }
    if (!formData.category_id) {
      errors.category_id = 'Please select a category'
      if (!errorSections.includes('essentials')) errorSections.push('essentials')
    }
    if (!timing.startDate) {
      errors.startDate = 'Start date is required'
      if (!errorSections.includes('logistics')) errorSections.push('logistics')
    }
    if (!timing.startTime) {
      errors.startTime = 'Start time is required'
      if (!errorSections.includes('logistics')) errorSections.push('logistics')
    }
    if (!timing.endDate) {
      errors.endDate = 'End date is required'
      if (!errorSections.includes('logistics')) errorSections.push('logistics')
    }
    if (!timing.endTime) {
      errors.endTime = 'End time is required'
      if (!errorSections.includes('logistics')) errorSections.push('logistics')
    }

    if (timing.startDate && timing.endDate && timing.startTime && timing.endTime) {
      try {
        const start = new Date(`${timing.startDate}T${timing.startTime}`)
        const end = new Date(`${timing.endDate}T${timing.endTime}`)
        if (end <= start) {
          errors.dateTimeOrder = 'Event end time must be after the start time'
          if (!errorSections.includes('logistics')) errorSections.push('logistics')
        }
      } catch (e) {}
    }

    if (formData.event_type === 'online') {
      if (!isDraft && !formData.online_event_url && !formData.online_platform) {
        errors.online_platform = 'Online platform or meeting URL is required'
        if (!errorSections.includes('logistics')) errorSections.push('logistics')
      }
    }

    if (!formData.ticket_tiers || formData.ticket_tiers.length === 0) {
      errors.ticket_tiers = 'At least one ticket tier is required'
      if (!errorSections.includes('tickets')) errorSections.push('tickets')
    } else {
      formData.ticket_tiers.forEach((t, i) => {
        if (!t.name || t.name.trim().length === 0) {
          errors[`tier_name_${i}`] = 'Tier name is required'
          if (!errorSections.includes('tickets')) errorSections.push('tickets')
        }
        if (t.total_quantity <= 0) {
          errors[`tier_total_quantity_${i}`] = 'Quantity must be at least 1'
          if (!errorSections.includes('tickets')) errorSections.push('tickets')
        }
      })
    }

    return { errors, errorSections }
  }

  const preparePayload = (status: string) => {
    const payload = { 
      ...formData, 
      status,
      ticket_tiers: formData.ticket_tiers.map(t => ({
        ...t,
        sale_start_at: t.sale_start_at ? new Date(t.sale_start_at).toISOString() : null,
        sale_end_at: t.sale_end_at ? new Date(t.sale_end_at).toISOString() : null,
      }))
    }

    if (payload.location) {
      payload.location = {
        ...payload.location,
        latitude: payload.location.latitude ? Number(payload.location.latitude) : null,
        longitude: payload.location.longitude ? Number(payload.location.longitude) : null,
      } as any
    }
    return payload
  }

  const handleSaveDraft = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const { errors, errorSections } = validateForm(true)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setOpenSections(prev => {
        const updated = { ...prev }
        errorSections.forEach(s => { updated[s] = true })
        return updated
      })
      toast.error('Please fill in the required fields highlighted in red.')
      setTimeout(() => {
        const firstErrorEl = document.querySelector('[data-has-error="true"]')
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 150)
      return
    }

    setLoadingDraft(true)
    const submissionData = new FormData()
    submissionData.append('data', JSON.stringify(preparePayload('draft')))
    
    try {
      const result = eventId 
        ? await updateEventAction(eventId, submissionData)
        : await createEventAction(submissionData)
        
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(eventId ? 'Draft saved successfully!' : 'Event draft created!')
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

    const { errors, errorSections } = validateForm(false)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setOpenSections(prev => {
        const updated = { ...prev }
        errorSections.forEach(s => { updated[s] = true })
        return updated
      })
      toast.error('Please complete all required fields before publishing.')
      setTimeout(() => {
        const firstErrorEl = document.querySelector('[data-has-error="true"]')
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 150)
      return
    }
    
    setLoadingPublish(true)
    
    try {
      const targetStatus = initialData?.creation_fee_paid ? 'published' : 'draft'
      const submissionData = new FormData()
      submissionData.append('data', JSON.stringify(preparePayload(targetStatus)))
      
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

      const orderResult = await createEventFeeOrderAction(currentEventId)
      if (orderResult.error) {
        setLoadingPublish(false)
        toast.error(orderResult.error)
        return
      }

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
      }

      if (!(window as unknown as { Razorpay: unknown }).Razorpay) {
        setLoadingPublish(false)
        toast.error('Payment gateway is still loading. Please try again in a few seconds.')
        return
      }

      // @ts-expect-error - Razorpay is loaded dynamically via script
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      console.error('handlePublish error:', err)
      toast.error('Something went wrong. Please try again.')
      setLoadingPublish(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8 pb-24">
      {/* Top Toolbar: Expand / Collapse All */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="uppercase tracking-widest text-[11px]">Structured Event Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggleAllSections(true)}
            className="h-8 px-3 rounded-xl border-zinc-200 text-zinc-600 font-bold text-[10px] uppercase tracking-wider hover:bg-zinc-50"
          >
            Expand All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toggleAllSections(false)}
            className="h-8 px-3 rounded-xl border-zinc-200 text-zinc-600 font-bold text-[10px] uppercase tracking-wider hover:bg-zinc-50"
          >
            Collapse All
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* Section 1: Basic Information / Essentials */}
        {/* ========================================================================= */}
        <div 
          className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-xl shadow-zinc-100/50 overflow-hidden relative ${
            fieldErrors.title || fieldErrors.category_id 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : 'border-zinc-100'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('essentials')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-md shadow-zinc-950/10 shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 1</span>
                  {isEssentialsComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (fieldErrors.title || fieldErrors.category_id) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Incomplete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                      Required
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Basic Information</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.essentials ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.essentials && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    {fieldErrors.title && <span className="text-[10px] font-bold text-red-500">{fieldErrors.title}</span>}
                  </div>
                  <Input
                    data-has-error={!!fieldErrors.title}
                    placeholder="e.g. The Secret Rooftop Social"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className={`h-14 rounded-2xl font-bold text-lg shadow-none focus:bg-white focus:ring-4 transition-all placeholder:text-zinc-300 ${
                      fieldErrors.title 
                        ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20' 
                        : 'border-zinc-100 bg-zinc-50/50 focus:ring-indigo-500/10 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      Category <span className="text-red-500">*</span>
                    </label>
                    {fieldErrors.category_id && <span className="text-[10px] font-bold text-red-500">{fieldErrors.category_id}</span>}
                  </div>
                  <div className="relative group">
                    <select
                      data-has-error={!!fieldErrors.category_id}
                      value={formData.category_id}
                      onChange={(e) => handleChange('category_id', e.target.value)}
                      className={`w-full h-14 px-5 rounded-2xl border font-black text-sm appearance-none shadow-none focus:bg-white focus:ring-4 transition-all cursor-pointer text-zinc-900 ${
                        fieldErrors.category_id 
                          ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/20 focus:border-red-500 focus:ring-red-500/20' 
                          : 'border-zinc-100 bg-zinc-50/50 focus:ring-indigo-500/10 focus:border-indigo-500'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-600 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Short Catchphrase</label>
                  <Input
                    placeholder="One sentence that hooks guests..."
                    value={formData.short_description}
                    onChange={(e) => handleChange('short_description', e.target.value)}
                    className="h-14 border-zinc-100 bg-zinc-50/50 rounded-2xl font-bold text-sm shadow-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Detailed Description</label>
                <Textarea
                  placeholder="Describe the mood, what to expect, and what makes this experience unforgettable..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="min-h-[160px] border-zinc-100 bg-zinc-50/50 rounded-[2rem] p-6 font-bold text-sm leading-relaxed shadow-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 2: Logistics / Time & Place */}
        {/* ========================================================================= */}
        <div 
          className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-xl shadow-zinc-100/50 overflow-hidden relative ${
            fieldErrors.startDate || fieldErrors.startTime || fieldErrors.endDate || fieldErrors.endTime || fieldErrors.dateTimeOrder || fieldErrors.online_platform 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : 'border-zinc-100'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('logistics')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 2</span>
                  {isLogisticsComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (fieldErrors.startDate || fieldErrors.endDate || fieldErrors.dateTimeOrder) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Incomplete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                      Required
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Logistics & Format</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.logistics ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.logistics && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-8 pt-2 border-t border-zinc-50">
              {fieldErrors.dateTimeOrder && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fieldErrors.dateTimeOrder}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Dates & Times */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                      </div>
                      <Input 
                        data-has-error={!!fieldErrors.startDate}
                        type="date" 
                        value={timing.startDate} 
                        onChange={(e) => handleTimingChange('startDate', e.target.value)} 
                        className={`h-12 rounded-xl font-bold text-sm transition-all ${
                          fieldErrors.startDate ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/20' : 'border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-amber-500/10'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        data-has-error={!!fieldErrors.startTime}
                        type="time" 
                        value={timing.startTime} 
                        onChange={(e) => handleTimingChange('startTime', e.target.value)} 
                        className={`h-12 rounded-xl font-bold text-sm transition-all ${
                          fieldErrors.startTime ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/20' : 'border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-amber-500/10'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        data-has-error={!!fieldErrors.endDate}
                        type="date" 
                        value={timing.endDate} 
                        onChange={(e) => handleTimingChange('endDate', e.target.value)} 
                        className={`h-12 rounded-xl font-bold text-sm transition-all ${
                          fieldErrors.endDate ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/20' : 'border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-amber-500/10'
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        data-has-error={!!fieldErrors.endTime}
                        type="time" 
                        value={timing.endTime} 
                        onChange={(e) => handleTimingChange('endTime', e.target.value)} 
                        className={`h-12 rounded-xl font-bold text-sm transition-all ${
                          fieldErrors.endTime ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/20' : 'border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-amber-500/10'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Experience Format & Location */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Experience Format</label>
                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-50 border border-zinc-100 rounded-2xl">
                      {['in_person', 'online', 'hybrid'].map(t => (
                        <button
                          key={t} type="button"
                          onClick={() => handleChange('event_type', t)}
                          className={`h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${
                            formData.event_type === t ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
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
                            <option value="">Select Platform</option>
                            <option value="Zoom">Zoom</option>
                            <option value="Google Meet">Google Meet</option>
                            <option value="Discord">Discord</option>
                            <option value="YouTube Live">YouTube Live</option>
                            <option value="Custom">Custom Platform</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                            <ChevronDown className="w-3 h-3" />
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
                            <ChevronDown className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                      <Input 
                        placeholder="Meeting URL / Stream Link (e.g. https://meet.google.com/...)" 
                        value={formData.online_event_url} 
                        onChange={(e) => handleChange('online_event_url', e.target.value)} 
                        className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm focus:bg-white transition-all" 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Total Capacity Display */}
              <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-950">Calculated Max Capacity:</span>
                  <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{formData.max_capacity} Guests</span>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase italic">* Automatically calculated from your ticket tiers</p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 3: Visuals & Media */}
        {/* ========================================================================= */}
        <div 
          className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-xl shadow-zinc-100/50 overflow-hidden relative ${
            fieldErrors.cover_image_url || fieldErrors.vertical_poster_url 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : 'border-zinc-100'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('visuals')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-md shadow-zinc-950/10 shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 3</span>
                  {isVisualsComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                      Optional in Draft
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Media & Posters</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.visuals ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.visuals && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cover Image (16:9) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Landscape Cover (16:9)</label>
                    <span className="text-[9px] font-bold text-zinc-400">Max 5MB</span>
                  </div>
                  <div className={`aspect-video relative rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-zinc-50 group hover:bg-zinc-100/50 ${formData.cover_image_url ? 'border-zinc-950 bg-white' : 'border-zinc-200'}`}>
                    {formData.cover_image_url ? (
                      <>
                        <Image 
                          src={formData.cover_image_url} 
                          alt={formData.cover_image_alt || "Cover Image"} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                          <span className="text-[10px] font-black text-white bg-black/60 px-5 py-2 rounded-full uppercase tracking-widest border border-white/20">Change Image</span>
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
                        <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Cover Image</span>
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

                {/* Vertical Poster (4:5) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Portrait Poster (4:5)</label>
                    <span className="text-[9px] font-bold text-zinc-400">Mobile Cards</span>
                  </div>
                  <div className={`aspect-[4/5] max-h-[280px] relative rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-zinc-50 group hover:bg-zinc-100/50 ${formData.vertical_poster_url ? 'border-zinc-950 bg-white' : 'border-zinc-200'}`}>
                    {formData.vertical_poster_url ? (
                      <>
                        <Image 
                          src={formData.vertical_poster_url} 
                          alt={formData.vertical_poster_alt || "Vertical Poster"} 
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                          <span className="text-[10px] font-black text-white bg-black/60 px-5 py-2 rounded-full uppercase tracking-widest border border-white/20">Change Poster</span>
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
                        <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Portrait Poster</span>
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
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 4: Guest List & Ticket Tiers */}
        {/* ========================================================================= */}
        <div 
          className={`bg-white rounded-[2.5rem] border transition-all duration-300 shadow-xl shadow-zinc-100/50 overflow-hidden relative ${
            fieldErrors.ticket_tiers || Object.keys(fieldErrors).some(k => k.startsWith('tier_')) 
              ? 'border-red-500 ring-2 ring-red-500/20' 
              : 'border-zinc-100'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('tickets')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 4</span>
                  {isTicketsComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Check className="w-3 h-3" /> Done
                    </span>
                  ) : (fieldErrors.ticket_tiers || Object.keys(fieldErrors).some(k => k.startsWith('tier_'))) ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 animate-pulse">
                      <AlertCircle className="w-3 h-3" /> Incomplete
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                      Required
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Ticket Tiers & Pricing</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.tickets ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.tickets && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="space-y-6">
                {formData.ticket_tiers.map((tier, idx) => (
                  <div key={idx} className="p-6 md:p-8 rounded-[2rem] bg-zinc-50/50 border border-zinc-100 space-y-6 relative group/tier shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                            Tier Name <span className="text-red-500">*</span>
                          </label>
                          {fieldErrors[`tier_name_${idx}`] && <span className="text-[9px] font-bold text-red-500">{fieldErrors[`tier_name_${idx}`]}</span>}
                        </div>
                        <Input
                          data-has-error={!!fieldErrors[`tier_name_${idx}`]}
                          placeholder="e.g. Early Bird Access, VIP Entry"
                          value={tier.name}
                          onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                          className={`h-12 rounded-xl text-sm font-black bg-white shadow-none ${
                            fieldErrors[`tier_name_${idx}`] ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20' : 'border-zinc-100 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                      </div>

                      <div className="w-full md:w-56 space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Pricing Model</label>
                        <select
                          value={tier.tier_type}
                          onChange={(e) => handleTierChange(idx, 'tier_type', e.target.value)}
                          className={`h-12 w-full px-4 rounded-xl border font-black text-xs appearance-none shadow-none uppercase tracking-widest transition-all ${
                            tier.tier_type === 'free' ? 'bg-green-50 text-green-700 border-green-200' : 
                            tier.tier_type === 'donation' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-zinc-900 border-zinc-100'
                          }`}
                        >
                          <option value="paid">Standard Entry (Paid)</option>
                          <option value="free">Complimentary (Free)</option>
                          <option value="donation">Contribution (Donation)</option>
                        </select>
                      </div>

                      {formData.ticket_tiers.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTier(idx)} 
                          className="mt-6 md:mt-7 w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm shrink-0"
                          title="Remove tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100/60">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Price (₹)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={tier.tier_type === 'free' ? 0 : tier.price}
                          disabled={tier.tier_type === 'free'}
                          onChange={(e) => handleTierChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="h-12 rounded-xl text-lg font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-40"
                        />
                        {platformConfig && tier.tier_type !== 'free' && tier.price > 0 && (
                          <div className="mt-2 px-3 py-2.5 bg-zinc-50 rounded-xl space-y-1.5 border border-zinc-100/50">
                            <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                              <span>Platform Fee ({platformConfig.platform_fee_pct}%)</span>
                              <span>-₹{(tier.price * (platformConfig.platform_fee_pct / 100)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                              <span>GST ({platformConfig.gst_rate_pct}%)</span>
                              <span>-₹{((tier.price * (platformConfig.platform_fee_pct / 100)) * (platformConfig.gst_rate_pct / 100)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest pt-1.5 mt-1 border-t border-zinc-200">
                              <span>Host Take-home</span>
                              <span>₹{(tier.price - (tier.price * (platformConfig.platform_fee_pct / 100)) - ((tier.price * (platformConfig.platform_fee_pct / 100)) * (platformConfig.gst_rate_pct / 100))).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                            Total Quantity <span className="text-red-500">*</span>
                          </label>
                          {fieldErrors[`tier_total_quantity_${idx}`] && <span className="text-[9px] font-bold text-red-500">{fieldErrors[`tier_total_quantity_${idx}`]}</span>}
                        </div>
                        <Input
                          data-has-error={!!fieldErrors[`tier_total_quantity_${idx}`]}
                          type="number"
                          placeholder="100"
                          value={tier.total_quantity}
                          onChange={(e) => handleTierChange(idx, 'total_quantity', parseInt(e.target.value) || 0)}
                          className={`h-12 rounded-xl text-lg font-black bg-white shadow-none ${
                            fieldErrors[`tier_total_quantity_${idx}`] ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20' : 'border-zinc-100 focus:ring-4 focus:ring-indigo-500/10'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Sale Start and End Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100/60">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Sale Starts (Auto: Now)</label>
                          <span className="text-[9px] font-bold text-zinc-400">Ticket Launch</span>
                        </div>
                        <Input
                          type="datetime-local"
                          value={tier.sale_start_at || ''}
                          onChange={(e) => handleTierChange(idx, 'sale_start_at', e.target.value)}
                          className="h-11 rounded-xl text-xs font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Sale Ends (Auto: Event End)</label>
                          <span className="text-[9px] font-bold text-zinc-400">Cutoff Time</span>
                        </div>
                        <Input
                          type="datetime-local"
                          value={tier.sale_end_at || ''}
                          onChange={(e) => handleTierChange(idx, 'sale_end_at', e.target.value)}
                          className="h-11 rounded-xl text-xs font-black bg-white border-zinc-100 shadow-none focus:ring-4 focus:ring-indigo-500/10"
                        />
                      </div>
                    </div>

                    {/* Perks */}
                    <div className="space-y-3 pt-4 border-t border-zinc-100/60">
                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tier Perks & Inclusions</label>
                      <div className="flex flex-wrap gap-2">
                        {(tier.perks || []).map((perk, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-100">
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
                            placeholder="Add feature (e.g. Free Welcome Drink, Front Row Seating) & press Enter..." 
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
                            className="h-11 rounded-xl text-xs font-bold bg-white border-dashed border-zinc-200 w-full pr-10"
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
                  className="w-full py-6 border-2 border-dashed border-zinc-200 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600" />
                  <span>Add Another Guest Tier</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 5: Experience Flow (Agenda) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('agenda')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 5</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                    {formData.agenda.length > 0 ? `${formData.agenda.length} Sessions` : 'Optional'}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Experience Flow & Agenda</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.agenda ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.agenda && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-zinc-400">Outline key sessions or milestones during your event.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddAgendaItem} 
                  className="h-10 px-4 rounded-xl border-zinc-200 bg-zinc-50 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                >
                  + Add Session
                </Button>
              </div>

              {formData.agenda.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed border-zinc-100 space-y-3">
                  <Clock className="w-6 h-6 text-zinc-300" />
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">No agenda items added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {formData.agenda.map((item: AgendaItem, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl border border-zinc-100 bg-zinc-50/40 space-y-4 relative group">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAgendaItem(idx)} 
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-zinc-100 text-zinc-300 hover:text-red-500 transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Session Title</label>
                          <Input placeholder="e.g. Welcome Drinks & Mixology" value={item.title} onChange={(e) => handleAgendaChange(idx, 'title', e.target.value)} className="h-11 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Start Time</label>
                            <Input type="time" value={item.start_time} onChange={(e) => handleAgendaChange(idx, 'start_time', e.target.value)} className="h-11 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">End Time</label>
                            <Input type="time" value={item.end_time} onChange={(e) => handleAgendaChange(idx, 'end_time', e.target.value)} className="h-11 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Description (Optional)</label>
                        <Input placeholder="Brief details about this specific session..." value={item.description} onChange={(e) => handleAgendaChange(idx, 'description', e.target.value)} className="h-11 border-zinc-100 bg-white rounded-xl text-xs font-bold shadow-none" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 6: Support & FAQs */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('faqs')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-violet-500 flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 6</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                    {formData.faqs.length > 0 ? `${formData.faqs.length} FAQs` : 'Optional'}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Common Questions & FAQs</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.faqs ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.faqs && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-zinc-400">Answer common questions guests might have before booking.</p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddFAQ} 
                  className="h-10 px-4 rounded-xl border-zinc-200 bg-zinc-50 font-black uppercase tracking-widest text-[9px] hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200"
                >
                  + Add FAQ
                </Button>
              </div>

              {formData.faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 rounded-2xl border-2 border-dashed border-zinc-100 space-y-3">
                  <MessageCircle className="w-6 h-6 text-zinc-300" />
                  <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">No FAQs added yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {formData.faqs.map((faq: FAQItem, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl border border-zinc-100 bg-zinc-50/40 space-y-4 relative group">
                      <button 
                        type="button" 
                        onClick={() => handleRemoveFAQ(idx)} 
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-zinc-100 text-zinc-300 hover:text-red-500 transition-all shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Question</label>
                        <Input placeholder="e.g. Is parking available at the venue?" value={faq.question} onChange={(e) => handleFAQChange(idx, 'question', e.target.value)} className="h-11 border-zinc-100 bg-white rounded-xl text-sm font-bold shadow-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider ml-1">Answer</label>
                        <Textarea placeholder="Provide a clear and friendly response..." value={faq.answer} onChange={(e) => handleFAQChange(idx, 'answer', e.target.value)} className="min-h-[80px] border-zinc-100 bg-white rounded-xl p-3 font-bold text-xs shadow-none" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 7: Discovery & Partners (Tags & Cohosts) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('discovery')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 7</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                    Optional
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Tags & Co-Hosts</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.discovery ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.discovery && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-8 pt-2 border-t border-zinc-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tags */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Tags & Themes</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Add tag..." 
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        onKeyDown={handleCustomTagAdd}
                        className="h-8 w-28 border-zinc-200 bg-zinc-50 text-[11px] font-bold px-3 rounded-full shadow-none"
                      />
                      <Button type="button" onClick={handleCustomTagAdd} variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-zinc-100">
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
                        className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                          formData.tags.includes(tag.name)
                            ? 'bg-zinc-950 border-zinc-950 text-white shadow-md scale-105'
                            : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
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
                        className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-950 border-zinc-950 text-white shadow-md scale-105 border transition-all"
                      >
                        #{tagName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Co-Hosts */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Co-Hosts & Partners</label>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {otherHosts.map((host) => (
                      <button
                        key={host.user_id}
                        type="button"
                        onClick={() => handleCohostToggle(host.user_id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          formData.cohosts.includes(host.user_id)
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                            : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-black uppercase">{host.display_name}</span>
                          <span className="text-[9px] font-bold text-zinc-400">{host.organisation_name || 'Individual Host'}</span>
                        </div>
                        {formData.cohosts.includes(host.user_id) ? (
                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-300 bg-white" />
                        )}
                      </button>
                    ))}
                    {otherHosts.length === 0 && (
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider italic py-4 text-center">No other host profiles found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 8: Entry Rules & Age Controls */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('rules')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 8</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                    Optional
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Entry Rules & Age Restrictions</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.rules ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.rules && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Minimum Age Requirement</label>
                  <div className="flex items-center gap-3 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                    <Input 
                      type="number" 
                      value={formData.min_age} 
                      onChange={(e) => handleChange('min_age', parseInt(e.target.value) || 0)} 
                      className="h-12 w-24 border-zinc-200 rounded-xl font-black text-lg text-zinc-900 bg-white" 
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-950 uppercase">Years & Above</span>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">Age Criterion</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider ml-1">Age Restriction Active</label>
                  <button 
                    type="button"
                    onClick={() => handleChange('is_age_restricted', !formData.is_age_restricted)}
                    className={`h-[82px] w-full rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 border ${
                      formData.is_age_restricted 
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-200' 
                        : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                    }`}
                  >
                    {formData.is_age_restricted ? 'Restriction Active (18+)' : 'Open to All Ages'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Section 9: Search & SEO */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50/50 rounded-bl-[5rem] -z-10" />

          {/* Accordion Header */}
          <button
            type="button"
            onClick={() => toggleSection('seo')}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-zinc-50/40 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-md shadow-cyan-600/20 shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Section 9</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500">
                    Optional
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 uppercase tracking-tighter mt-0.5">Search & SEO Discoverability</h3>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-300 ${openSections.seo ? 'rotate-180 bg-zinc-950 text-white' : ''}`}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>

          {/* Section Body */}
          {openSections.seo && (
            <div className="px-6 pb-8 md:px-10 md:pb-10 space-y-6 pt-2 border-t border-zinc-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Meta Title</label>
                  <Input
                    placeholder="Custom title for Google search..."
                    value={formData.meta_title}
                    onChange={(e) => handleChange('meta_title', e.target.value)}
                    className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm shadow-none focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Meta Description</label>
                  <Input
                    placeholder="Brief summary snippet for search results..."
                    value={formData.meta_description}
                    onChange={(e) => handleChange('meta_description', e.target.value)}
                    className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold text-sm shadow-none focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* Submit / Action Bar */}
        {/* ========================================================================= */}
        <div className="bg-zinc-950 rounded-[2.5rem] p-8 md:p-10 text-white space-y-6 shadow-2xl shadow-zinc-950/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[5rem] -z-0" />
          
          <div className="flex flex-col items-center justify-center space-y-2 relative z-10">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Launch Platform Fee: <span className="line-through text-white/30 ml-2 mr-1">₹499</span> ₹199
              </p>
            </div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] text-center">
              Save drafts anytime for free. Platform launch fee applies when taking your event live.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <Button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="w-full h-18 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.1em] text-lg transition-all active:scale-[0.98] flex flex-col items-center justify-center shadow-xl shadow-emerald-950/40 border-b-4 border-emerald-700"
            >
              <span>{loadingPublish ? 'Processing...' : 'Go Live Now'}</span>
              {!loadingPublish && <span className="text-[10px] opacity-60 font-black tracking-widest">PROCEED TO PAYMENT</span>}
            </Button>
            
            <Button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="w-full h-14 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white/80 hover:text-white font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] border border-zinc-700 flex items-center justify-center gap-2"
            >
              {loadingDraft ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <span>Keep as Draft</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
