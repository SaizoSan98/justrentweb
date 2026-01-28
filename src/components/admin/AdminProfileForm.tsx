"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateUserProfile } from "@/app/admin/actions"
import { User, Mail, ShieldCheck, Lock, Loader2 } from "lucide-react"

export function AdminProfileForm({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-600" />
          My Admin Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form 
          action={async (formData) => {
            setIsSubmitting(true)
            await updateUserProfile(formData)
            setIsSubmitting(false)
          }} 
          className="space-y-4 max-w-md"
        >
          <input type="hidden" name="id" value={user.id} />
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input id="name" name="name" defaultValue={user.name || ""} className="pl-9" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input id="email" name="email" defaultValue={user.email} className="pl-9" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password (Optional)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input id="password" name="password" type="password" placeholder="Leave empty to keep current" className="pl-9" />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full bg-zinc-900 text-white" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
