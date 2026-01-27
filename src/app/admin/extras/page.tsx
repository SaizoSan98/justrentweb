
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { deleteExtra, createExtra } from "../actions"

export const dynamic = 'force-dynamic'

export default async function ExtrasPage() {
  const extras = await prisma.extra.findMany({
    orderBy: { name: 'asc' }
  })

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
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="e.g. GPS" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Ft)</Label>
                  <Input id="price" name="price" type="number" placeholder="1500" required />
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
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Optional details" />
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
          {extras.map((extra) => (
            <Card key={extra.id}>
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{extra.name}</h3>
                  <p className="text-sm text-zinc-500">{extra.description}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                    {Number(extra.price).toLocaleString()} Ft / {extra.priceType === 'PER_DAY' ? 'Day' : 'Rental'}
                  </div>
                </div>
                <form action={deleteExtra.bind(null, extra.id)}>
                  <Button variant="outline" size="icon" className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
          {extras.length === 0 && (
            <div className="text-center py-12 text-zinc-500 bg-white rounded-xl border border-zinc-200">
              No extras found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
