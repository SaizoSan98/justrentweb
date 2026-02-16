
"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteCar } from "@/app/admin/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CarsTable({ cars }: { cars: any[] }) {
  const router = useRouter()

  const handleDelete = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return

    const formData = new FormData()
    // We can call the action directly if we wrap it or use a form, but direct call is cleaner here
    // However, server actions in client components need careful handling
    // Let's stick to the pattern used in UsersTable: simple async wrapper
    
    try {
        const result = await deleteCar(carId)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Car deleted successfully")
            router.refresh()
        }
    } catch (error) {
        toast.error("Failed to delete car")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">License Plate</th>
                <th className="px-6 py-4">Price / Day</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cars.map((car: any) => (
                <tr key={car.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    <div className="flex items-center gap-3">
                      {car.imageUrl && (
                        <img src={car.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover border border-zinc-200" />
                      )}
                      <div>
                        <div>{car.make} {car.model}</div>
                        <div className="text-xs text-zinc-400 font-normal">
                            {car.year} • {car.mileage.toLocaleString()} km
                            {car.vin && <span className="ml-2 text-[10px] bg-zinc-100 px-1 rounded text-zinc-500">VIN: {car.vin}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {car.categories.map((c: any) => c.name).join(', ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-600">
                    {car.licensePlate}
                    {car.renteonId && <div className="text-[10px] text-blue-600 mt-0.5">Renteon ID: {car.renteonId}</div>}
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">€{Number(car.pricePerDay).toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      car.status === 'AVAILABLE' ? 'bg-green-100 text-green-800 border border-green-200' :
                      car.status === 'RENTED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {car.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/cars/${car.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Pencil className="h-4 w-4 text-zinc-500" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(car.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {cars.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No cars found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-zinc-100">
          {cars.map((car: any) => (
            <div key={car.id} className="p-4 bg-white">
               <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-zinc-900">{car.make} {car.model}</div>
                  <div className="text-xs text-zinc-500">{car.licensePlate}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    car.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    car.status === 'RENTED' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {car.status}
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                  <Link href={`/admin/cars/${car.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(car.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}
