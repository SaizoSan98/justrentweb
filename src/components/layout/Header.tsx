"use client"

import Link from "next/link"
import { Globe, User, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/AuthModal"
import { logoutAction } from "@/app/admin/actions"

interface HeaderProps {
  transparent?: boolean
  user?: any
}

export function Header({ transparent = false, user }: HeaderProps) {
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || "U";
  }

  return (
    <header className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
      transparent 
        ? "bg-white/95 backdrop-blur-md border-zinc-200" 
        : "bg-white border-zinc-200 shadow-sm"
    }`}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">
          Just<span className="text-red-600">Rent</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-bold tracking-wide uppercase">
          <Link href="/" className="text-zinc-600 hover:text-red-600 transition-colors">Home</Link>
          <Link href="/fleet" className="text-zinc-600 hover:text-red-600 transition-colors">Our Fleet</Link>
          <Link href="#contact" className="text-zinc-600 hover:text-red-600 transition-colors">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Language Selector (Visual Only) */}
          <div className="hidden md:flex items-center gap-2 text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors group">
            <Globe className="w-5 h-5 group-hover:text-red-600 transition-colors" />
            <span className="text-sm font-bold">ENG | EUR</span>
          </div>

          <div className="w-px h-6 bg-zinc-200 hidden md:block" />

          {/* Auth Trigger */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link href={user.role === 'ADMIN' ? "/admin" : "/dashboard"}>
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-zinc-900 hover:text-red-600 hover:bg-transparent p-0 h-auto transition-colors group font-normal">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-red-50 group-hover:rotate-12 transition-all duration-300 shadow-sm group-hover:shadow-md text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-bold uppercase group-hover:underline decoration-2 underline-offset-4">
                    Welcome, {getInitials(user.name)}
                  </span>
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <AuthModal 
              trigger={
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-zinc-900 hover:text-red-600 hover:bg-transparent p-0 h-auto transition-colors group font-normal">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-red-50 group-hover:rotate-12 transition-all duration-300 shadow-sm group-hover:shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold uppercase group-hover:underline decoration-2 underline-offset-4">Log in | Register</span>
                </Button>
              }
            />
          )}

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
