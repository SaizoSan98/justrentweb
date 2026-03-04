"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"
import { X, Mail, Lock, User, ArrowRight, Github, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { loginAction, registerAction } from "@/app/login/actions"
import { LoginButton } from "./LoginButton"
import { RegisterButton } from "./RegisterButton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { Dictionary } from "@/lib/dictionary"

interface AuthModalProps {
  trigger?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
  dictionary: Dictionary
}

export function AuthModal({ trigger, dictionary }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)

  // We'll use the server action directly for login
  // For register, we keep it as simulation for now or implement later

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>Log in</Button>}
      </DialogTrigger>
      <DialogContent className="w-[85%] max-w-[360px] sm:max-w-[420px] max-h-[90vh] p-0 overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl gap-0">
        {/* Header Section */}
        <div className="bg-zinc-900 p-5 md:p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-50" />
          <div className="relative z-10 flex justify-center mb-2">
            <Logo variant="light" className="scale-110 md:scale-125" />
          </div>
          <p className="text-zinc-400 text-xs md:text-sm mt-2 relative z-10">
            {dictionary.auth.access_premium}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100">
          <button
            onClick={() => setActiveTab("login")}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-all relative",
              activeTab === "login"
                ? "text-red-600 bg-white"
                : "text-zinc-400 bg-zinc-50 hover:bg-zinc-100"
            )}
          >
            {dictionary.auth.log_in}
            {activeTab === "login" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-4 text-sm font-bold transition-all relative",
              activeTab === "register"
                ? "text-red-600 bg-white"
                : "text-zinc-400 bg-zinc-50 hover:bg-zinc-100"
            )}
          >
            {dictionary.auth.register}
            {activeTab === "register" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600" />
            )}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-5 md:p-8">
          {activeTab === "login" ? (
            <form action={loginAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.email_address}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.password}</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-red-600 hover:underline">{dictionary.auth.forgot}</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <LoginButton pendingText={dictionary.auth.signing_in} text={dictionary.auth.sign_in} />
            </form>
          ) : (
            <form action={registerAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.name_company}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="name"
                    placeholder={dictionary.auth.name_placeholder}
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.tax_id_optional}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="taxId"
                    placeholder={dictionary.auth.tax_placeholder}
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.phone_number}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder={dictionary.auth.phone_placeholder}
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.email_address}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">{dictionary.auth.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <RegisterButton pendingText={dictionary.auth.creating_account} text={dictionary.auth.create_account} />
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
