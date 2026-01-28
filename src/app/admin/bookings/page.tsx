import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
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

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-bold text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Car</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {bookings.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                    {booking.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{booking.user.name || 'Unknown'}</div>
                    <div className="text-xs text-zinc-500">{booking.user.email}</div>
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
      </div>
    </div>
  )
}
