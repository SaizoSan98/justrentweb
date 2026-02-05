
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createUser } from "@/app/admin/users/actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function CreateUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const res = await createUser(formData)
    
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("User created successfully. Welcome email sent!")
      router.push("/admin/users")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="John Doe" required />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="john@example.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" placeholder="+36 30 123 4567" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
        <p className="text-xs text-zinc-500">
          The user will receive this password in their welcome email.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue="USER">
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create User
        </Button>
      </div>
    </form>
  )
}
