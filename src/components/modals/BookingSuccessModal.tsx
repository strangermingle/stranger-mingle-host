'use client'

import { useState } from 'react'
import { CheckCircle2, Calendar, MapPin, X, ArrowRight, Download, Share2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface BookingSuccessProps {
  booking: any
  onClose: () => void
}

export function BookingSuccessModal({ booking, onClose }: BookingSuccessProps) {
  if (!booking) return null

  const event = booking.events || booking

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Visual Header */}
        <div className="relative h-64 w-full">
           <Image 
             src={booking.coverImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'} 
             alt={booking.eventTitle} 
             fill 
             className="object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
           <div className="absolute bottom-8 left-8 right-8">
              <div className="flex items-center gap-3 mb-4">
                 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Booking Confirmed</p>
                    <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter">{booking.eventTitle}</h2>
                 </div>
              </div>
           </div>
        </div>

        {/* Ticket Details */}
        <div className="p-8 sm:p-12 space-y-8">
           <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                 <div className="flex items-center gap-2 text-sm font-bold text-zinc-950">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>{new Date(booking.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                 <div className="flex items-center gap-2 text-sm font-bold text-zinc-950">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span className="truncate">{booking.venueName}, {booking.city}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-zinc-50 border border-gray-100">
              <div className="space-y-1 text-center sm:text-left">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Your Booking Reference</p>
                 <h4 className="text-xl font-black text-indigo-950 tracking-widest uppercase">{booking.bookingRef}</h4>
                 <p className="text-[9px] font-bold text-gray-400 uppercase">Emailed to {booking.attendeeEmail}</p>
              </div>
              <div className="flex items-center gap-2">
                 <button className="flex h-12 px-6 items-center gap-2 rounded-2xl bg-white border border-gray-200 text-zinc-950 font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-gray-50 transition-all">
                    <Download className="w-4 h-4" />
                    Tickets
                 </button>
                 <button className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-gray-200 text-zinc-950 hover:bg-gray-50 shadow-sm transition-all">
                    <Share2 className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="pt-4 flex items-center justify-center gap-4">
              <Link 
                href="/bookings" 
                className="flex h-14 items-center gap-3 px-12 bg-zinc-950 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                 View My Tickets
                 <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  )
}
