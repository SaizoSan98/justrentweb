import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { BookingFilters } from "@/components/admin/BookingFilters"
import { BookingActions } from "@/components/admin/BookingActions"

export default async function BookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams ?? {}
  const search = typeof params.search === 'string' ? params.search : undefined
  const status = typeof params.status === 'string' && params.status !== 'ALL' ? params.status : undefined
  const date = typeof params.date === 'string' ? params.date : undefined

  const whereClause: any = {}

  if (status) {
    whereClause.status = status
  }

  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    whereClause.startDate = {
      gte: startOfDay,
      lte: endOfDay
    }
  }

  if (search) {
    whereClause.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { car: { licensePlate: { contains: search, mode: 'insensitive' } } },
      { car: { make: { contains: search, mode: 'insensitive' } } },
      { car: { model: { contains: search, mode: 'insensitive' } } }
    ]
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: { 
      user: true, 
      car: true 
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Bookings</h1>
      </div>

      <BookingFilters />

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-bold text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Car</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                    {booking.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{booking.firstName} {booking.lastName}</div>
                    <div className="text-xs text-zinc-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{booking.car.make} {booking.car.model}</div>
                    <div className="text-xs text-zinc-500">{booking.car.licensePlate}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {format(new Date(booking.startDate), 'MMM d, yyyy')} - <br/>
                    {format(new Date(booking.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    €{Number(booking.totalPrice).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border border-green-200' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <BookingActions bookingId={booking.id} status={booking.status} />
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="p-4 hover:bg-zinc-50/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                   <div className="font-bold text-zinc-900">#{booking.id.slice(0, 8)}</div>
                   <div className="text-xs text-zinc-500 font-mono mt-0.5">{format(new Date(booking.createdAt), 'MMM d, HH:mm')}</div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border border-green-200' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {booking.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                     <div className="w-10 h-10 rounded bg-zinc-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-zinc-500">{booking.car.make.substring(0,2)}</span>
                     </div>
                     <div>
                        <div className="font-bold text-sm text-zinc-900">{booking.car.make} {booking.car.model}</div>
                        <div className="text-xs text-zinc-500">{booking.car.licensePlate}</div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <div>
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-0.5">User</div>
                        <div className="font-medium text-zinc-900">{booking.firstName} {booking.lastName}</div>
                        <div className="text-xs text-zinc-500 truncate">{booking.email}</div>
                     </div>
                     <div>
                        <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Total</div>
                        <div className="font-bold text-zinc-900">€{Number(booking.totalPrice).toLocaleString()}</div>
                     </div>
                  </div>

                  <div>
                     <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Dates</div>
                     <div className="text-sm font-medium text-zinc-900">
                        {format(new Date(booking.startDate), 'MMM d, yyyy')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                     </div>
                  </div>
              </div>

              <div className="pt-3 border-t border-zinc-100">
                 <BookingActions bookingId={booking.id} status={booking.status} />
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
               No bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
