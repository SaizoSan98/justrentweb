"use client"

import { useState } from "react"
import { X, Mail, Lock, User, ArrowRight, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  trigger?: React.ReactNode
  isOpen?: boolean
  onClose?: () => void
}

export function AuthModal({ trigger }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button>Log in</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl gap-0">
        {/* Header Section */}
        <div className="bg-zinc-900 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent opacity-50" />
          <h2 className="text-2xl font-black text-white relative z-10 tracking-tight">
            Welcome to <span className="text-red-500">JustRent</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-2 relative z-10">
            Access your premium fleet journey
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
            Log In
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
            Register
            {activeTab === "register" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600" />
            )}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    placeholder="John Doe" 
                    className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
                {activeTab === "login" && (
                  <a href="#" className="text-xs font-medium text-red-600 hover:underline">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 h-11 border-zinc-200 focus:ring-red-600 focus:border-red-600 bg-zinc-50/50" 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-red-600/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">Processing...</span>
              ) : (
                <span className="flex items-center gap-2">
                  {activeTab === "login" ? "Sign In" : "Create Account"} 
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-10 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-zinc-600 font-medium text-xs">
              <Github className="w-4 h-4 mr-2" /> Google
            </Button>
            <Button variant="outline" className="h-10 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-zinc-600 font-medium text-xs">
              <Github className="w-4 h-4 mr-2" /> Apple
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
