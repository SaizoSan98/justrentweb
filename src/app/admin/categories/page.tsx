import { prisma } from "@/lib/prisma"
import { createCategory, deleteCategory } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, FolderTree } from "lucide-react"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Car Categories</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="SUV" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" placeholder="suv" required />
                  <p className="text-xs text-zinc-500">URL friendly ID (a-z, 0-9, -)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800">
                  Create Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-red-600" />
                Existing Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.length === 0 && (
                  <p className="text-zinc-500 text-center py-8">No categories found.</p>
                )}
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg bg-zinc-50/50">
                    <div>
                      <h3 className="font-bold text-zinc-900">{category.name}</h3>
                      <div className="text-xs text-zinc-500 font-mono">{category.slug}</div>
                      {category.description && (
                        <p className="text-sm text-zinc-600 mt-1">{category.description}</p>
                      )}
                    </div>
                    <form action={deleteCategory.bind(null, category.id)}>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
