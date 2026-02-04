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
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar - Independent */}
      <AdminSidebar user={user} />
      
      {/* Main Content - Independent Scroll */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col bg-zinc-50">
        {/* Header - Not sticky here to avoid complexity with sidebar z-index, or maybe sticky inside content */}
        {/* Actually, user wants no footer here. And independent scroll. */}
        {/* Let's put header at top of main content area if we want it to scroll away or stay? */}
        {/* Usually Admin header is sticky. */}
        
        {/* But wait, the previous layout had Header fixed at top (z-50) and Sidebar fixed top-20. */}
        {/* The user complained about scrolling issues. */}
        {/* Let's make sidebar full height fixed left. Content on right. */}
        
        {/* We need to modify Header to not be fixed full width if we want it inside content, OR */}
        {/* Keep Header fixed full width (z-50) and Sidebar fixed left (z-40) below it? */}
        {/* The user wants sticky sidebar. */}
        
        {/* Let's try: Sidebar fixed left (z-50). Main content right. */}
        {/* Header inside main content? Or fixed top right? */}
        
        {/* Reuse the Dashboard layout approach which worked well. */}
        
        <main className="flex-1 p-8 overflow-y-auto h-screen">
           <div className="mb-8">
             {/* Admin specific header area if needed, or just rely on page titles */}
             {/* The global Header component is usually for the public site. */}
             {/* But Admin uses it too. Let's see if we can adapt. */}
             {/* If we put Header here it scrolls with content. */}
             {/* If we want fixed header, we need it outside main. */}
           </div>
           {children}
        </main>
      </div>
    </div>
  )
}
