
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Calendar, DollarSign, Users, TrendingUp, ArrowUpRight, Activity } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [carsCount, bookingsCount, usersCount] = await Promise.all([
    prisma.car.count(),
    prisma.booking.count(),
    prisma.user.count(),
  ])

  // Mock revenue for now as we don't have payments yet
  const revenue = 0;

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">Overview</h1>
          <p className="text-zinc-500">Welcome back to the command center.</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-full border border-zinc-200 text-zinc-500 text-sm flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          System Operational
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/cars" className="block group">
          <Card className="h-full border-zinc-100 bg-white shadow-sm hover:shadow-md hover:border-red-100 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-red-100"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500 group-hover:text-red-600 transition-colors">Total Fleet</CardTitle>
              <Car className="h-5 w-5 text-zinc-400 group-hover:text-red-600 transition-colors" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-zinc-900 mb-1 group-hover:scale-105 transition-transform origin-left">{carsCount}</div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-green-600 flex items-center font-bold">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2
                </span>
                <span>new this month</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/bookings" className="block group">
          <Card className="h-full border-zinc-100 bg-white shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500 group-hover:text-blue-600 transition-colors">Active Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-zinc-900 mb-1 group-hover:scale-105 transition-transform origin-left">{bookingsCount}</div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-blue-600 flex items-center font-bold">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </span>
                <span>reservations</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <div className="block group">
          <Card className="h-full border-zinc-100 bg-white shadow-sm rounded-2xl overflow-hidden relative opacity-75">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-zinc-400" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-zinc-300 mb-1">$0</div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Coming soon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Link href="/admin/users" className="block group">
          <Card className="h-full border-zinc-100 bg-white shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-100"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-bold text-zinc-500 group-hover:text-purple-600 transition-colors">Users</CardTitle>
              <Users className="h-5 w-5 text-zinc-400 group-hover:text-purple-600 transition-colors" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-zinc-900 mb-1 group-hover:scale-105 transition-transform origin-left">{usersCount}</div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="text-purple-600 flex items-center font-bold">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  Growing
                </span>
                <span>registered users</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
         <Card className="border-zinc-100 bg-white shadow-sm rounded-3xl overflow-hidden">
            <CardHeader>
                <CardTitle className="text-zinc-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/50">
                    No recent activity
                </div>
            </CardContent>
         </Card>
         
         <Card className="border-zinc-100 bg-white shadow-sm rounded-3xl overflow-hidden">
            <CardHeader>
                <CardTitle className="text-zinc-900">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                    <span className="text-zinc-500">Database</span>
                    <span className="text-green-600 text-sm font-bold flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>Connected</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                    <span className="text-zinc-500">API Latency</span>
                    <span className="text-green-600 text-sm font-bold">24ms</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Storage</span>
                    <span className="text-zinc-900 text-sm font-bold">45% Used</span>
                </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
