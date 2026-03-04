
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminProfileForm } from "@/components/admin/AdminProfileForm"
import { dictionaries } from "@/lib/dictionary"
import { cookies } from "next/headers"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) return null

  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">{dictionary.dashboard.my_profile_title}</h1>
        <p className="text-zinc-500">{dictionary.dashboard.update_profile_desc}</p>
      </div>

      <AdminProfileForm user={user} dictionary={dictionary} />
    </div>
  )
}
