'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PhoneCall, 
  Power, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar as CalendarIcon, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  ShieldAlert,
  Loader2,
  X,
  IndianRupee,
  Save
} from 'lucide-react'
import { 
  toggleHostOnlineAction, 
  createHostSlotsAction, 
  deleteHostSlotAction,
  updateHostCallingPricingAction
} from '@/actions/call.actions'
import { toast } from 'sonner'
import IncomingCallAlert from './IncomingCallAlert'

interface HostCallingDashboardProps {
  hostProfile: any
  settings: any
  slots: any[]
  recentCalls: any[]
}

export default function HostCallingDashboard({
  hostProfile,
  settings,
  slots: initialSlots,
  recentCalls,
}: HostCallingDashboardProps) {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(Boolean(settings?.is_online))
  const [isTogglingOnline, setIsTogglingOnline] = useState(false)
  const [slots, setSlots] = useState(initialSlots)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [isCreatingSlot, setIsCreatingSlot] = useState(false)

  // New slot form state
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('18:30')
  const [slotPrice, setSlotPrice] = useState(settings?.rate_per_session || 49)

  // Call Pricing state
  const [callPrice, setCallPrice] = useState(settings?.rate_per_session || 49)
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false)

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingPrice(true)
    try {
      const res = await updateHostCallingPricingAction(Number(callPrice), 15)
      if (res.success) {
        toast.success(`Call pricing updated to ₹${callPrice} per 15-minute call!`)
        setSlotPrice(Number(callPrice))
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update pricing')
      }
    } catch {
      toast.error('An error occurred while updating pricing')
    } finally {
      setIsUpdatingPrice(false)
    }
  }

  const isApprovedForCalling = Boolean(settings?.is_enabled)

  const handleToggleOnline = async () => {
    setIsTogglingOnline(true)
    const nextOnline = !isOnline
    try {
      const res = await toggleHostOnlineAction(nextOnline)
      if (res.success) {
        setIsOnline(nextOnline)
        if (nextOnline) {
          toast.success("You're now online and ready to receive calls!")
        } else {
          toast.info("You've gone offline. You won't receive instant calls.")
        }
      } else {
        toast.error(res.error || 'Failed to update online status')
      }
    } catch {
      toast.error('Failed to change online status')
    } finally {
      setIsTogglingOnline(false)
    }
  }

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingSlot(true)

    try {
      const startDateTime = new Date(`${slotDate}T${startTime}:00`).toISOString()
      const endDateTime = new Date(`${slotDate}T${endTime}:00`).toISOString()

      const res = await createHostSlotsAction([
        {
          slotDate,
          startTime: startDateTime,
          endTime: endDateTime,
          price: Number(slotPrice),
        },
      ])

      if (res.success) {
        toast.success('Availability slot added!')
        setShowSlotModal(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to create slot')
      }
    } catch {
      toast.error('An error occurred while creating slot')
    } finally {
      setIsCreatingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await deleteHostSlotAction(slotId)
      if (res.success) {
        setSlots(slots.filter((s) => s.id !== slotId))
        toast.success('Slot removed')
      } else {
        toast.error(res.error || 'Failed to delete slot')
      }
    } catch {
      toast.error('Failed to delete slot')
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Global incoming call listener */}
      <IncomingCallAlert hostId={hostProfile.id} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black tracking-widest uppercase text-indigo-600">
              Stranger Mingle
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Audio Call Service
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Phone a Friend Hub
          </h1>
        </div>

        {isApprovedForCalling && (
          <button
            onClick={handleToggleOnline}
            disabled={isTogglingOnline}
            className={`px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-md ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 ring-4 ring-emerald-50'
                : 'bg-zinc-800 hover:bg-zinc-900 text-white shadow-zinc-200'
            }`}
          >
            {isTogglingOnline ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Power className={`w-4 h-4 ${isOnline ? 'text-emerald-300' : 'text-zinc-400'}`} />
            )}
            {isOnline ? 'You Are Online (Ready)' : 'You Are Offline'}
          </button>
        )}
      </div>

      {/* Verification Notice */}
      {!isApprovedForCalling ? (
        <div className="rounded-3xl bg-amber-50 border border-amber-200 p-8 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-amber-900">Phone a Friend Access Pending</h3>
            <p className="text-sm text-amber-800 font-medium leading-relaxed">
              This calling service is reserved for approved and verified hosts. Our administrative team will review your host profile and enable calling access shortly.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completed Calls</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {settings?.total_calls_completed || 0}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Talk Time</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {settings?.total_call_minutes || 0} Mins
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-100/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Caller Rating</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                    {settings?.rating_avg || '5.00'} / 5.0
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Settings Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-100/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  Call Pricing & Session Rate
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Decide how much callers are charged per 15-minute 1-on-1 audio call session.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePricing} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 max-w-xl">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Price per 15-min Call (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={callPrice}
                    onChange={(e) => setCallPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPrice}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 shadow-sm"
              >
                {isUpdatingPrice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Pricing
              </button>
            </form>
          </div>

          {/* Slots Management */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  Availability Slots
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Pre-schedule calendar times when users can book calls with you in advance.
                </p>
              </div>

              <button
                onClick={() => setShowSlotModal(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add Slot
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="py-12 text-center text-gray-400 font-medium text-sm">
                No upcoming slots scheduled. Add slots so users can book calls with you.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                        <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {new Date(slot.slot_date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {new Date(slot.start_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(slot.end_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-xs font-black text-indigo-600">₹{slot.price}</div>
                    </div>

                    {slot.status === 'available' ? (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {slot.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-100/40 space-y-6">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Sessions</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                History of your 1-on-1 audio conversations.
              </p>
            </div>

            {(!recentCalls || recentCalls.length === 0) ? (
              <div className="py-12 text-center text-gray-400 font-medium text-sm">
                No completed call sessions yet. Once users call you, they will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="py-3 px-4">Caller</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.map((call) => (
                      <tr key={call.id} className="border-b border-gray-100 text-xs font-medium text-gray-700">
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {call.user?.anonymous_alias || 'Anonymous Caller'}
                        </td>
                        <td className="py-3 px-4">
                          {call.duration_seconds > 0 ? `${Math.round(call.duration_seconds / 60)} mins` : '-'}
                        </td>
                        <td className="py-3 px-4 uppercase font-bold text-[10px] text-gray-500">
                          {call.call_type}
                        </td>
                        <td className="py-3 px-4">
                          {call.user_rating ? (
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{call.user_rating}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-400">
                          {new Date(call.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md border border-gray-100 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-black text-gray-900">Add Availability Slot</h3>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Slot Date
                </label>
                <input
                  type="date"
                  value={slotDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-600 mb-1.5">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={slotPrice}
                  onChange={(e) => setSlotPrice(Number(e.target.value))}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSlot}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider"
                >
                  {isCreatingSlot ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
