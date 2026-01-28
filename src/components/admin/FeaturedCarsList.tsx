"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { toggleFeaturedCar } from "@/app/admin/actions"
import { Loader2, Car, Star } from "lucide-react"
import Image from "next/image"

export function FeaturedCarsList({ cars }: { cars: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (id: string, currentState: boolean) => {
    setLoadingId(id)
    await toggleFeaturedCar(id, !currentState)
    setLoadingId(null)
  }

  const featuredCount = cars.filter(c => c.isFeatured).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-zinc-200">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Featured Vehicles</h3>
            <p className="text-xs text-zinc-500">Selected: {featuredCount} (Recommended: 6)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Card key={car.id} className={`overflow-hidden transition-all ${car.isFeatured ? 'ring-2 ring-yellow-500 border-yellow-500/50 bg-yellow-50/10' : 'hover:border-zinc-300'}`}>
            <div className="relative h-48 bg-zinc-100">
              {car.imageUrl ? (
                <Image 
                  src={car.imageUrl} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  <Car className="w-12 h-12" />
                </div>
              )}
              {car.isFeatured && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-white" /> Featured
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-zinc-900">{car.make} {car.model}</h4>
                  <p className="text-xs text-zinc-500">{car.licensePlate}</p>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-zinc-900">€{Number(car.pricePerDay)}</span>
                  <span className="text-xs text-zinc-500">/day</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <span className="text-sm font-medium text-zinc-600">Show on Homepage</span>
                <div className="flex items-center gap-3">
                  {loadingId === car.id && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
                  <Switch 
                    checked={car.isFeatured}
                    onCheckedChange={() => handleToggle(car.id, car.isFeatured)}
                    disabled={loadingId === car.id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
