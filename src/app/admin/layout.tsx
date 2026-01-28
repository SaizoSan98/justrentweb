import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Header } from "@/components/layout/Header"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const user = session?.user

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <AdminSidebar user={user} />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
