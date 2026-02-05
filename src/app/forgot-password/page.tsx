
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { requestPasswordReset } from "./actions"
import { toast } from "sonner"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await requestPasswordReset(formData)
    
    setIsPending(false)
    
    if (result.error) {
      toast.error(result.error)
    } else {
      setIsSuccess(true)
      toast.success("If an account exists, we sent a reset link.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-zinc-200">
        <CardHeader className="space-y-2 pb-6 bg-zinc-50 border-b border-zinc-100">
          <div className="text-center mb-4 flex justify-center">
             <Logo variant="dark" className="scale-125" />
          </div>
          <CardTitle className="text-xl font-bold text-center text-zinc-800">
            {isSuccess ? "Check your email" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center text-zinc-500">
            {isSuccess 
              ? "We have sent a password reset link to your email address." 
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          {isSuccess ? (
            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <Button asChild className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="pl-10 bg-zinc-50"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
