
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminProfileForm } from "@/components/admin/AdminProfileForm"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">My Profile</h1>
        <p className="text-zinc-500">Update your personal information.</p>
      </div>

      <AdminProfileForm user={user} />
    </div>
  )
}
