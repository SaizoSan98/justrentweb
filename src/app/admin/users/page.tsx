import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { toggleUserRole } from "../actions"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Users</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={toggleUserRole.bind(null, user.id, user.role)}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={user.role === 'ADMIN' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
                      >
                        {user.role === 'ADMIN' ? (
                          <>
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Demote to User
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            Promote to Admin
                          </>
                        )}
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
