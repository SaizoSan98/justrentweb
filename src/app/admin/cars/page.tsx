
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteCar } from "../actions"

export const dynamic = 'force-dynamic'

export default async function CarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categories: true }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Fleet Management</h1>
        <Link href="/admin/cars/new">
          <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
      </div>

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
                        <div className="text-xs text-zinc-400 font-normal">{car.year} • {car.mileage.toLocaleString()} km</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {car.categories.map((c: any) => c.name).join(', ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-600">{car.licensePlate}</td>
                  <td className="px-6 py-4 font-bold text-zinc-900">€{Number(car.pricePerDay).toLocaleString()}</td>
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
                      <form action={deleteCar.bind(null, car.id)}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
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
            <div key={car.id} className="p-4 hover:bg-zinc-50/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                      {car.imageUrl ? (
                        <img src={car.imageUrl} alt="" className="w-12 h-12 rounded-md object-cover border border-zinc-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-400">
                           <div className="text-xs">No Img</div>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-zinc-900">{car.make} {car.model}</div>
                        <div className="text-xs text-zinc-400 font-normal">{car.year} • {car.mileage.toLocaleString()} km</div>
                      </div>
                 </div>
                 
                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      car.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                      car.status === 'RENTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {car.status}
                 </span>
              </div>

              <div className="space-y-2 mb-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">License Plate</span>
                    <span className="font-mono font-medium text-zinc-900">{car.licensePlate}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Price / Day</span>
                    <span className="font-bold text-zinc-900">€{Number(car.pricePerDay).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">Categories</span>
                    <span className="text-zinc-900 text-right">{car.categories.map((c: any) => c.name).join(', ')}</span>
                 </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                  <Link href={`/admin/cars/${car.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8">
                      <Pencil className="h-3 w-3 mr-2" /> Edit
                    </Button>
                  </Link>
                  <form action={deleteCar.bind(null, car.id)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                      <Trash2 className="h-3 w-3 mr-2" /> Delete
                    </Button>
                  </form>
              </div>
            </div>
          ))}
          {cars.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
               No cars found. Add one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
