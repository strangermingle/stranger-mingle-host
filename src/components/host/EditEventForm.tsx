'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEventSchema, updateEventSchema, type CreateEventInput } from '@/lib/validations/event.schemas'
import { updateEventAction, uploadImageAction, createEventFeeOrderAction, verifyEventFeePaymentAction } from '@/actions/event.actions'
import { Database } from '@/types/database.types'
import Script from 'next/script'
import { toast } from 'sonner'
import { Camera, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface EditEventFormProps {
  event: Database['public']['Tables']['events']['Row']
  categories: Category[]
  ticketTiers: any[]
}

const steps = ['Basics', 'Schedule', 'Location', 'Tickets']

export function EditEventForm({ event, categories, ticketTiers }: EditEventFormProps) {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState<Partial<CreateEventInput>>({
    title: event.title ?? '',
    category_id: event.category_id ?? '',
    event_type: (event.event_type ?? 'in_person') as any,
    ticketing_mode: (event.ticketing_mode ?? 'platform') as any,
    start_datetime: event.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
    end_datetime: event.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
    timezone: event.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_recurring: event.is_recurring ?? false,
    short_description: event.short_description ?? '',
    description: event.description ?? '',
    cover_image_url: event.cover_image_url ?? '',
    vertical_poster_url: (event as any).vertical_poster_url ?? '',
    is_age_restricted: event.is_age_restricted ?? false,
    min_age: event.min_age ?? null,
    refund_policy: (event.refund_policy ?? 'no_refund') as any,
    refund_policy_text: event.refund_policy_text ?? '',
    status: (event.status ?? 'published') as any,
    ticket_tiers: ticketTiers.map(t => ({
       name: t.name,
       tier_type: t.tier_type,
       tier_category: t.tier_category || 'general',
       price: t.price,
       total_quantity: t.total_quantity,
       max_per_booking: t.max_per_booking
    }))
  })

  const handleNext = () => {
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
         ...(prev.location || {}),
         [field]: value
      }
    }))
  }

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
    
    const uploadData = new FormData()
    uploadData.append('file', file)
    const res = await uploadImageAction(event.id, uploadData, field === 'vertical_poster_url' ? 'vertical' : 'landscape')
    if (res.error) {
      setErrorMsg(res.error)
    } else if (res.url) {
      handleChange(field, res.url)
    }
    setIsUploading(false)
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

  const submitForm = async (status: 'draft' | 'published') => {
    setErrorMsg(null)
    setIsSubmitting(true)
    
    try {
       let start = formData.start_datetime
       let end = formData.end_datetime
       
       if (start && typeof start === 'string' && start.length === 16) start = new Date(start).toISOString()
       if (end && typeof end === 'string' && end.length === 16) end = new Date(end).toISOString()

       const finalPayload = { ...formData, status, start_datetime: start, end_datetime: end }
       const parsed = updateEventSchema.parse(finalPayload)
       
       const builtFormData = new FormData()
       builtFormData.append('data', JSON.stringify(parsed))

       const res = await updateEventAction(event.id, builtFormData)
       if (res?.error) throw new Error(res.error)
       
       const hasPaid = (event as any).creation_fee_paid;

       if (status === 'draft' || hasPaid) {
         router.push(`/host-dashboard/${event.host_id}/events?success=${event.id}`)
         return
       }

       // Handle Publish if not paid
       const orderRes = await createEventFeeOrderAction(event.id)
       if (orderRes.error || !orderRes.orderId) {
         throw new Error(orderRes.error || 'Failed to initialize payment')
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
             const verifyRes = await verifyEventFeePaymentAction(event.id, response)
             if (verifyRes.error) {
               toast.error(verifyRes.error)
             } else {
               toast.success("Event published successfully!")
             }
             router.push(`/host-dashboard/${event.host_id}/events?success=${event.id}`)
           } catch (err) {
             toast.error("Payment verification failed")
           }
         },
         modal: {
           ondismiss: function() {
             toast.warning("Payment cancelled. Event saved as draft.")
             router.push(`/host-dashboard/${event.host_id}/events?success=${event.id}`)
           }
         },
         theme: {
           color: "#4F46E5"
         }
       };

       if (!(window as any).Razorpay) {
         throw new Error('Payment gateway is loading. Please try again.')
       }

       const rzp = new (window as any).Razorpay(options)
       rzp.on('payment.failed', function (response: any) {
         toast.error(`Payment failed: ${response.error.description}`)
       })
       rzp.open()

    } catch (err: any) {
       console.error(err)
       setErrorMsg(err?.message || 'Failed to update event.')
       setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div>
        <h1 className="text-2xl font-black text-gray-900">Edit Event</h1>
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, idx) => (
            <button 
              key={step} 
              onClick={() => setCurrentStep(idx)}
              className="flex flex-1 flex-col items-center"
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
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Horizontal Cover Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Cover Image (16:9) *</label>
              <div className={`aspect-video relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-yellow-50/50 group ${formData.cover_image_url ? 'border-zinc-950' : 'border-gray-100'}`}>
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
                <label className="absolute inset-0 cursor-pointer z-10">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_image_url')} disabled={isUploading} />
                </label>
                {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-[10px] font-black animate-pulse z-30 text-indigo-600">UPLOADING...</div>}
              </div>
            </div>

            {/* Vertical Poster Image */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Vertical Poster (4:5) *</label>
              <div className={`aspect-[4/5] relative rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-blue-50/50 group ${formData.vertical_poster_url ? 'border-zinc-950' : 'border-gray-100'}`}>
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
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
               >
                 <option value="">Select Category</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Format *</label>
               <select
                 value={formData.event_type}
                 onChange={(e) => handleChange('event_type', e.target.value)}
                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Full Details</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Schedule */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
               <label className="block text-sm font-medium text-gray-700">Event Starts *</label>
              <input
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => handleChange('start_datetime', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Event Ends *</label>
              <input
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => handleChange('end_datetime', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {currentStep === 2 && (
        <div className="space-y-6">
             <div className="space-y-6 rounded-lg border p-4 bg-gray-50/50 border-gray-200">
                <h3 className="font-semibold text-gray-900">Venue / Platform Info</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name / Link</label>
                  <input
                    type="text"
                    value={formData.location?.venue_name || ''}
                    onChange={(e) => handleLocationChange('venue_name', e.target.value)}
                    className="mt-1 w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white"
                  />
               </div>
               {formData.event_type !== 'online' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm mb-1">City</label>
                        <input value={formData.location?.city || ''} onChange={(e) => handleLocationChange('city', e.target.value)} className="w-full rounded border-gray-300 px-3 py-2 text-gray-900 bg-white" />
                    </div>
                 </div>
               )}
            </div>
        </div>
      )}

      {/* STEP 4: Tickets */}
      {currentStep === 3 && (
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

          {formData.ticketing_mode === 'platform' && (
             <div className="space-y-4">
               <h3 className="font-semibold">Ticket Tiers</h3>
                {formData.ticket_tiers?.map((tier: any, idx: number) => (
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
          className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50 hover:bg-gray-50"
        >
          Back
        </button>
        
        <div className="flex gap-3">
          {currentStep === steps.length - 1 ? (
             <>
               {!(event as any).creation_fee_paid ? (
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
                   onClick={() => submitForm('published')}
                   disabled={isSubmitting}
                    className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                 >
                   {isSubmitting ? 'Updating...' : 'Update Event'}
                 </button>
               )}
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
