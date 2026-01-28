"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { updateBookingStatus } from "@/app/admin/bookings/actions"
import { toast } from "sonner"
import { BookingStatus } from "@prisma/client"

export function BookingActions({ 
  bookingId, 
  status 
}: { 
  bookingId: string
  status: BookingStatus 
}) {
  const [isPending, startTransition] = useTransition()

  const handleStatusUpdate = (newStatus: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Booking ${newStatus.toLowerCase()} successfully`)
      }
    })
  }

  if (status !== 'PENDING') return null

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
        onClick={() => handleStatusUpdate('CONFIRMED')}
        disabled={isPending}
        title="Confirm Booking"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        onClick={() => handleStatusUpdate('CANCELLED')}
        disabled={isPending}
        title="Reject Booking"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
      </Button>
    </div>
  )
}
