'use client'

import { useState } from 'react'
import { BookingSuccessModal } from '@/components/modals/BookingSuccessModal'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface ClientSideModalHandlerProps {
  booking: any
}

export default function ClientSideModalHandler({ booking }: ClientSideModalHandlerProps) {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleClose = () => {
    setIsOpen(false)
    // Remove query params from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('booking')
    params.delete('ref')
    const newPath = `${pathname}${params.toString() ? '?' + params.toString() : ''}`
    router.replace(newPath)
  }

  if (!isOpen) return null

  return <BookingSuccessModal booking={booking} onClose={handleClose} />
}
