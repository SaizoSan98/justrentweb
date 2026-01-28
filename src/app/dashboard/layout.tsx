
import Link from "next/link"
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  LogOut,
  Car
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/admin/actions" // Reuse logout
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const user = session?.user

  // Ensure only logged in users (and specifically USER role, though ADMINs can also view technically)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-zinc-100">
          <Link href="/" className="text-2xl font-black tracking-tight block">
            JUST <span className="text-red-600">RENT</span>
            <span className="text-xs font-normal text-zinc-400 block tracking-widest mt-1">CLIENT PORTAL</span>
          </Link>
          <div className="mt-4 pt-4 border-t border-zinc-100 text-xs">
            <span className="text-zinc-500 block">Welcome back,</span>
            <span className="text-zinc-900 font-bold block truncate">{user.name}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-red-600 hover:bg-red-50">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Overview
            </Button>
          </Link>
          
          <Link href="/dashboard/bookings">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-red-600 hover:bg-red-50">
              <Calendar className="mr-3 h-5 w-5" />
              My Bookings
            </Button>
          </Link>
          
          <Link href="/dashboard/profile">
            <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-red-600 hover:bg-red-50">
              <User className="mr-3 h-5 w-5" />
              My Profile
            </Button>
          </Link>

          <div className="pt-4 pb-2 border-t border-zinc-100 mt-4">
             <Link href="/fleet">
                <Button variant="outline" className="w-full justify-start border-zinc-200 text-zinc-700 hover:border-red-600 hover:text-red-600">
                  <Car className="mr-3 h-5 w-5" />
                  Browse Cars
                </Button>
              </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <form action={logoutAction}>
            <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-zinc-200">
           <Link href="/" className="text-xl font-black tracking-tight">
            JUST <span className="text-red-600">RENT</span>
          </Link>
           <form action={logoutAction}>
            <Button variant="ghost" size="sm">
              <LogOut className="w-5 h-5" />
            </Button>
          </form>
        </div>

        {children}
      </main>
    </div>
  )
}
