import { prisma } from "@/lib/prisma"
import { AdminProfileForm } from "@/components/admin/AdminProfileForm"
import { UsersTable } from "@/components/admin/UsersTable"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  // Self-healing: Ensure admin@justrent.com is SUPERADMIN
  const superAdminEmail = 'admin@justrent.com'
  const superAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } })
  
  if (superAdmin && superAdmin.role !== 'SUPERADMIN') {
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { role: 'SUPERADMIN' }
    })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  const currentUser = users.find(u => u.email === superAdminEmail) || users[0]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Users & Permissions</h1>
        <Link href="/admin/users/new">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AdminProfileForm user={currentUser} />
        </div>
        
        <div className="md:col-span-2">
           <UsersTable users={users} />
        </div>
      </div>
    </div>
  )
}
