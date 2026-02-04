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

import { useRouter } from "next/navigation"

export function Header({ transparent = false, user, dictionary = {}, lang = "en" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
        router.push(`/fleet?make=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

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
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none">
      <header className={cn(
        "pointer-events-auto transition-all duration-300 ease-in-out w-full",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-b border-zinc-200/50 py-3 shadow-sm text-zinc-900" 
          : "bg-transparent py-6 text-white"
      )}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
               {isScrolled ? <Logo variant="dark" /> : <Logo variant="light" />}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { href: "/", label: t('home') },
                { href: "/fleet", label: t('fleet') },
                { href: "/contact", label: t('contact') }
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={cn(
                    "text-sm font-medium transition-colors hover:opacity-80",
                    isScrolled ? "text-zinc-600 hover:text-zinc-900" : "text-white/90 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center Search Bar (Visible on larger screens) */}
          <div className={cn(
            "hidden lg:flex flex-1 max-w-md mx-12 items-center px-4 py-2.5 rounded-full transition-all duration-300",
            isScrolled 
              ? "bg-zinc-100/80 border border-zinc-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-zinc-200" 
              : "bg-white/10 backdrop-blur-md border border-white/20 focus-within:bg-white/20"
          )}>
            <form onSubmit={handleSearch} className="flex-1 flex items-center w-full">
                <input 
                  type="text" 
                  placeholder="Search Car" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-400 w-full",
                    isScrolled ? "text-zinc-900" : "text-white placeholder:text-white/60"
                  )}
                />
                <button type="submit" className={cn(
                   "ml-2",
                   isScrolled ? "text-zinc-400 hover:text-zinc-900" : "text-white/60 hover:text-white"
                )}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSwitcher currentLang={lang} />
            </div>

            {/* Auth Trigger */}
            {user ? (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn(
                        "rounded-full w-10 h-10 p-0 hover:scale-105 transition-all cursor-pointer",
                        isScrolled ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-900 hover:bg-white/90"
                    )}>
                       <span className="text-xs font-bold">{getInitials(user.name)}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{user.name}</span>
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
              <div className="flex items-center gap-4">
                <AuthModal 
                  trigger={
                    <button className={cn(
                        "text-sm font-bold transition-colors hover:opacity-80 hidden sm:block",
                        isScrolled ? "text-zinc-900" : "text-white"
                    )}>
                      Log In
                    </button>
                  }
                />
                <AuthModal 
                  trigger={
                    <Button className={cn(
                        "rounded-lg px-6 font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all",
                        isScrolled ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-900 hover:bg-white/90"
                    )}>
                      Sign Up
                    </Button>
                  }
                />
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                    "md:hidden rounded-full w-10 h-10",
                    isScrolled ? "text-zinc-900 hover:bg-zinc-100" : "text-white hover:bg-white/20"
                )}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white p-0 flex flex-col z-[60]">
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
        </div>
      </header>
    </div>
  )
}
