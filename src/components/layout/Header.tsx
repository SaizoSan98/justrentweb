"use client"

import Link from "next/link"
import { Globe, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth/AuthModal"

interface HeaderProps {
  transparent?: boolean
}

export function Header({ transparent = false }: HeaderProps) {
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
            <span className="text-sm font-bold">EN | USD</span>
          </div>

          <div className="w-px h-6 bg-zinc-200 hidden md:block" />

          {/* Auth Trigger */}
          <AuthModal 
            trigger={
              <Button variant="ghost" className="hidden md:flex items-center gap-2 text-zinc-900 hover:text-red-600 hover:bg-transparent p-0 h-auto transition-colors group font-normal">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold uppercase">Log in | Register</span>
              </Button>
            }
          />

          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
