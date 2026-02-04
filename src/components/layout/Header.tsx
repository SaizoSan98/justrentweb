"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/ui/logo"
import { Menu, X, User, LogOut, Globe } from "lucide-react"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AuthModal } from "@/components/auth/AuthModal"
import { logoutAction } from "@/app/admin/actions"
import { cn } from "@/lib/utils"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LayoutDashboard } from "lucide-react"

interface HeaderProps {
  transparent?: boolean
  user?: any
  dictionary?: any
  lang?: string
}

export function Header({ transparent = false, user, dictionary = {}, lang = "en" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Helper to safely get dictionary value
  const t = (key: string, section: string = "nav") => {
    return dictionary?.[section]?.[key] || key
  }

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || "U";
  }

  // Always white text on transparent, black on white background
  // Floating pill style logic
  const isFloating = true; 
  
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className={cn(
        "pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "flex items-center justify-between px-2 py-2 rounded-full",
        "bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        isScrolled ? "w-[90%] md:w-[70%] lg:w-[50%]" : "w-[95%] md:w-[85%] lg:w-[1200px]"
      )}>
        <div className="flex items-center gap-1 pl-4">
          {/* Logo */}
          <Link href="/" className="flex items-center group mr-8">
             <Logo variant="dark" className="scale-90 origin-left" />
          </Link>

          {/* Desktop Nav - Now Pill Style */}
          <nav className="hidden md:flex items-center bg-zinc-100/50 rounded-full px-1 py-1">
            {[
              { href: "/", label: t('home') },
              { href: "/fleet", label: t('fleet') },
              { href: "/contact", label: t('contact') }
            ].map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="px-5 py-2 rounded-full text-sm font-bold text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all duration-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 pr-2">
          {/* Language Selector */}
          <div className="hidden sm:block text-zinc-900">
            <LanguageSwitcher currentLang={lang} />
          </div>

          {/* Auth Trigger */}
          {user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full w-10 h-10 p-0 bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 transition-all cursor-pointer">
                     <span className="text-xs font-bold">{getInitials(user.name)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-bold">{user.name}</span>
                      <span className="text-xs text-zinc-500 font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <Link href={user.role === 'ADMIN' ? "/admin" : "/dashboard"}>
                    <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-zinc-100 p-3">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/profile">
                    <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-zinc-100 p-3">
                      <Settings className="w-4 h-4 mr-2" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <form action={logoutAction} className="w-full">
                    <button type="submit" className="w-full">
                      <DropdownMenuItem className="cursor-pointer rounded-xl focus:bg-red-50 text-red-600 focus:text-red-700 p-3">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <AuthModal 
              trigger={
                <Button className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 px-6 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  {t('login')}
                </Button>
              }
            />
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-zinc-900 rounded-full w-10 h-10 hover:bg-zinc-100">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white p-0 flex flex-col">
              {/* ... existing mobile menu content ... */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo variant="dark" />
                </Link>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-bold text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</Link>
                  <Link href="/fleet" className="text-lg font-bold text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>{t('fleet')}</Link>
                  <Link href="/contact" className="text-lg font-bold text-zinc-900" onClick={() => setIsMobileMenuOpen(false)}>{t('contact')}</Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </div>
  )
}
