"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, User, LogOut, Globe } from "lucide-react"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AuthModal } from "@/components/auth/AuthModal"
import { logoutAction } from "@/app/admin/actions"

interface HeaderProps {
  transparent?: boolean
  user?: any
  dictionary?: any
  lang?: string
}

export function Header({ transparent = false, user, dictionary = {}, lang = "en" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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

  return (
    <header className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
      transparent 
        ? "bg-white/95 backdrop-blur-md border-zinc-200" 
        : "bg-white border-zinc-200 shadow-sm"
    }`}>
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/jrlogo.PNG" 
            alt="JustRent Logo" 
            width={300} 
            height={90} 
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-bold tracking-wide uppercase">
          <Link href="/" className="text-zinc-600 hover:text-red-600 transition-colors">{t('home')}</Link>
          <Link href="/fleet" className="text-zinc-600 hover:text-red-600 transition-colors">{t('fleet')}</Link>
          <Link href="#contact" className="text-zinc-600 hover:text-red-600 transition-colors">{t('contact')}</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <LanguageSwitcher currentLang={lang} />

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
                    {t('welcome')}, {getInitials(user.name)}
                  </span>
                </Button>
              </Link>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('signout')}
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
                  <span className="text-sm font-bold uppercase group-hover:underline decoration-2 underline-offset-4">{t('login')} | {t('register')}</span>
                </Button>
              }
            />
          )}

          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white p-0 flex flex-col">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <Image 
                    src="/jrlogo.PNG" 
                    alt="JustRent Logo" 
                    width={120} 
                    height={40} 
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                {/* Close button is automatically added by SheetContent, but we can customize if needed */}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <nav className="flex flex-col gap-4">
                  <Link 
                    href="/" 
                    className="text-lg font-bold text-zinc-900 hover:text-red-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('home')}
                  </Link>
                  <Link 
                    href="/fleet" 
                    className="text-lg font-bold text-zinc-900 hover:text-red-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('fleet')}
                  </Link>
                  <Link 
                    href="#contact" 
                    className="text-lg font-bold text-zinc-900 hover:text-red-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('contact')}
                  </Link>
                </nav>

                <div className="h-px bg-zinc-100 w-full my-2" />

                {/* Mobile Auth */}
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold border border-zinc-200">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900">{user.name || "User"}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                    
                    <Link href={user.role === 'ADMIN' ? "/admin" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        {t('profile')}
                      </Button>
                    </Link>
                    
                    <form action={async () => {
                      await logoutAction()
                      setIsMobileMenuOpen(false)
                    }}>
                      <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('signout')}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <AuthModal 
                      trigger={
                        <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                          {t('login')} / {t('register')}
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
