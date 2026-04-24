import { createClient } from '@/lib/supabase/server'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { redirect } from 'next/navigation'
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Banknote,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'

export default async function MyPayoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await getUserWithHostProfile(user.id)
  const hostProfile = dbUser?.host_profile

  // Fetch payouts for this host
  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, events(title, slug)')
    .eq('host_id', hostProfile?.user_id || user.id)
    .order('created_at', { ascending: false })

  const allPayouts = (payouts || []) as any[]

  const totalPaid = allPayouts
    .filter((p: any) => p.status === 'paid')
    .reduce((sum: number, p: any) => sum + Number(p.net_amount || 0), 0)

  const totalPending = allPayouts
    .filter((p: any) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum: number, p: any) => sum + Number(p.net_amount || 0), 0)

  const statusColors: Record<string, string> = {
    paid: 'bg-green-50 text-green-700 border-green-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    processing: 'bg-blue-50 text-blue-700 border-blue-100',
    failed: 'bg-red-50 text-red-700 border-red-100',
    cancelled: 'bg-gray-50 text-gray-500 border-gray-100',
  }

  const statusIcons: Record<string, any> = {
    paid: CheckCircle2,
    pending: Clock,
    processing: ArrowUpRight,
    failed: XCircle,
    cancelled: XCircle,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">My Payouts</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Track all settlement transfers (Read Only)</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Paid</p>
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending / Processing</p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹{totalPending.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Payouts</p>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900">{allPayouts.length}</p>
        </div>
      </div>

      {/* Payouts Table */}
      {allPayouts.length > 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Fee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">GST on Fee</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Net Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">UTR</th>
                </tr>
              </thead>
              <tbody>
                {allPayouts.map((payout: any) => {
                  const StatusIcon = statusIcons[payout.status] || AlertCircle
                  return (
                    <tr key={payout.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                          {payout.events?.title || 'Unknown Event'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-500 uppercase">{payout.payout_type || 'settlement'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">
                        ₹{Number(payout.gross_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-500">
                        -₹{Number(payout.platform_fee || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-400">
                        -₹{Number(payout.gst_on_fee || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-green-700">
                        ₹{Number(payout.net_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColors[payout.status] || statusColors.cancelled}`}>
                          <StatusIcon className="w-3 h-3" />
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {payout.paid_at
                          ? format(new Date(payout.paid_at), 'dd MMM yyyy')
                          : payout.created_at
                            ? format(new Date(payout.created_at), 'dd MMM yyyy')
                            : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-gray-500">
                        {payout.utr_number || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Banknote className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">No payouts yet</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Payouts will appear here once your events generate settlements.
          </p>
        </div>
      )}
    </div>
  )
}
