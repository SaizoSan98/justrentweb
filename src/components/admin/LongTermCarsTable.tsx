
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteLongTermCar, toggleLongTermAvailability } from "@/app/actions/long-term-car"
import { toast } from "sonner"

interface LongTermCar {
  id: string
  make: string
  model: string
  year: number
  imageUrl: string | null
  monthlyPrice: any // Decimal
  isAvailable: boolean
  fuelType: string
  transmission: string
}

interface LongTermCarsTableProps {
  cars: LongTermCar[]
}

export function LongTermCarsTable({ cars }: LongTermCarsTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return
    
    setIsLoading(true)
    const result = await deleteLongTermCar(id)
    setIsLoading(false)

    if (result.success) {
      toast.success("Car deleted successfully")
      router.refresh()
    } else {
      toast.error("Failed to delete car")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsLoading(true)
    const result = await toggleLongTermAvailability(id, !currentStatus)
    setIsLoading(false)

    if (result.success) {
      toast.success("Status updated")
      router.refresh()
    } else {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="rounded-md border border-zinc-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Make & Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Monthly Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cars.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                No long term rental cars found. Add one to get started.
              </TableCell>
            </TableRow>
          ) : (
            cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                  <div className="relative w-16 h-10 rounded overflow-hidden bg-zinc-100">
                    {car.imageUrl ? (
                      <Image 
                        src={car.imageUrl} 
                        alt={car.model} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">
                        No img
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{car.make} {car.model}</div>
                  <div className="text-xs text-zinc-500">{car.transmission} • {car.fuelType}</div>
                </TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell className="font-bold">
                    €{Number(car.monthlyPrice)} / month
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={car.isAvailable ? "default" : "secondary"}
                    className={car.isAvailable ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100"}
                  >
                    {car.isAvailable ? "Available" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/admin/long-term/${car.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(car.id, car.isAvailable)}>
                        {car.isAvailable ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {car.isAvailable ? "Hide from Fleet" : "Show in Fleet"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(car.id)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Car
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
