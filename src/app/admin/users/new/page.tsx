
import { CreateUserForm } from "@/components/admin/CreateUserForm"

export default function NewUserPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Create New User</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <CreateUserForm />
      </div>
    </div>
  )
}
