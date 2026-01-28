"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Map, Baby, User, PlaneLanding, PlaneTakeoff, Snowflake, Star, Pencil } from "lucide-react"
import { deleteExtra, updateExtra } from "@/app/admin/actions"

const ICON_OPTIONS = [
  { value: 'Map', label: 'Map', component: Map },
  { value: 'Baby', label: 'Baby Seat', component: Baby },
  { value: 'User', label: 'Driver', component: User },
  { value: 'PlaneLanding', label: 'Airport In', component: PlaneLanding },
  { value: 'PlaneTakeoff', label: 'Airport Out', component: PlaneTakeoff },
  { value: 'Snowflake', label: 'Winter', component: Snowflake },
  { value: 'Star', label: 'Star', component: Star },
]

interface Extra {
  id: string
  name: string
  description: string | null
  price: number
  priceType: string
  icon: string | null
}

export function ExtrasList({ extras }: { extras: any[] }) {
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <div className="space-y-4">
      {extras.map((extra) => {
        const IconComponent = ICON_OPTIONS.find(opt => opt.value === extra.icon)?.component || Star
        
        return (
          <Card key={extra.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-6 flex justify-between items-center">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-zinc-100 rounded-lg group-hover:bg-red-50 transition-colors">
                  <IconComponent className="w-6 h-6 text-zinc-600 group-hover:text-red-600 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900">{extra.name}</h3>
                  <p className="text-zinc-500 text-sm mb-1">{extra.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">
                      €{Number(extra.price)} {extra.priceType === 'PER_DAY' ? '/ day' : '/ rental'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog open={isEditOpen && editingExtra?.id === extra.id} onOpenChange={(open) => {
                  setIsEditOpen(open)
                  if (open) setEditingExtra(extra)
                  else setEditingExtra(null)
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Extra</DialogTitle>
                    </DialogHeader>
                    <form action={async (formData) => {
                      await updateExtra(formData)
                      setIsEditOpen(false)
                    }} className="space-y-4">
                      <input type="hidden" name="id" value={extra.id} />
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input id="edit-name" name="name" defaultValue={extra.name} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-price">Price (EUR)</Label>
                        <Input id="edit-price" name="price" type="number" defaultValue={Number(extra.price)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-priceType">Price Type</Label>
                        <Select name="priceType" defaultValue={extra.priceType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PER_DAY">Per Day</SelectItem>
                            <SelectItem value="PER_RENTAL">Per Rental</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-icon">Icon</Label>
                        <Select name="icon" defaultValue={extra.icon || "Star"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                          </SelectTrigger>
                          <SelectContent>
                            {ICON_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.component className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input id="edit-description" name="description" defaultValue={extra.description || ""} />
                      </div>
                      <Button type="submit" className="w-full bg-zinc-900 text-white">
                        Save Changes
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <form action={deleteExtra.bind(null, extra.id)}>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        )
      })}
      
      {extras.length === 0 && (
        <div className="text-center py-12 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 text-zinc-500">
          No extras found. Create one to get started.
        </div>
      )}
    </div>
  )
}
