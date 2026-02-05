"use client"

import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  PlusCircle,
  Star,
  Tag,
  Settings,
  Users,
  Shield,
  ArrowLeft,
  Database
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminSidebarContentProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | undefined
  className?: string
  onLinkClick?: () => void
}

export function AdminSidebarContent({ user, className, onLinkClick }: AdminSidebarContentProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <div className={cn("flex flex-col h-full bg-white text-zinc-900", className)}>
      <div className="p-6 border-b border-zinc-100">
        <Link href="/" className="mb-4 block" onClick={onLinkClick}>
          <Button variant="outline" size="sm" className="w-full mb-4 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <div className="mb-4">
          <Logo variant="dark" className="scale-100 origin-left" />
        </div>
        <div className="text-xs font-black text-zinc-400 block tracking-widest uppercase mb-4">
          Admin Panel
        </div>
        <div className="text-xs">
          <span className="text-zinc-500 block">Welcome,</span>
          <span className="text-zinc-900 font-bold block">{user?.name || 'Admin User'}</span>
          <span className="text-red-600 font-bold text-[10px] uppercase tracking-wider">{user?.role || 'ADMIN'}</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/admin" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
        </Link>
        
        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Integrations</p>
        </div>

        <Link href="/admin/renteon" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/renteon') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Database className="mr-3 h-5 w-5" />
            Renteon API
          </Button>
        </Link>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Fleet</p>
        </div>
        
        <Link href="/admin/cars" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/cars') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Car className="mr-3 h-5 w-5" />
            All Cars
          </Button>
        </Link>
        
        <Link href="/admin/categories" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/categories') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Tag className="mr-3 h-5 w-5" />
            Categories
          </Button>
        </Link>

        <Link href="/admin/insurances" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/insurances') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Shield className="mr-3 h-5 w-5" />
            Insurances
          </Button>
        </Link>

        <Link href="/admin/cars/new" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/cars/new') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <PlusCircle className="mr-3 h-5 w-5" />
            Add New Car
          </Button>
        </Link>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Management</p>
        </div>

        <Link href="/admin/bookings" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/bookings') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Bookings
          </Button>
        </Link>
        
        <Link href="/admin/featured" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/featured') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Star className="mr-3 h-5 w-5" />
            Featured Vehicles
          </Button>
        </Link>

        <Link href="/admin/extras" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/extras') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Settings className="mr-3 h-5 w-5" />
            Extras & Pricing
          </Button>
        </Link>

        <Link href="/admin/users" onClick={onLinkClick}>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
              isActive('/admin/users') && "bg-red-50 text-red-600 border-l-2 border-red-600 rounded-l-none"
            )}
          >
            <Users className="mr-3 h-5 w-5" />
            Users
          </Button>
        </Link>
      </nav>
    </div>
  )
}
