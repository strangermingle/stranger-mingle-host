import { createClient } from '@/lib/supabase/server'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { redirect } from 'next/navigation'
import {
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react'
import { format } from 'date-fns'
import { getPlatformConfig } from '@/lib/repositories/platform.repository'
import { Info } from 'lucide-react'


export default async function MyEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await getUserWithHostProfile(user.id)
  const hostProfile = dbUser?.host_profile
  const hostProfileId = hostProfile?.id

  const platformConfig = await getPlatformConfig()


  // Fetch all events for this host
  let events: any[] = []
  if (hostProfileId) {
    const { data } = await supabase
      .from('events')
      .select('id, title, slug, status, start_datetime, booking_count, max_capacity')
      .eq('host_id', hostProfileId)
      .order('start_datetime', { ascending: false })
    events = data || []
  }

  const eventIds = events.map((e: any) => e.id)

  // Fetch all confirmed bookings for the host's events
  let bookings: any[] = []
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from('bookings')
      .select('id, event_id, total_amount, subtotal, platform_fee, gst_on_fee, host_payout, status, created_at, taxable_amount, discount_amount')
      .in('event_id', eventIds)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
    bookings = data || []
  }

  // Calculate aggregates
  const totalRevenue = bookings.reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0)
  const totalHostEarnings = bookings.reduce((sum: number, b: any) => sum + Number(b.host_payout || 0), 0)
  const totalPlatformFees = bookings.reduce((sum: number, b: any) => sum + Number(b.platform_fee || 0), 0)
  const totalGST = bookings.reduce((sum: number, b: any) => sum + Number(b.gst_on_fee || 0), 0)
  const totalDiscounts = bookings.reduce((sum: number, b: any) => sum + Number(b.discount_amount || 0), 0)

  // Per-event breakdown
  const eventBreakdown = events.map((event: any) => {
    const eventBookings = bookings.filter((b: any) => b.event_id === event.id)
    const revenue = eventBookings.reduce((s: number, b: any) => s + Number(b.total_amount || 0), 0)
    const earnings = eventBookings.reduce((s: number, b: any) => s + Number(b.host_payout || 0), 0)
    const fees = eventBookings.reduce((s: number, b: any) => s + Number(b.platform_fee || 0), 0)
    return {
      ...event,
      bookingCount: eventBookings.length,
      revenue,
      earnings,
      fees,
    }
  }).filter((e: any) => e.bookingCount > 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">My Earnings</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Revenue analytics and breakdown (Read Only)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Gross Revenue</p>
            <IndianRupee className="w-4 h-4 text-gray-300" />
          </div>
          <p className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-green-600">Your Earnings</p>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-black text-green-700">₹{totalHostEarnings.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Platform Fees</p>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-500">₹{totalPlatformFees.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">GST on Fees</p>
            <ArrowDownRight className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-2xl font-black text-orange-500">₹{totalGST.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Confirmed Bookings</p>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-gray-900">{bookings.length}</p>
        </div>
      </div>

      {/* Platform Rates Info */}
      <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          <Info className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-indigo-900 uppercase tracking-tight">Active Platform Rates</h4>
          <p className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-widest leading-relaxed">
            Earnings are calculated based on a <span className="text-indigo-700">{platformConfig.platform_fee_pct}% platform fee</span> and 
            <span className="text-indigo-700"> {platformConfig.gst_rate_pct}% GST</span> on the fee.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">Commission</p>
            <p className="text-sm font-black text-indigo-700">{platformConfig.platform_fee_pct}%</p>
          </div>
          <div className="text-right border-l border-indigo-100 pl-4">
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter">GST (on Fee)</p>
            <p className="text-sm font-black text-indigo-700">{platformConfig.gst_rate_pct}%</p>
          </div>
        </div>
      </div>


      {/* Per-Event Breakdown */}
      {eventBreakdown.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Per-Event Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bookings</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fees</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {eventBreakdown.map((event: any) => (
                  <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[250px]">{event.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        event.status === 'published' ? 'bg-green-50 text-green-700' :
                        event.status === 'draft' ? 'bg-gray-50 text-gray-500' :
                        'bg-amber-50 text-amber-700'
                      }`}>{event.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {event.start_datetime ? format(new Date(event.start_datetime), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">{event.bookingCount}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">₹{event.revenue.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-500">-₹{event.fees.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm font-black text-green-700">₹{event.earnings.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">No earnings yet</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Revenue data will appear once your events start receiving confirmed bookings.
          </p>
        </div>
      )}

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Recent Transactions</h2>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last {Math.min(bookings.length, 20)} of {bookings.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking ID</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fee</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Share</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Discount</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 20).map((b: any) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3 text-xs font-mono font-bold text-gray-600 truncate max-w-[120px]">{b.id.slice(0, 8)}...</td>
                    <td className="px-6 py-3 text-sm font-bold text-gray-800">₹{Number(b.total_amount).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3 text-sm font-bold text-red-500">-₹{Number(b.platform_fee).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3 text-sm font-black text-green-700">₹{Number(b.host_payout).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3 text-sm font-bold text-orange-500">
                      {Number(b.discount_amount) > 0 ? `-₹${Number(b.discount_amount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-xs font-bold text-gray-500">
                      {b.created_at ? format(new Date(b.created_at), 'dd MMM yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
