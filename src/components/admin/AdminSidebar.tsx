"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  PlusCircle,
  Star,
  Tag,
  Settings,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | undefined
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path
  const isStartsWith = (path: string) => pathname?.startsWith(path)

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col fixed top-20 bottom-0 z-40">
      <div className="p-6 border-b border-zinc-800">
        <div className="mb-4">
          <Image 
            src="/jrlogo.PNG" 
            alt="JustRent Logo" 
            width={160} 
            height={55} 
            className="h-10 w-auto object-contain brightness-0 invert" 
          />
        </div>
        <div className="text-xs font-black text-zinc-400 block tracking-widest uppercase mb-4">
          Admin Panel
        </div>
        <div className="text-xs">
          <span className="text-zinc-500 block">Welcome,</span>
          <span className="text-white font-bold block">{user?.name || 'Admin User'}</span>
          <span className="text-red-600 font-bold text-[10px] uppercase tracking-wider">{user?.role || 'ADMIN'}</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/admin">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
        </Link>
        
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Fleet</p>
        </div>
        
        <Link href="/admin/cars">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/cars') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Car className="mr-3 h-5 w-5" />
            All Cars
          </Button>
        </Link>
        
        <Link href="/admin/categories">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/categories') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Tag className="mr-3 h-5 w-5" />
            Categories
          </Button>
        </Link>

        <Link href="/admin/cars/new">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/cars/new') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <PlusCircle className="mr-3 h-5 w-5" />
            Add New Car
          </Button>
        </Link>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Management</p>
        </div>

        <Link href="/admin/bookings">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/bookings') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Bookings
          </Button>
        </Link>
        
        <Link href="/admin/featured">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/featured') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Star className="mr-3 h-5 w-5" />
            Featured Vehicles
          </Button>
        </Link>

        <Link href="/admin/extras">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/extras') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Settings className="mr-3 h-5 w-5" />
            Extras & Pricing
          </Button>
        </Link>

        <Link href="/admin/users">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-300 hover:text-white hover:bg-zinc-800",
              isActive('/admin/users') && "bg-zinc-800 text-white border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Users className="mr-3 h-5 w-5" />
            Users
          </Button>
        </Link>
      </nav>
    </aside>
  )
}
