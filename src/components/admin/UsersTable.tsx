
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShieldAlert, ShieldCheck, Ban, CheckCircle, Pencil, UserX, Mail, Phone, Calendar, Trash2 } from "lucide-react"
import { toggleUserRole, banUser, unbanUser, updateUserByAdmin, deleteUser } from "@/app/admin/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function UsersTable({ users }: { users: any[] }) {
  const [editingUser, setEditingUser] = useState<any>(null)
  const [banningUser, setBanningUser] = useState<any>(null)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const router = useRouter()

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    
    const result = await deleteUser(deletingUser.id)
    if (result.error) {
        toast.error(result.error)
    } else {
        toast.success("User deleted successfully")
        setDeletingUser(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
          <h3 className="font-bold text-zinc-900">All Users</h3>
          <span className="text-xs font-bold bg-zinc-200 px-2 py-1 rounded text-zinc-600">{users.length} Users</span>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-zinc-500 uppercase tracking-wider font-bold text-xs border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Name / Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((user) => (
                <tr key={user.id} className={`transition-colors ${user.isBanned ? "bg-red-50" : "hover:bg-zinc-50/50"}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{user.name || 'N/A'}</div>
                    <div className="text-xs text-zinc-500">{user.email}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {user.phone && <span className="mr-2">{user.phone}</span>}
                      Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.role === 'SUPERADMIN' ? 'bg-purple-900 text-white border border-purple-700' :
                      user.role === 'ADMIN' ? 'bg-zinc-900 text-white border border-zinc-700' :
                      'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 border border-red-200">
                        <Ban className="w-3 h-3 mr-1" /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-600 border border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingUser(user)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      
                      {user.role !== 'SUPERADMIN' && (
                        <>
                          <form action={async () => {
                             await toggleUserRole(user.id, user.role)
                          }}>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title={user.role === 'ADMIN' ? "Revoke Admin" : "Make Admin"}
                              className={`h-8 w-8 ${user.role === 'ADMIN' ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50' : 'text-zinc-400 hover:text-purple-600 hover:bg-purple-50'}`}
                            >
                              {user.role === 'ADMIN' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            </Button>
                          </form>

                          {user.isBanned ? (
                            <form action={async () => {
                              await unbanUser(user.id)
                            }}>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Unban User"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </form>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="Ban User"
                              onClick={() => setBanningUser(user)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserX className="w-4 h-4" />
                            </Button>
                          )}

                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeletingUser(user)}
                            className="h-8 w-8 text-zinc-400 hover:text-red-700 hover:bg-red-50"
                            title="Delete User Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {users.map((user) => (
            <div key={user.id} className={`p-4 ${user.isBanned ? "bg-red-50" : "bg-white"}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-zinc-900">{user.name || 'N/A'}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'ADMIN' ? 'bg-zinc-900 text-white' :
                        'bg-zinc-100 text-zinc-600'
                      }`}>
                        {user.role}
                    </span>
                    {user.isBanned ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-red-600">
                        <Ban className="w-3 h-3 mr-1" /> Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                   <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-zinc-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-zinc-400" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-zinc-400" />
                    {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </div>
              </div>

              {/* Mobile Actions */}
              {user.role !== 'SUPERADMIN' && (
                <div className="flex gap-2 pt-3 border-t border-zinc-100/50">
                   <form action={async () => await toggleUserRole(user.id, user.role)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        {user.role === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                      </Button>
                   </form>
                   
                   {user.isBanned ? (
                      <form action={async () => await unbanUser(user.id)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs h-8 text-green-600 border-green-200 hover:bg-green-50">
                          Unban
                        </Button>
                      </form>
                   ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setBanningUser(user)}
                        className="flex-1 text-xs h-8 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Ban
                      </Button>
                   )}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form action={async (formData) => {
              await updateUserByAdmin(formData)
              setEditingUser(null)
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingUser.id} />
              
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="name" defaultValue={editingUser.name || ''} />
              </div>
              
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input name="email" type="email" defaultValue={editingUser.email} />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input name="phone" defaultValue={editingUser.phone || ''} />
              </div>

              <div className="space-y-2">
                <Label>Tax ID</Label>
                <Input name="taxId" defaultValue={editingUser.taxId || ''} />
              </div>

              <div className="space-y-2">
                <Label>New Password (Optional)</Label>
                <Input name="password" type="password" placeholder="Leave blank to keep current" />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={!!banningUser} onOpenChange={(open) => !open && setBanningUser(null)}>
        <DialogContent className="w-[90%] max-w-[420px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Ban User: {banningUser?.name}</DialogTitle>
          </DialogHeader>
          {banningUser && (
            <form action={async (formData) => {
              const reason = formData.get('reason') as string
              await banUser(banningUser.id, reason)
              setBanningUser(null)
            }} className="space-y-4">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
                Warning: This will immediately log out the user and prevent future logins.
              </div>
              
              <div className="space-y-2">
                <Label>Ban Reason</Label>
                <Textarea name="reason" placeholder="Violation of terms..." required />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setBanningUser(null)}>Cancel</Button>
                <Button variant="destructive" type="submit">Ban User</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
