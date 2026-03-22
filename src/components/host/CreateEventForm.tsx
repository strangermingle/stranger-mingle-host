'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event.schemas'
import { createEventAction, uploadImageAction, createEventFeeOrderAction, verifyEventFeePaymentAction } from '@/actions/event.actions'
import { mapPostgresError } from '@/lib/utils/error-mapper'
import Script from 'next/script'
import { toast } from 'sonner'
import { Camera, X } from 'lucide-react'
interface Category {
  id: string
  name: string
  slug: string
}

interface CreateEventFormProps {
  categories: Category[]
  pageId: string
}

const steps = ['Basics', 'Schedule', 'Location', 'Details', 'Tickets']

export function CreateEventForm({ categories, pageId }: CreateEventFormProps) {
  const router = useRouter()
  
  // High-level Wizard State
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_url' | 'vertical_poster_url') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    setIsUploading(true)
    setErrorMsg(null)
    
    // For a brand new event, we use a temporary placeholder or a unique ID if we had one.
    // We'll just use 'new-event' as the folder for now.
    const uploadData = new FormData()
    uploadData.append('file', file)
    const res = await uploadImageAction('new-event', uploadData, field === 'vertical_poster_url' ? 'vertical' : 'landscape')
    if (res.error) {
      setErrorMsg(res.error)
    } else if (res.url) {
      handleChange(field, res.url)
    }
    setIsUploading(false)
  }

  // Local drafted state backing Zod Schema requirements
  const [formData, setFormData] = useState<Partial<CreateEventInput>>({
    title: '',
    category_id: '',
    event_type: 'in_person',
    ticketing_mode: 'platform',
    start_datetime: '',
    end_datetime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_recurring: false,
    short_description: '',
    description: '',
    cover_image_url: '',
    vertical_poster_url: '',
    is_age_restricted: false,
    min_age: null,
    refund_policy: 'no_refund',
    refund_policy_text: '',
    status: 'published',
    ticket_tiers: [],
    agenda: [],
    faqs: [],
    tags: []
  })

  // Date/Time Split State
  const [schedule, setSchedule] = useState({
    startDate: formData.start_datetime ? formData.start_datetime.split('T')[0] : '',
    startTime: formData.start_datetime ? formData.start_datetime.split('T')[1]?.substring(0, 5) : '18:00',
    endDate: formData.end_datetime ? formData.end_datetime.split('T')[0] : '',
    endTime: formData.end_datetime ? formData.end_datetime.split('T')[1]?.substring(0, 5) : '21:00'
  })

  // Handlers
  const handleNext = () => {
    // Basic step validation could occur here by partially pinging `createEventSchema.pick({...})`
    // For scaffolding quickly we allow moving steps and validate comprehensively on Draft/Publish.
    setCurrentStep(s => Math.min(s + 1, steps.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = (field: keyof CreateEventInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
         ...(prev.location || { venue_name: '', address_line_1: '', city: '', state: '', country: '', postal_code: '' }),
         [field]: value
      }
    }))
  }

   const addTicketTier = () => {
      setFormData(prev => ({
        ...prev,
        ticket_tiers: [
          ...(prev.ticket_tiers || []),
          { name: '', tier_type: 'paid', tier_category: 'general', price: 0, total_quantity: 100, max_per_booking: 10 }
        ]
      }))
   }

  const removeTicketTier = (index: number) => {
     setFormData(prev => {
        const tiers = [...(prev.ticket_tiers || [])]
        tiers.splice(index, 1)
        return { ...prev, ticket_tiers: tiers }
     })
  }

  const handleTierChange = (index: number, field: string, value: any) => {
      setFormData(prev => {
         const tiers = [...(prev.ticket_tiers || [])]
         tiers[index] = { ...tiers[index], [field]: value }
         return { ...prev, ticket_tiers: tiers }
      })
  }

  const handleArrayChange = (field: 'agenda' | 'faqs' | 'tags', action: 'add' | 'remove' | 'update', index?: number, data?: any) => {
    setFormData(prev => {
      const list = [...(prev[field] || [])] as any[]
      if (action === 'add') list.push(data)
      else if (action === 'remove' && index !== undefined) list.splice(index, 1)
      else if (action === 'update' && index !== undefined) list[index] = { ...list[index], ...data }
      return { ...prev, [field]: list }
    })
  }

  const submitForm = async (status: 'draft' | 'published') => {
    setErrorMsg(null)
    setIsSubmitting(true)
    
    try {
       // Reconstruct ISO strings from separate date/time picks
       let startISO = ''
       let endISO = ''

       if (schedule.startDate && schedule.startTime) {
         startISO = `${schedule.startDate}T${schedule.startTime}:00Z`
       }
       if (schedule.endDate && schedule.endTime) {
         endISO = `${schedule.endDate}T${schedule.endTime}:00Z`
       }

       const finalPayload = { 
         ...formData, 
         status, 
         start_datetime: startISO, 
         end_datetime: endISO, 
         host_id: pageId 
       }
       const parsed = createEventSchema.parse(finalPayload)
       
       const builtFormData = new FormData()
       builtFormData.append('data', JSON.stringify(parsed))

       const res = await createEventAction(builtFormData)
       if (res?.error || !res?.id) {
         // Use error mapper for server-side errors
         setErrorMsg(res?.error || mapPostgresError(res))
         setIsSubmitting(false)
         return
       }
       
       if (status === 'draft') {
         router.push(`/host-dashboard/${pageId}/events?success=${res?.slug || ''}`)
         return
       }

       // Handle Publish (requires payment)
       const orderRes = await createEventFeeOrderAction(res.id)
       if (orderRes.error || !orderRes.orderId) {
         setErrorMsg(orderRes.error || 'Failed to initialize payment')
         setIsSubmitting(false)
         return
       }

       const options = {
         key: orderRes.keyId,
         amount: orderRes.amount,
         currency: "INR",
         name: "Stranger Mingle",
         description: "Event Creation Fee",
         order_id: orderRes.orderId,
         handler: async function (response: any) {
           try {
             const verifyRes = await verifyEventFeePaymentAction(res.id, response)
             if (verifyRes.error) {
               toast.error(verifyRes.error)
               router.push(`/host-dashboard/${pageId}/events`)
             } else {
               toast.success("Event published successfully!")
               router.push(`/host-dashboard/${pageId}/events?success=${res.slug}`)
             }
           } catch (err) {
             toast.error("Payment verification failed")
             router.push(`/host-dashboard/${pageId}/events`)
           }
         },
         modal: {
           ondismiss: function() {
             toast.warning("Payment cancelled. Event saved as draft.")
             router.push(`/host-dashboard/${pageId}/events`)
           }
         },
         theme: {
           color: "#4F46E5"
         }
       };

       if (!(window as any).Razorpay) {
         setErrorMsg('Payment gateway is loading. Please try again.')
         setIsSubmitting(false)
         return
       }

       const rzp = new (window as any).Razorpay(options)
       rzp.on('payment.failed', function (response: any) {
         toast.error(`Payment failed: ${response.error.description}`)
         router.push(`/host-dashboard/${pageId}/events`)
       })
       rzp.open()

    } catch (err: any) {
       console.error(err)
       // Check if it's a Zod error or something else
       if (err.name === 'ZodError') {
         const firstError = err.errors[0]?.message || 'Validation failed'
         setErrorMsg(firstError)
       } else {
         setErrorMsg(mapPostgresError(err))
       }
       setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Progress Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Create New Event</h1>
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, idx) => (
            <button 
              key={step} 
              onClick={() => setCurrentStep(idx)}
              className="flex flex-1 flex-col items-center group transition"
            >
               <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm transition-colors ${idx === currentStep ? 'bg-indigo-600 text-white' : idx < currentStep ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                 {idx + 1}
               </div>
               <span className={`mt-2 text-xs font-semibold ${idx === currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                 {step}
               </span>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {errorMsg && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
           {errorMsg}
        </div>
      )}

      {/* STEP 1: Basics */}
      {currentStep === 0 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              maxLength={255}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Horizontal Cover Image */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Cover Image (16:9) *</label>
                <div className={`aspect-video relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-yellow-50/50 group ${formData.cover_image_url ? 'border-zinc-950' : 'border-gray-200'}`}>
                  {formData.cover_image_url ? (
                    <>
                      <img src={formData.cover_image_url} alt="Cover" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white bg-black/50 px-3 py-1 rounded-full uppercase tracking-widest">Change Image</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleChange('cover_image_url', ''); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-yellow-600 transition-colors">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Upload Cover</span>
                    </div>
                  )}
                  {/* Entire box trigger */}
                  <label className="absolute inset-0 cursor-pointer z-10">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_url')} disabled={isUploading} />
                  </label>
                  {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-black animate-pulse z-30 text-indigo-600">UPLOADING...</div>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Vertical Poster (4:5) *</label>
                <div className={`aspect-[4/5] relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-blue-50/50 group ${formData.vertical_poster_url ? 'border-zinc-950' : 'border-gray-200'}`}>
                  {formData.vertical_poster_url ? (
                    <>
                      <img src={formData.vertical_poster_url} alt="Poster" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-black text-white bg-black/50 px-3 py-1 rounded-full uppercase tracking-widest">Change Poster</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleChange('vertical_poster_url', ''); }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-110 transition-all z-20"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase">Upload Poster</span>
                    </div>
                  )}
                  {/* Entire box trigger */}
                  <label className="absolute inset-0 cursor-pointer z-10">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'vertical_poster_url')} disabled={isUploading} />
                  </label>
                  {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-black animate-pulse z-30 text-indigo-600">UPLOADING...</div>}
                </div>
              </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
             <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
               <select
                 value={formData.category_id}
                 onChange={(e) => handleChange('category_id', e.target.value)}
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
               >
                 <option value="">Select Category</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Format *</label>
               <select
                 value={formData.event_type}
                 onChange={(e) => handleChange('event_type', e.target.value as any)}
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
               >
                 <option value="in_person">In Person</option>
                 <option value="online">Online</option>
                 <option value="hybrid">Hybrid</option>
               </select>
             </div>
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">Short Summary</label>
             <textarea
               value={formData.short_description || ''}
               onChange={(e) => handleChange('short_description', e.target.value)}
               rows={2}
               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
               placeholder="Briefly describe what your event is about (up to 500 chars)"
             />
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">Full Details</label>
             <textarea
               value={formData.description || ''}
               onChange={(e) => handleChange('description', e.target.value)}
               rows={6}
               className="mt-1 block w-full font-mono rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
               placeholder="Add complete details, agenda, and requirements here..."
             />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-4 border-t border-gray-100">
             <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="checkbox" 
                     checked={formData.is_age_restricted}
                     onChange={e => handleChange('is_age_restricted', e.target.checked)}
                     className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                   />
                   <span className="text-sm font-medium text-gray-700">Age Restricted Event?</span>
                </label>
                {formData.is_age_restricted && (
                   <div className="animate-in fade-in duration-300">
                      <label className="block text-xs text-gray-500 mb-1">Minimum Age Required</label>
                      <input 
                        type="number" 
                        value={formData.min_age || ''} 
                        onChange={e => handleChange('min_age', e.target.value ? Number(e.target.value) : null)}
                        placeholder="e.g. 18"
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                   </div>
                )}
             </div>

             <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Refund Policy</label>
                <select
                  value={formData.refund_policy}
                  onChange={e => handleChange('refund_policy', e.target.value)}
                  className="w-full rounded border-gray-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="no_refund">No Refunds</option>
                  <option value="flexible">Flexible (24h before)</option>
                  <option value="moderate">Moderate (7d before)</option>
                  <option value="strict">Strict (30d before)</option>
                  <option value="custom">Custom Policy</option>
                </select>
                {formData.refund_policy === 'custom' && (
                   <textarea
                     value={formData.refund_policy_text || ''}
                     onChange={e => handleChange('refund_policy_text', e.target.value)}
                     rows={3}
                     placeholder="Specify your custom refund terms..."
                     className="mt-2 w-full rounded border-gray-300 px-3 py-2 text-sm bg-white"
                   />
                )}
             </div>
          </div>
        </div>
      )}

      {/* STEP 2: Schedule */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Start Schedule</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={schedule.startDate}
                      onChange={(e) => setSchedule(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Start Time</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
               <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">End Schedule</h3>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">End Date</label>
                    <input
                      type="date"
                      value={schedule.endDate}
                      onChange={(e) => setSchedule(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase">End Time</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => setSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Doors Open</label>
              <input
                type="time" // We mock input matching backend expectations conceptually
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm bg-white"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Timezone *</label>
              <input
                type="text"
                readOnly
                value={formData.timezone}
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
           {['in_person', 'hybrid'].includes(formData.event_type!) && (
               <div className="space-y-6 rounded-lg border p-4 bg-gray-50/50 border-gray-200">
                  <h3 className="font-semibold text-gray-900">Physical Venue</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                   <input
                     type="text"
                     placeholder="e.g. Central Library"
                     value={formData.location?.venue_name || ''}
                     onChange={(e) => handleLocationChange('venue_name', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white"
                   />
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                   <input
                     type="text"
                     value={formData.location?.address_line_1 || ''}
                     onChange={(e) => handleLocationChange('address_line_1', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm mb-1">City</label>
                        <input value={formData.location?.city || ''} onChange={(e) => handleLocationChange('city', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">State</label>
                        <input value={formData.location?.state || ''} onChange={(e) => handleLocationChange('state', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Country</label>
                        <input value={formData.location?.country || ''} onChange={(e) => handleLocationChange('country', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Postal Code</label>
                        <input value={formData.location?.postal_code || ''} onChange={(e) => handleLocationChange('postal_code', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                 </div>
              </div>
           )}

            {['online', 'hybrid'].includes(formData.event_type!) && (
               <div className="space-y-6 rounded-lg border p-4 bg-gray-50/50 border-gray-200">
                  <h3 className="font-semibold text-gray-900">Virtual Stream</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform</label>
                   <select
                     value={formData.online_platform || ''}
                     onChange={(e) => handleChange('online_platform', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2"
                   >
                     <option value="">Select Platform</option>
                     <option value="Zoom">Zoom</option>
                     <option value="Google Meet">Google Meet</option>
                     <option value="Microsoft Teams">Microsoft Teams</option>
                     <option value="Custom Link">Custom Link</option>
                   </select>
                 </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event URL</label>
                   <input
                     type="url"
                     placeholder="https://..."
                     value={formData.online_event_url || ''}
                     onChange={(e) => handleChange('online_event_url', e.target.value)}
                     className="mt-1 w-full rounded border-gray-300 px-3 py-2"
                   />
                 </div>
              </div>
           )}
        </div>
      )}

      {/* STEP 4: Details (Agenda, FAQs, Tags) */}
      {currentStep === 3 && (
        <div className="space-y-8 animate-in slide-in-from-right-4">
          {/* Agenda */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Event Agenda</h3>
            <div className="space-y-4">
              {formData.agenda?.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 bg-zinc-50 p-4 relative group">
                  <button onClick={() => handleArrayChange('agenda', 'remove', idx)} className="absolute right-3 top-3 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-bold">Remove</button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input 
                      placeholder="Session Title" 
                      value={item.title} 
                      onChange={e => handleArrayChange('agenda', 'update', idx, { title: e.target.value })}
                      className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={item.start_time} 
                        onChange={e => handleArrayChange('agenda', 'update', idx, { start_time: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                      <input 
                        type="time" 
                        value={item.end_time || ''} 
                        onChange={e => handleArrayChange('agenda', 'update', idx, { end_time: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <textarea 
                      placeholder="Session Description (Optional)" 
                      value={item.description || ''} 
                      onChange={e => handleArrayChange('agenda', 'update', idx, { description: e.target.value })}
                      className="w-full rounded border-gray-300 px-3 py-2 text-sm sm:col-span-2"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleArrayChange('agenda', 'add', undefined, { title: '', start_time: '12:00', description: '' })}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                + Add Agenda Item
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* FAQs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Common FAQs</h3>
            <div className="space-y-4">
              {formData.faqs?.map((faq, idx) => (
                <div key={idx} className="rounded-lg border border-gray-100 bg-zinc-50 p-4 relative group">
                   <button onClick={() => handleArrayChange('faqs', 'remove', idx)} className="absolute right-3 top-3 text-red-500 opacity-0 group-hover:opacity-100 text-xs font-bold">Remove</button>
                   <div className="space-y-3">
                      <input 
                        placeholder="Question" 
                        value={faq.question} 
                        onChange={e => handleArrayChange('faqs', 'update', idx, { question: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                      />
                      <textarea 
                        placeholder="Answer" 
                        value={faq.answer} 
                        onChange={e => handleArrayChange('faqs', 'update', idx, { answer: e.target.value })}
                        className="w-full rounded border-gray-300 px-3 py-2 text-sm"
                        rows={2}
                      />
                   </div>
                </div>
              ))}
              <button 
                onClick={() => handleArrayChange('faqs', 'add', undefined, { question: '', answer: '' })}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
              >
                + Add FAQ
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                  {tag}
                  <button onClick={() => handleArrayChange('tags', 'remove', idx)} className="hover:text-red-500">×</button>
                </span>
              ))}
              <input 
                placeholder="Add tag and press Enter" 
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !formData.tags?.includes(val)) {
                      handleArrayChange('tags', 'add', undefined, val)
                      ;(e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className="rounded-full border border-gray-300 px-4 py-1 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Tickets */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticketing Method *</label>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
               {[
                 { id: 'platform', label: 'Sell via Platform' },
                 { id: 'external', label: 'External Link' },
                 { id: 'free', label: 'Free Event' },
                 { id: 'rsvp', label: 'RSVP Only' }
               ].map(opt => (
                 <label key={opt.id} className={`flex cursor-pointer items-center justify-center rounded-lg border p-4 text-sm font-semibold transition-all hover:bg-gray-50 ${formData.ticketing_mode === opt.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700'}`}>
                   <input type="radio" name="ticketing" className="hidden" checked={formData.ticketing_mode === opt.id} onChange={() => handleChange('ticketing_mode', opt.id)} />
                   {opt.label}
                 </label>
               ))}
             </div>
          </div>

          {formData.ticketing_mode === 'external' && (
             <div>
               <label className="block text-sm font-medium mb-1">External Ticket URL *</label>
               <input type="url" placeholder="https://eventbrite.com/..." className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" value={formData.external_ticket_url || ''} onChange={e => handleChange('external_ticket_url', e.target.value)} />
             </div>
          )}

          {(formData.ticketing_mode === 'free' || formData.ticketing_mode === 'rsvp') && (
             <div>
               <label className="block text-sm font-medium mb-1">Maximum Capacity (Optional)</label>
               <input type="number" placeholder="Leave blank for unlimited" className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" value={formData.max_capacity || ''} onChange={e => handleChange('max_capacity', Number(e.target.value))} />
             </div>
          )}

          {formData.ticketing_mode === 'platform' && (
             <div className="space-y-4">
               <h3 className="font-semibold">Ticket Tiers</h3>
                {formData.ticket_tiers?.map((tier, idx) => (
                   <div key={idx} className="relative rounded-lg border border-gray-200 p-4 bg-gray-50 group">
                      <button onClick={() => removeTicketTier(idx)} className="absolute right-3 top-3 text-red-500 hover:text-red-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition">Remove</button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Tier Name</label>
                             <input value={tier.name} onChange={e => handleTierChange(idx, 'name', e.target.value)} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" placeholder="e.g. Early Bird" />
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Category</label>
                            <select 
                              value={tier.tier_category} 
                              onChange={e => handleTierChange(idx, 'tier_category', e.target.value)}
                              className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white"
                            >
                               <option value="general">General</option>
                               <option value="boys">Boys</option>
                               <option value="girls">Girls</option>
                               <option value="stag">Stag</option>
                               <option value="couple">Couple</option>
                               <option value="vip">VIP</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Price (₹)</label>
                            <input type="number" value={tier.price} onChange={e => handleTierChange(idx, 'price', Number(e.target.value))} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" />
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Total Qty</label>
                            <input type="number" value={tier.total_quantity} onChange={e => handleTierChange(idx, 'total_quantity', Number(e.target.value))} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" />
                         </div>
                         <div>
                            <label className="block text-xs mb-1 font-bold text-gray-400">Max/Booking</label>
                             <input type="number" value={tier.max_per_booking} onChange={e => handleTierChange(idx, 'max_per_booking', Number(e.target.value))} className="w-full rounded border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white" />
                         </div>
                      </div>
                  </div>
               ))}
               <button onClick={addTicketTier} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  + Add Ticket Tier
               </button>
             </div>
          )}
        </div>
      )}

      {/* Button Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50 hover:bg-gray-50"
        >
          Back
        </button>
        
        <div className="flex gap-3">
          {currentStep === steps.length - 1 ? (
             <>
               <button
                 onClick={() => submitForm('draft')}
                 disabled={isSubmitting}
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
               >
                 Save Draft
               </button>
               <button
                 onClick={() => submitForm('published')}
                 disabled={isSubmitting}
                  className="rounded-md flex items-center gap-2 bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
               >
                 {isSubmitting ? 'Publishing...' : (
                   <>
                     <span>Publish Event</span>
                     <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                       <span className="line-through opacity-70">₹499</span>
                       <span>₹199</span>
                     </span>
                   </>
                 )}
               </button>
             </>
          ) : (
            <button
               onClick={handleNext}
                className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
               Next
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
