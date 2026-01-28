
import { prisma } from "@/lib/prisma"
import { getTranslations } from "@/lib/translation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Map, Baby, User, PlaneLanding, PlaneTakeoff, Snowflake, Star } from "lucide-react"
import { createExtra } from "../actions"
import { ExtrasList } from "@/components/admin/ExtrasList"

export const dynamic = 'force-dynamic'

const ICON_OPTIONS = [
  { value: 'Map', label: 'Map', component: Map },
  { value: 'Baby', label: 'Baby Seat', component: Baby },
  { value: 'User', label: 'Driver', component: User },
  { value: 'PlaneLanding', label: 'Airport In', component: PlaneLanding },
  { value: 'PlaneTakeoff', label: 'Airport Out', component: PlaneTakeoff },
  { value: 'Snowflake', label: 'Winter', component: Snowflake },
  { value: 'Star', label: 'Star', component: Star },
]

export default async function ExtrasPage() {
  const extras = await prisma.extra.findMany({
    orderBy: { name: 'asc' }
  })

  const translations = await getTranslations(extras.map(e => e.id), 'Extra', 'he')

  const serializedExtras = extras.map(e => ({
    ...e,
    price: Number(e.price)
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Extras & Pricing</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Extra</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createExtra} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English)</Label>
                  <Input id="name" name="name" placeholder="e.g. GPS" required />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="name_he">Name (Hebrew)</Label>
                    <span className="text-xs text-zinc-500">Auto-translate</span>
                  </div>
                  <Input id="name_he" name="name_he" placeholder="Optional" dir="rtl" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (EUR)</Label>
                  <Input id="price" name="price" type="number" placeholder="15" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type</Label>
                  <Select name="priceType" defaultValue="PER_DAY">
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
                  <Label htmlFor="icon">Icon</Label>
                  <Select name="icon">
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
                  <Label htmlFor="description">Description (English)</Label>
                  <Input id="description" name="description" placeholder="Optional details" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="description_he">Description (Hebrew)</Label>
                    <span className="text-xs text-zinc-500">Auto-translate</span>
                  </div>
                  <Input id="description_he" name="description_he" placeholder="Optional" dir="rtl" />
                </div>

                <Button type="submit" className="w-full bg-zinc-900 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Extra
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          <ExtrasList extras={serializedExtras} translations={translations} />
        </div>
      </div>
    </div>
  )
}
