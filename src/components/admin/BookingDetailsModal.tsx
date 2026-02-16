
"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Calendar, User, MapPin, CreditCard, Trash2, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { BookingStatus } from "@prisma/client"
import { useState, useTransition } from "react"
import { updateBookingStatus, deleteBooking } from "@/app/admin/bookings/actions"
import { toast } from "sonner"

interface BookingDetailsModalProps {
  booking: any // Using any for simplicity with included relations
}

export function BookingDetailsModal({ booking }: BookingDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleStatusUpdate = (newStatus: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus(booking.id, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Booking ${newStatus.toLowerCase()} successfully`)
        setIsOpen(false)
      }
    })
  }

  const handleDelete = () => {
    if (!confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) return

    startTransition(async () => {
      const result = await deleteBooking(booking.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Booking deleted successfully")
        setIsOpen(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Booking Details #{booking.id.slice(0, 8)}</span>
            <span className={`text-sm px-3 py-1 rounded-full ${
                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {booking.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 py-4">
            {/* Left Column: Car & Trip */}
            <div className="space-y-6">
                {/* Car Card */}
                <div className="bg-zinc-50 rounded-xl overflow-hidden border border-zinc-100">
                    <div className="aspect-video relative">
                        {booking.car.imageUrl ? (
                            <img src={booking.car.imageUrl} alt={booking.car.model} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-zinc-400">
                                No Image
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <h3 className="text-white font-bold text-lg">{booking.car.make} {booking.car.model}</h3>
                            <p className="text-zinc-300 text-sm">{booking.car.licensePlate}</p>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-2 text-sm text-zinc-600">
                        <div>Year: <span className="text-zinc-900 font-medium">{booking.car.year}</span></div>
                        <div>Fuel: <span className="text-zinc-900 font-medium">{booking.car.fuelType}</span></div>
                        <div>Gear: <span className="text-zinc-900 font-medium">{booking.car.transmission}</span></div>
                        <div>Seats: <span className="text-zinc-900 font-medium">{booking.car.seats}</span></div>
                    </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-4">
                    <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Trip Schedule
                    </h4>
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
                        <div className="text-center">
                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Pick-up</div>
                            <div className="font-bold text-zinc-900">{format(new Date(booking.startDate), 'MMM d, yyyy')}</div>
                            <div className="text-sm text-zinc-500">{format(new Date(booking.startDate), 'HH:mm')}</div>
                            <div className="text-xs text-zinc-400 mt-1">{booking.pickupLocation}</div>
                        </div>
                        <div className="h-px w-12 bg-zinc-300 relative">
                            <div className="absolute -top-1.5 right-0 w-3 h-3 border-t-2 border-r-2 border-zinc-300 rotate-45"></div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-zinc-500 uppercase font-bold mb-1">Drop-off</div>
                            <div className="font-bold text-zinc-900">{format(new Date(booking.endDate), 'MMM d, yyyy')}</div>
                            <div className="text-sm text-zinc-500">{format(new Date(booking.endDate), 'HH:mm')}</div>
                            <div className="text-xs text-zinc-400 mt-1">{booking.dropoffLocation}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: User & Financials */}
            <div className="space-y-6">
                {/* User Info */}
                <div className="space-y-3">
                    <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Details
                    </h4>
                    <div className="bg-white p-4 rounded-lg border border-zinc-200 text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Name:</span>
                            <span className="font-medium text-zinc-900">{booking.firstName} {booking.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Email:</span>
                            <span className="font-medium text-zinc-900">{booking.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Phone:</span>
                            <span className="font-medium text-zinc-900">{booking.phone}</span>
                        </div>
                        {booking.flightNumber && (
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Flight No:</span>
                                <span className="font-medium text-zinc-900">{booking.flightNumber}</span>
                            </div>
                        )}
                        {booking.isCompany && (
                            <div className="pt-2 mt-2 border-t border-zinc-100">
                                <div className="text-xs font-bold text-zinc-400 uppercase mb-1">Company Info</div>
                                <div>{booking.companyName}</div>
                                <div className="text-zinc-500">{booking.companyTaxId}</div>
                                <div className="text-zinc-500">{booking.companyAddress}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3">
                    <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Payment Summary
                    </h4>
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between text-zinc-600">
                                <span>Payment Method</span>
                                <span className="font-medium text-zinc-900">{booking.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                                <span>Insurance</span>
                                <span className="font-medium text-zinc-900">{booking.fullInsurance ? 'Full Coverage' : 'Basic'}</span>
                            </div>
                            {booking.extras && booking.extras.length > 0 && (
                                <div className="flex justify-between text-zinc-600">
                                    <span>Extras ({booking.extras.length})</span>
                                    <span className="font-medium text-zinc-900">Included</span>
                                </div>
                            )}
                        </div>
                        <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
                            <span className="font-bold text-zinc-900">Total Amount</span>
                            <span className="text-xl font-black text-zinc-900">€{Number(booking.totalPrice).toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-wrap gap-3">
                    {booking.status === 'PENDING' && (
                        <>
                            <Button 
                                onClick={() => handleStatusUpdate('CONFIRMED')} 
                                disabled={isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Confirm Booking
                            </Button>
                            <Button 
                                onClick={() => handleStatusUpdate('CANCELLED')} 
                                disabled={isPending}
                                variant="destructive"
                                className="flex-1"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </Button>
                        </>
                    )}
                    
                    {booking.status === 'CONFIRMED' && (
                        <Button 
                            onClick={() => handleStatusUpdate('COMPLETED')} 
                            disabled={isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed (Returned)
                        </Button>
                    )}

                    {(booking.status === 'CANCELLED' || booking.status === 'COMPLETED') && (
                        <Button 
                            onClick={handleDelete} 
                            disabled={isPending}
                            variant="outline"
                            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
