
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Calendar, DollarSign, Users } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [carsCount, bookingsCount, usersCount] = await Promise.all([
    prisma.car.count(),
    prisma.booking.count(),
    prisma.user.count(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Dashboard Overview</h1>
        <div className="text-sm text-zinc-500 font-medium">
          Welcome back, Admin
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/cars" className="block group">
          <Card className="h-full border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white overflow-hidden group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-zinc-600">Total Cars</CardTitle>
              <Car className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-zinc-900 mb-1">{carsCount}</div>
              <p className="text-xs text-zinc-500 font-medium">Active in fleet</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/bookings" className="block group">
          <Card className="h-full border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white overflow-hidden group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-zinc-600">Active Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-zinc-900 mb-1">{bookingsCount}</div>
              <p className="text-xs text-zinc-500 font-medium">Currently booked</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full border-zinc-100 rounded-2xl bg-white/50 grayscale opacity-70 cursor-not-allowed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-zinc-600">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-zinc-900 mb-1">$0</div>
            <p className="text-xs text-zinc-500 font-medium">This month</p>
          </CardContent>
        </Card>

        <Link href="/admin/users" className="block group">
          <Card className="h-full border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white overflow-hidden group-hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-zinc-600">Users</CardTitle>
              <Users className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-zinc-900 mb-1">{usersCount}</div>
              <p className="text-xs text-zinc-500 font-medium">Registered accounts</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
