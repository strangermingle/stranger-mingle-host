'use client'

import HostProfileCard from './HostProfileForm'
import { Lock } from 'lucide-react'

interface HostProfileViewProps {
  data: {
    hostPages: any[]
  }
}

export function HostProfileView({ data }: HostProfileViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="px-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">Host Profile</h2>
          <p className="text-xs font-bold text-gray-400 mt-2 ml-6 uppercase tracking-[0.2em]">Your identity, verification, and payout information</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <Lock className="w-3 h-3 text-gray-400" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">View Only</span>
        </div>
      </div>

      {data.hostPages.length > 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-12 shadow-sm">
          <HostProfileCard initialData={data.hostPages[0]} />
        </div>
      ) : (
        <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-6">No profile detected. Please contact the Stranger Mingle team.</p>
        </div>
      )}
    </div>
  )
}
