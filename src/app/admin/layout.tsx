
import Link from "next/link"
import { 
  LayoutDashboard, 
  Car, 
  Settings, 
  Users, 
  Calendar, 
  PlusCircle,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/" className="text-2xl font-black tracking-tight">
            JUST <span className="text-red-600">RENT</span>
            <span className="text-xs font-normal text-zinc-400 block tracking-widest mt-1">ADMIN PANEL</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Fleet</p>
          </div>
          
          <Link href="/admin/cars">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Car className="mr-3 h-5 w-5" />
              All Cars
            </Button>
          </Link>
          
          <Link href="/admin/cars/new">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800">
              <PlusCircle className="mr-3 h-5 w-5" />
              Add New Car
            </Button>
          </Link>

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Management</p>
          </div>

          <Link href="/admin/bookings">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Calendar className="mr-3 h-5 w-5" />
              Bookings
            </Button>
          </Link>
          
          <Link href="/admin/extras">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Settings className="mr-3 h-5 w-5" />
              Extras & Pricing
            </Button>
          </Link>
          
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Users className="mr-3 h-5 w-5" />
              Users
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <Link href="/">
            <Button variant="destructive" className="w-full justify-start bg-red-600 hover:bg-red-700">
              <LogOut className="mr-3 h-5 w-5" />
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
