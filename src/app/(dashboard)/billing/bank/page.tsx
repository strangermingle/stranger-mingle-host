import { createClient } from '@/lib/supabase/server'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { redirect } from 'next/navigation'
import {
  Banknote,
  CreditCard,
  Landmark,
  QrCode,
  Lock,
  CheckCircle2,
  Clock,
  Shield,
  ArrowUpRight,
} from 'lucide-react'

export default async function BankDetailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await getUserWithHostProfile(user.id)
  const profile = dbUser?.host_profile

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Bank Details</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Settlement information (Read Only)</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <Lock className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Managed by Admin</span>
        </div>
      </div>

      {/* Verification Banner */}
      <div className={`rounded-2xl p-5 flex items-center gap-4 border ${
        profile?.bank_account_verified
          ? 'bg-green-50/50 border-green-100'
          : 'bg-amber-50/50 border-amber-100'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          profile?.bank_account_verified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {profile?.bank_account_verified ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
        </div>
        <div>
          <p className={`text-sm font-black uppercase tracking-tight ${
            profile?.bank_account_verified ? 'text-green-800' : 'text-amber-800'
          }`}>
            {profile?.bank_account_verified ? 'Bank Account Verified' : 'Verification Pending'}
          </p>
          <p className={`text-[11px] font-medium ${
            profile?.bank_account_verified ? 'text-green-600/70' : 'text-amber-600/70'
          }`}>
            {profile?.bank_account_verified
              ? 'Your bank details have been verified and are active for payouts.'
              : 'Your bank details are under review. Payouts will be enabled once verified.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bank Transfer Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Direct Transfer</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NEFT / RTGS / IMPS</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Holder Name</p>
              <p className="text-lg font-bold text-gray-900">{profile?.bank_account_name || 'Not Provided'}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Number</p>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">
                  {profile?.bank_account_number ? `•••• •••• ${profile.bank_account_number.slice(-4)}` : 'Not Provided'}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">IFSC Code</p>
              <p className="text-lg font-bold font-mono text-gray-900 tracking-wider">{profile?.bank_ifsc_code || 'Not Provided'}</p>
            </div>
          </div>
        </div>

        {/* UPI Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Instant UPI</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unified Payments Interface</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">UPI ID (VPA)</p>
              <p className="text-lg font-bold text-gray-700">{profile?.upi_id || 'Not Provided'}</p>
            </div>
          </div>

          {/* Razorpay Connection */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Gateway</p>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${
                profile?.razorpay_account_id
                  ? 'bg-green-50 border-green-100 text-green-700'
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}>
                <Shield className="w-4 h-4" />
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">
                    Razorpay {profile?.razorpay_account_id ? 'Connected' : 'Not Connected'}
                  </p>
                  {profile?.razorpay_account_id && (
                    <p className="text-[10px] font-mono text-green-600/70">ID: {profile.razorpay_account_id.slice(0, 12)}...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4 max-w-2xl">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
          <Banknote className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-gray-800 uppercase tracking-tight">How to update banking details?</p>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
            Banking details are managed by the Stranger Mingle team for security purposes.
            Please contact support to update your bank account or UPI information.
            Changes may take up to 24 hours to reflect.
          </p>
        </div>
      </div>
    </div>
  )
}
