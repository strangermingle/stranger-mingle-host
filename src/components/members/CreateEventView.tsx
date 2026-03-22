'use client'

import { CreateEventForm } from '../host/CreateEventForm'
import { useState } from 'react'

interface CreateEventViewProps {
  data: {
    hostPages: any[]
    categories: any[]
  }
}

export function CreateEventView({ data }: CreateEventViewProps) {
  return (
    <div className="space-y-8">
      <div className="px-2">
      <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest  border-l-4 border-indigo-500 pl-4 text-indigo-600">Create New Event</h2>
      <p className="text-xs font-bold text-gray-400 mt-2 ml-4 uppercase tracking-[0.2em]">Build a captivating stage for your tribe</p>
    </div>

    {data.hostPages.length > 0 ? (
      <div className="bg-white rounded-[3rem] border border-gray-100 p-8 sm:p-12 shadow-sm">
          <CreateEventForm categories={data.categories} pageId={data.hostPages[0].id} />
      </div>
    ) : (
      <div className="py-24 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-6">Host profile required to create events. Please contact the administrator.</p>
      </div>
    )}
    </div>
  )
}
