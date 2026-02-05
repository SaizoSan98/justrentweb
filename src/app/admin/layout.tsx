import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminMobileNav } from "@/components/admin/AdminMobileNav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const user = session?.user

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar - Desktop */}
      <AdminSidebar user={user} />
      
      {/* Sidebar - Mobile */}
      <AdminMobileNav user={user} />
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 ml-0 min-h-screen flex flex-col bg-zinc-50 transition-all duration-300">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pt-16 md:pt-8">
           <div className="mb-8 hidden md:block">
             {/* Spacing for desktop if needed */}
           </div>
           {children}
        </main>
      </div>
    </div>
  )
}
