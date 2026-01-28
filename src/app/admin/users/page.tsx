import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { toggleUserRole } from "../actions"
import { AdminProfileForm } from "@/components/admin/AdminProfileForm"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  // Assume first user is admin or current session user (mocking auth for now)
  const currentUser = users.find(u => u.email === 'admin@justrent.com') || users[0]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Users & Permissions</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AdminProfileForm user={currentUser} />
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
              <h3 className="font-bold text-zinc-900">All Users</h3>
              <span className="text-xs font-bold bg-zinc-200 px-2 py-1 rounded text-zinc-600">{users.length} Users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-zinc-500 uppercase tracking-wider font-bold text-xs border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4">Name / Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">{user.name || 'N/A'}</div>
                        <div className="text-xs text-zinc-500">{user.email}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-zinc-900 text-white border border-zinc-700' :
                          'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                          {user.role}
                        </span>
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
                                Revoke Admin
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Make Admin
                              </>
                            )}
                          </Button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
