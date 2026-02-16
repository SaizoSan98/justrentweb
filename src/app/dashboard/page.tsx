
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Car, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  // Redirect Admins to Admin Dashboard
  if (session.user.role === 'ADMIN' || session.user.role === 'SUPERADMIN') {
    redirect('/admin')
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { car: true }
  })

  const upcomingBookings = bookings.filter(b => new Date(b.startDate) > new Date())

  // Calculate stats for Partners
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0)
  const isPartner = session.user.role === 'PARTNER' || session.user.role === 'SUPERADMIN' // Superadmin sees all features usually

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Hello, {session.user.name} 👋</h1>
        <p className="text-zinc-500">Welcome to your personal dashboard.</p>
      </div>

      {isPartner ? (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white text-zinc-900 border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold">{upcomingBookings.length}</span>
                <p className="text-zinc-500 text-sm">Upcoming Bookings</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-zinc-900 border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-50 rounded-lg">
                  <Car className="w-6 h-6 text-zinc-600" />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold">{bookings.length}</span>
                <p className="text-zinc-500 text-sm">Total Trips</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-zinc-900 border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <span className="text-2xl font-bold text-green-600">€</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-4xl font-bold">{totalSpent.toFixed(1)}</span>
                <p className="text-zinc-500 text-sm">Total Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border-0">
          <CardContent className="p-8">
             <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                   <h2 className="text-2xl font-bold mb-2">Ready for your next trip?</h2>
                   <p className="text-zinc-300">Browse our premium fleet and book your perfect car today.</p>
                </div>
                <Button asChild className="bg-white text-black hover:bg-zinc-200">
                   <Link href="/fleet">Browse Fleet</Link>
                </Button>
             </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Recent Activity</h2>
          <Link href="/dashboard/bookings" className="text-red-600 font-medium text-sm hover:underline">
            View All
          </Link>
        </div>

        {bookings.length > 0 ? (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-full md:w-32 h-20 bg-zinc-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                    {booking.car.imageUrl ? (
                        <img src={booking.car.imageUrl} alt={booking.car.model} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                            <Car className="w-8 h-8" />
                        </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-zinc-900">{booking.car.make} {booking.car.model}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-zinc-100 text-zinc-700'
                        }`}>
                            {booking.status}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> 
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-zinc-900">€{Number(booking.totalPrice).toFixed(1)}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/bookings`}>
                    <Button variant="outline" size="sm">Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
             <Car className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
             <h3 className="text-zinc-900 font-bold mb-1">No bookings yet</h3>
             <p className="text-zinc-500 text-sm mb-4">Start your journey by finding the perfect car.</p>
             <Link href="/fleet">
                <Button className="bg-red-600 hover:bg-red-700 text-white">Browse Fleet</Button>
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}
