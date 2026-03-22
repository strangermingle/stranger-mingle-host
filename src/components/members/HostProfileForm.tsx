'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateHostPageAction } from '@/actions/host.actions'
import { uploadImageAction, deleteImageAction } from '@/actions/event.actions'
import { Button, Input, Textarea } from '@/components/ui'
import { toast } from 'sonner'
import { sendGAEvent } from '@/lib/gtag'
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
  CheckCircle2,
  Info,
  Building,
  Briefcase,
  Image as ImageIcon,
  Layout,
  Camera,
  Loader2,
  Upload
} from 'lucide-react'

export default function HostProfileForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  
  const [profileImage, setProfileImage] = useState(initialData?.profile_image || '')
  const [bannerUrl, setBannerUrl] = useState(initialData?.banner_url || '')
  const [logoUrl, setLogoUrl] = useState(initialData?.logo_url || '')

  const router = useRouter()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, type: 'profile' | 'logo' | 'landscape') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    setUploading(field)
    
    const uploadData = new FormData()
    uploadData.append('file', file)
    
    // We'll use 'profile' for banner so it goes to profile_images folder
    const finalType = field === 'banner_url' ? 'profile' : type
    const res = await uploadImageAction(initialData.id, uploadData, finalType)
    
    setUploading(null)
    if (res.success && res.url) {
      // DELETE PREVIOUS IMAGE FROM CLOUDINARY IF IT EXISTS (ONLY FOR BANNER AS PER REQUEST)
      if (field === 'banner_url' && bannerUrl) {
        try {
           await deleteImageAction(bannerUrl, initialData.id)
        } catch (err) {
           console.error('Failed to delete previous banner from Cloudinary:', err)
        }
      }

      if (field === 'profile_image') setProfileImage(res.url)
      else if (field === 'banner_url') setBannerUrl(res.url)
      else if (field === 'logo_url') setLogoUrl(res.url)
      toast.success(`${field.replace('_', ' ')} uploaded successfully`)
    } else {
      toast.error(res.error || 'Upload failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateHostPageAction(initialData.id, formData)
    
    setLoading(false)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      sendGAEvent({
        action: 'form_submit',
        category: 'engagement',
        label: 'host_profile_update',
        host_id: initialData.id
      })
      toast.success('Profile updated successfully')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identity Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Identity & Branding</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
           {/* Read-only fields rendered as styled elements or read-only inputs */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Host Type</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm uppercase">
                {initialData?.host_type}
            </div>
          </div>
          <div className="md:col-span-2 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Organisation Name</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm uppercase">
                {initialData?.organisation_name || 'Individual'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Display Name</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm font-bold">
                {initialData?.display_name}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tagline</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm font-bold">
                {initialData?.tagline || '-'}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Bio / Story</p>
          <div className="min-h-[60px] p-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-700 text-sm font-bold leading-relaxed">
            {initialData?.description || 'No Bio Provided'}
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <ImageIcon className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Media Assets</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image - DISABLED AS PER REQUEST */}
          <div className="space-y-2 opacity-50 grayscale">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Profile Image</label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex-shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <User className="w-8 h-8" />
                  </div>
                )}
                {/* UPLOAD BLOCKED */}
              </div>
              <div className="flex-1 space-y-1">
                 <p className="text-zinc-600 font-bold text-xs px-1 uppercase tracking-tight">Locked</p>
                 <Input 
                  name="profile_image" 
                  value={profileImage} 
                  readOnly
                  className="h-9 rounded-xl bg-gray-100/50 text-[10px] font-bold border-gray-100/50 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          {/* Logo - DISABLED AS PER REQUEST */}
          <div className="space-y-2 opacity-50 grayscale">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Organisation Logo</label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex-shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <Building className="w-8 h-8" />
                  </div>
                )}
                {/* UPLOAD BLOCKED */}
              </div>
              <div className="flex-1 space-y-1">
                 <p className="text-zinc-600 font-bold text-xs px-1 uppercase tracking-tight">Locked</p>
                 <Input 
                  name="logo_url" 
                  value={logoUrl} 
                  readOnly
                  className="h-9 rounded-xl bg-gray-100/50 text-[10px] font-bold border-gray-100/50 cursor-not-allowed" 
                />
              </div>
            </div>
          </div>

          {/* Banner */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Profile Banner (Landscape)</label>
            <div className="relative h-48 w-full rounded-2xl overflow-hidden border-2 border-indigo-50 bg-indigo-50/20 group">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-indigo-200">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <label className="absolute inset-0 bg-indigo-900/0 hover:bg-indigo-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer text-white">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  {uploading === 'banner_url' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                {!uploading && <span className="text-[8px] font-black uppercase mt-2 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Swap Banner</span>}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner_url', 'profile')} />
              </label>
            </div>
            <Input 
              name="banner_url" 
              value={bannerUrl} 
              readOnly
              className="h-10 rounded-xl border-indigo-50 bg-gray-50/50 font-bold text-xs cursor-not-allowed" 
              placeholder="Banner URL (Managed via upload above)"
            />
          </div>
        </div>
      </section>

      {/* Localization */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <MapPin className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Location</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">City</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm font-bold">{initialData?.city}</div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">State</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm font-bold">{initialData?.state}</div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Country</p>
            <div className="h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center text-gray-900 text-sm font-bold">{initialData?.country}</div>
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
            <Globe className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Social Presence</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Instagram</p>
            <div className="h-10 px-3 rounded-xl border border-gray-50 bg-gray-50/30 flex items-center gap-2 text-zinc-600 text-xs font-bold">
              <Instagram className="w-3.5 h-3.5" />
              {initialData?.instagram_handle || '-'}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Facebook</p>
            <div className="h-10 px-3 rounded-xl border border-gray-50 bg-gray-50/30 flex items-center gap-2 text-zinc-600 text-xs font-bold truncate">
              {initialData?.facebook_url || '-'}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Twitter/X</p>
            <div className="h-10 px-3 rounded-xl border border-gray-50 bg-gray-50/30 flex items-center gap-2 text-zinc-600 text-xs font-bold">
               {initialData?.twitter_handle || '-'}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">YouTube</p>
            <div className="h-10 px-3 rounded-xl border border-gray-50 bg-gray-50/30 flex items-center gap-2 text-zinc-600 text-xs font-bold truncate">
              {initialData?.youtube_url || '-'}
            </div>
          </div>
        </div>
      </section>

      {/* Payout & Banking */}
      <section className="space-y-4 opacity-75">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <Banknote className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Payout & Settlement (LOCKED)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Transfer</h3>
            <div className="space-y-3">
               <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 text-zinc-500 font-bold text-xs space-y-2">
                 <p><span className="text-[10px] uppercase text-zinc-400 block mb-0.5">Holder Name</span> {initialData?.bank_account_name || 'NOT DATA'}</p>
                 <p><span className="text-[10px] uppercase text-zinc-400 block mb-0.5">Account Number</span> ****{initialData?.bank_account_number?.slice(-4) || '****'}</p>
                 <p><span className="text-[10px] uppercase text-zinc-400 block mb-0.5">IFSC</span> {initialData?.bank_ifsc_code || 'NOT DATA'}</p>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">UPI Settings</h3>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 text-zinc-500 font-bold text-xs">
                 <p><span className="text-[10px] uppercase text-zinc-400 block mb-0.5">UPI ID</span> {initialData?.upi_id || 'NOT DATA'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Status & Stats (Read-Only) */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Layout className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Platform Status & Stats</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Approval</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${initialData?.is_approved ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-xs font-black text-gray-900 uppercase">{initialData?.is_approved ? 'Approved' : 'Pending'}</p>
            </div>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">KYC Status</p>
            <p className="text-xs font-black text-gray-900 uppercase">{initialData?.kyc_status || 'NOT SUBMITTED'}</p>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Rating</p>
            <p className="text-xs font-black text-gray-900 uppercase">{initialData?.rating_avg || '0.0'} ({initialData?.rating_count || 0})</p>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Followers</p>
            <p className="text-xs font-black text-gray-900 uppercase">{initialData?.follower_count || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Events</p>
            <p className="text-sm font-black text-gray-900 tracking-tight">{initialData?.total_events_hosted || 0}</p>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Tickets Sold</p>
            <p className="text-sm font-black text-gray-900 tracking-tight">{initialData?.total_tickets_sold || 0}</p>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Revenue</p>
            <p className="text-sm font-black text-indigo-600 tracking-tight">₹{parseFloat(initialData?.total_revenue || '0').toLocaleString('en-IN')}</p>
          </div>
        </div>
      </section>

      <div className="pt-6 border-t border-gray-100 flex items-center justify-end">
        <Button 
          type="submit" 
          disabled={loading}
          className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 text-xs"
        >
          {loading ? 'SAVING...' : 'UPDATE PROFILE'}
        </Button>
      </div>
    </form>
  )
}
