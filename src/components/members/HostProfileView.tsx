'use client'

import HostProfileForm from './HostProfileForm'
import { useState } from 'react'

interface HostProfileViewProps {
  data: {
    hostPages: any[]
  }
}

export function HostProfileView({ data }: HostProfileViewProps) {
  return (
    <div className="space-y-8">
        <div className="px-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest  border-l-4 border-amber-500 pl-4 text-amber-600">Host Profile Configuration</h2>
        <p className="text-xs font-bold text-gray-400 mt-2 ml-4 uppercase tracking-[0.2em]">Manage your brand identity and payout details</p>
      </div>

      {data.hostPages.length > 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 sm:p-12 shadow-sm">
            <HostProfileForm initialData={data.hostPages[0]} />
        </div>
      ) : (
        <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-6">No profile detected. Please contact the administrator.</p>
        </div>
      )}
    </div>
  )
}
