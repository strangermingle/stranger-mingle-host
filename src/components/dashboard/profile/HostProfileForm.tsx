'use client'

import { sendGAEvent } from '@/lib/gtag'
import { useEffect } from 'react'
import {
  User,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Banknote,
  CreditCard,
  Building,
  Layout,
  Shield,
  Star,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
} from 'lucide-react'

interface HostProfileCardProps {
  initialData: any
}

function StatBlock({ label, value, icon: Icon, color = 'gray' }: { label: string; value: string | number; icon?: any; color?: string }) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-50 border-gray-100',
    indigo: 'bg-indigo-50/50 border-indigo-100/50',
    green: 'bg-green-50/50 border-green-100/50',
    amber: 'bg-amber-50/50 border-amber-100/50',
  }
  return (
    <div className={`${colorMap[color] || colorMap.gray} p-5 rounded-2xl border`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{label}</p>
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-300" />}
      </div>
      <p className="text-lg font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  )
}

function ReadOnlyField({ label, value, icon: Icon, masked = false }: { label: string; value: string | null | undefined; icon?: any; masked?: boolean }) {
  const display = masked && value ? `•••• •••• ${value.slice(-4)}` : (value || '—')
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{label}</p>
      <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center gap-3 text-gray-800 text-sm font-semibold">
        {Icon && <Icon className="w-4 h-4 text-gray-300 shrink-0" />}
        <span className="truncate">{display}</span>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, color, locked = false }: { icon: any; title: string; color: string; locked?: boolean }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    pink: 'bg-pink-50 text-pink-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">{title}</h2>
      </div>
      {locked && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full">
          <Lock className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Read Only</span>
        </div>
      )}
    </div>
  )
}

export default function HostProfileCard({ initialData }: HostProfileCardProps) {
  useEffect(() => {
    sendGAEvent({
      action: 'page_view',
      category: 'profile',
      label: 'host_profile_view',
      host_id: initialData?.id,
    })
  }, [initialData?.id])

  const d = initialData

  return (
    <div className="space-y-10">
      {/* Identity & Branding */}
      <section className="space-y-5">
        <SectionHeader icon={User} title="Identity & Branding" color="indigo" locked />

        {/* Avatar + Name Banner */}
        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-2xl border border-gray-100">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0 bg-gray-100">
            {d?.profile_image ? (
              <img src={d.profile_image} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-300">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight truncate">{d?.display_name}</h3>
            <p className="text-xs font-bold text-gray-400 mt-0.5">{d?.tagline || 'No tagline set'}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-0.5 bg-indigo-100/70 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                {d?.host_type || 'Individual'}
              </span>
              {d?.organisation_name && (
                <span className="px-3 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                  {d.organisation_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Banner Preview */}
        {d?.banner_url && (
          <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-gray-100">
            <img src={d.banner_url} alt="Banner" className="h-full w-full object-cover" />
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full">
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Profile Banner</span>
            </div>
          </div>
        )}

        {/* Logo Preview */}
        {d?.logo_url && (
          <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="h-14 w-14 rounded-xl overflow-hidden border border-gray-200 bg-white p-1.5 shrink-0">
              <img src={d.logo_url} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Organisation Logo</p>
              <p className="text-xs font-bold text-gray-600 truncate max-w-xs">{d.logo_url}</p>
            </div>
          </div>
        )}

        {/* Bio */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bio / Story</p>
          <div className="min-h-[60px] p-5 rounded-2xl border border-gray-100 bg-gray-50/30 text-gray-700 text-sm font-medium leading-relaxed">
            {d?.description || 'No bio provided'}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-5">
        <SectionHeader icon={MapPin} title="Location" color="blue" locked />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReadOnlyField label="City" value={d?.city} icon={MapPin} />
          <ReadOnlyField label="State" value={d?.state} />
          <ReadOnlyField label="Country" value={d?.country} icon={Globe} />
        </div>
      </section>

      {/* Social Presence */}
      <section className="space-y-5">
        <SectionHeader icon={Globe} title="Social Presence" color="pink" locked />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReadOnlyField label="Instagram" value={d?.instagram_handle} icon={Instagram} />
          <ReadOnlyField label="Facebook" value={d?.facebook_url} icon={Facebook} />
          <ReadOnlyField label="Twitter/X" value={d?.twitter_handle} icon={Twitter} />
          <ReadOnlyField label="YouTube" value={d?.youtube_url} icon={Youtube} />
        </div>
      </section>

      {/* Payout & Banking */}
      <section className="space-y-5">
        <SectionHeader icon={Banknote} title="Payout & Settlement" color="green" locked />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/20 space-y-4">
            <h3 className="text-[10px] font-black text-green-600 uppercase tracking-widest">Bank Transfer</h3>
            <ReadOnlyField label="Holder Name" value={d?.bank_account_name} icon={User} />
            <ReadOnlyField label="Account Number" value={d?.bank_account_number} icon={CreditCard} masked />
            <ReadOnlyField label="IFSC Code" value={d?.bank_ifsc_code} icon={Building} />
            <div className="flex items-center gap-2 pt-1">
              {d?.bank_account_verified ? (
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Pending Verification</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/20 space-y-4">
            <h3 className="text-[10px] font-black text-green-600 uppercase tracking-widest">UPI Settings</h3>
            <ReadOnlyField label="UPI ID (VPA)" value={d?.upi_id} />
            <div className="space-y-1.5 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Razorpay Status</p>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${d?.razorpay_account_id ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  {d?.razorpay_account_id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {d?.razorpay_account_id ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KYC Status */}
      <section className="space-y-5">
        <SectionHeader icon={Shield} title="Verification & KYC" color="orange" locked />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Approval</p>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${d?.is_approved ? 'bg-green-500' : 'bg-amber-500'}`} />
              <p className="text-sm font-black text-gray-900 uppercase">{d?.is_approved ? 'Approved' : 'Pending'}</p>
            </div>
            {d?.approved_at && (
              <p className="text-[9px] text-gray-400 font-medium mt-1">
                {new Date(d.approved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">KYC Status</p>
            <p className="text-sm font-black text-gray-900 uppercase">{d?.kyc_status || 'Not Submitted'}</p>
          </div>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Rating</p>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <p className="text-sm font-black text-gray-900">{d?.rating_avg?.toFixed(1) || '0.0'}</p>
              <p className="text-[9px] text-gray-400 font-bold">({d?.rating_count || 0})</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Followers</p>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <p className="text-sm font-black text-gray-900">{d?.follower_count || 0}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="space-y-5">
        <SectionHeader icon={Layout} title="Performance Stats" color="purple" locked />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBlock label="Total Events Hosted" value={d?.total_events_hosted || 0} icon={Calendar} color="indigo" />
          <StatBlock label="Total Tickets Sold" value={d?.total_tickets_sold || 0} icon={Users} color="green" />
          <StatBlock label="Lifetime Revenue" value={`₹${parseFloat(d?.total_revenue || '0').toLocaleString('en-IN')}`} icon={TrendingUp} color="amber" />
        </div>
      </section>

      {/* Footer note */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs font-black text-gray-800 uppercase tracking-tight mb-1">Profile is managed by Stranger Mingle</p>
          <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
            Your profile, bank details, and verification status are managed by the Stranger Mingle team.
            If you need to make changes, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
