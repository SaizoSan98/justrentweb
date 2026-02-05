"use client"

import { AdminSidebarContent } from "./AdminSidebarContent"

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  } | undefined
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 border-r border-zinc-100 fixed top-0 bottom-0 z-40 bg-white">
      <AdminSidebarContent user={user} />
    </aside>
  )
}
