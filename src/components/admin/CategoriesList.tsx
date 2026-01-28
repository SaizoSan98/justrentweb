"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Tag } from "lucide-react"
import { deleteCategory } from "@/app/admin/actions"

export function CategoriesList({ categories }: { categories: any[] }) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-md transition-shadow group">
          <CardContent className="p-6 flex justify-between items-center">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-100 rounded-lg group-hover:bg-red-50 transition-colors">
                <Tag className="w-6 h-6 text-zinc-600 group-hover:text-red-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900">{category.name}</h3>
                <p className="text-zinc-500 text-sm mb-1">{category.description || "No description"}</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">
                    Slug: {category.slug}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <form action={async () => await deleteCategory(category.id)}>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {categories.length === 0 && (
        <div className="text-center py-12 text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No categories found. Create one to get started.</p>
        </div>
      )}
    </div>
  )
}
