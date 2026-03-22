'use client'

import { useState } from 'react'
import { Ticket, Minus, Plus, Loader2 } from 'lucide-react'
import { initiateBookingAction, verifyPaymentAction } from '@/actions/booking.actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Script from 'next/script'

interface TicketTier {
  id: string
  name: string
  price: number
  currency: string
  total_quantity: number
  sold_count: number
  reserved_count: number
  max_per_booking: number
  tier_category: string
}

interface TicketSectionProps {
  eventId: string
  ticketTiers: TicketTier[]
  slug: string
}

export function TicketSection({ eventId, ticketTiers, slug }: TicketSectionProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const updateQty = (tierId: string, delta: number) => {
    const current = quantities[tierId] || 0
    const tier = ticketTiers.find(t => t.id === tierId)
    if (!tier) return
    
    const max = tier.max_per_booking || 5
    const next = Math.max(0, Math.min(max, current + delta))
    setQuantities(prev => ({ ...prev, [tierId]: next }))
  }

  const selectedItems = Object.entries(quantities).filter(([_, qty]) => qty > 0)
  const hasSelected = selectedItems.length > 0
  
  const subtotal = selectedItems.reduce((acc, [id, qty]) => {
    const tier = ticketTiers.find(t => t.id === id)
    return acc + (tier?.price || 0) * qty
  }, 0)

  // GST & Fees logic matching server
  const taxable_amount = subtotal
  const platform_fee = taxable_amount * 0.10
  const gst_on_fee = platform_fee * 0.18
  const totalAmount = taxable_amount + gst_on_fee

  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Check if form is valid
  const isFormValid = guestInfo.name.length >= 3 && guestInfo.email.includes('@') && guestInfo.phone.length >= 10

  const handleCheckout = async () => {
    if (!hasSelected) return
    if (!isFormValid) {
      toast.error("Please fill in your correct contact details.")
      return
    }
    
    setLoading(true)
    try {
      // 1. Initiate booking
      const res = await initiateBookingAction({
        event_id: eventId,
        attendee_name: guestInfo.name,
        attendee_email: guestInfo.email,
        attendee_phone: guestInfo.phone,
        items: selectedItems.map(([id, qty]) => ({
          ticket_tier_id: id,
          quantity: qty
        }))
      })

      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to initiate booking')
      }

      const { bookingId, bookingRef, razorpayOrderId, keyId } = res.data

      // 2. If free, redirect immediately (as server confirms it)
      if (totalAmount <= 0) {
        toast.success("Booking confirmed!")
        router.push(`/events/${slug}?booking=success&ref=${bookingRef}`)
        return
      }

      // 3. Open Razorpay
      if (!(window as any).Razorpay) {
        throw new Error('Razorpay is loading, please try again.')
      }

      const options = {
        key: keyId,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Stranger Mingle",
        description: `Tickets for ${slug}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          setLoading(true)
          const verifyRes = await verifyPaymentAction({
            ...response,
            bookingRef
          })
          
          if (verifyRes.success) {
            toast.success("Payment Received! Your tickets are confirmed.")
            router.push(`/events/${slug}?booking=success&ref=${bookingRef}`)
          } else {
            toast.error(verifyRes.error || "Payment verification failed")
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            toast.info("Payment cancelled")
          }
        },
        theme: {
          color: "#4F46E5"
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "An error occurred during checkout")
      setLoading(false)
    }
  }

  return (
    <section id="tickets-section" className="scroll-mt-24 space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200">
           <Ticket className="h-4 w-4" />
        </div>
        <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter">Get Your Tickets</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Full Name</label>
          <input 
            type="text" value={guestInfo.name} 
            onChange={e => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Karan Sharma"
            className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Email Address</label>
          <input 
            type="email" value={guestInfo.email} 
            onChange={e => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="karan@example.com"
            className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-2">Phone Number</label>
          <input 
            type="tel" value={guestInfo.phone} 
            onChange={e => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+91 99999 99999"
            className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 font-bold focus:border-indigo-600 focus:bg-white transition-all outline-none" 
          />
        </div>
      </div>

      <div className="space-y-4">
        {ticketTiers.map(tier => {
          const qty = quantities[tier.id] || 0
          const available = tier.total_quantity - (tier.sold_count || 0) - (tier.reserved_count || 0)
          const isSoldOut = available <= 0

          return (
            <div key={tier.id} className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-3xl border p-6 transition-all ${isSoldOut ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-50 border-gray-100'}`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="font-black text-gray-900 uppercase tracking-tight">{tier.name}</h3>
                   {isSoldOut && <span className="text-[10px] font-black text-red-500 uppercase px-2 py-0.5 bg-red-50 rounded-full">Sold Out</span>}
                </div>
                <p className="text-sm font-bold text-indigo-600 tracking-tight">₹{tier.price} <span className="text-gray-400 font-medium ml-1">+ Taxes</span></p>
                <div className="flex items-center gap-2 pt-1">
                   <span className="text-[10px] lowercase text-gray-400 font-medium">{available} available</span>
                   <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                   <span className="text-[10px] lowercase text-gray-400 font-medium">Max {tier.max_per_booking}</span>
                </div>
              </div>

              {!isSoldOut && (
                <div className="mt-4 sm:mt-0 flex items-center gap-4 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => updateQty(tier.id, -1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-100 text-zinc-950 hover:bg-zinc-50 transition-all font-black shadow-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-lg font-black text-indigo-950">{qty}</span>
                  <button 
                    onClick={() => updateQty(tier.id, 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 transition-all font-black shadow-lg shadow-zinc-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasSelected && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-white border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-20 z-40">
           <div className="mx-auto max-w-4xl flex items-center justify-between gap-8">
              <div className="hidden sm:block space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to pay</p>
                 <h4 className="text-2xl font-black text-indigo-950 tracking-tighter">₹{totalAmount.toFixed(2)}</h4>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 h-16 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm & Pay'}
                <span className="sm:hidden ml-auto">₹{totalAmount.toFixed(2)}</span>
              </button>
           </div>
        </div>
      )}
    </section>
  )
}
