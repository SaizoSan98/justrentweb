import { prisma } from "@/lib/prisma"
import { CarForm } from "@/components/admin/CarForm"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NewCarPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/cars">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Add New Car</h1>
      </div>
      
      <CarForm categories={categories} />
    </div>
  )
}
