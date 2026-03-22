import { createClient } from '@/lib/supabase/server'
import { getUserWithHostProfile } from '@/lib/repositories/users.repository'
import { Banknote, CreditCard, Landmark, QrCode } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function BankDetailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const dbUser = await getUserWithHostProfile(user.id)
  const profile = dbUser?.host_profile

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 uppercase  tracking-tight">Bank Details</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Settlement information (Read Only)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
           <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Landmark className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900  uppercase tracking-tight">Direct Transfer</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Holder Name</p>
              <p className="text-lg font-bold text-gray-900">{profile?.bank_account_name || 'Not Provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Number</p>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <p className="text-lg font-mono font-bold text-gray-900">
                  {profile?.bank_account_number ? `**** **** ${profile.bank_account_number.slice(-4)}` : 'Not Provided'}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">IFSC Code</p>
              <p className="text-lg font-bold text-gray-900">{profile?.bank_ifsc_code || 'Not Provided'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900  uppercase tracking-tight">Instant UPI</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">UPI ID (VPA)</p>
              <p className="text-lg font-bold text-gray-600">{profile?.upi_id || 'Not Provided'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100/50 max-w-2xl">
         <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
               <Banknote className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="space-y-2">
               <p className="text-sm font-black text-indigo-900 uppercase tracking-tight ">How to update these?</p>
               <p className="text-xs font-bold text-indigo-600/60 leading-relaxed uppercase tracking-widest">
                 Banking details can be managed from your <a href="/profile" className="text-indigo-600 hover:underline">Host Profile</a>. 
                 Changes may take up to 24 hours to reflect for payouts.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
