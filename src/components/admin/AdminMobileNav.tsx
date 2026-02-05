"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminSidebarContent } from "./AdminSidebarContent"
import { useState } from "react"

interface AdminMobileNavProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | undefined
}

export function AdminMobileNav({ user }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md border-zinc-200">
          <Menu className="h-5 w-5 text-zinc-700" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 border-r border-zinc-100">
        <AdminSidebarContent user={user} onLinkClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
