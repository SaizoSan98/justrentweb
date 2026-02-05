"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = ["SUV", "Sedan", "Luxury", "Convertible", "Van"]
const TRANSMISSIONS = ["AUTOMATIC", "MANUAL"]
const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]

interface FleetFiltersProps {
  filters: {
    categories: string[]
    transmissions: string[]
    fuelTypes: string[]
    seats: number[]
    guaranteedModel: boolean
    make: string
  }
  onChange: (key: any, value: any) => void
  options?: any
  dictionary?: any
}

export function FleetFilters({ 
  filters, 
  onChange, 
  options,
  dictionary = {}
}: FleetFiltersProps) {
  
  const categoriesList = options?.categories || CATEGORIES
  const transmissionsList = options?.transmissions || TRANSMISSIONS
  const fuelTypesList = options?.fuelTypes || FUEL_TYPES
  
  return (
    <div className="space-y-8 text-zinc-900 bg-white">
      
      {/* Vehicle Category */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Vehicle Category</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((category: string) => {
            const isSelected = filters.categories.includes(category)
            return (
              <Button
                key={category}
                variant="outline"
                onClick={() => {
                  const newCategories = isSelected
                    ? filters.categories.filter((c) => c !== category)
                    : [...filters.categories, category]
                  onChange('categories', newCategories)
                }}
                className={cn(
                  "rounded-full h-9 px-4 text-xs font-bold transition-all border",
                  isSelected 
                    ? "bg-black text-white border-black hover:bg-zinc-800 hover:text-white" 
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                {category}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* Transmission */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Gear Shift</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {transmissionsList.map((transmission: string) => {
             const isSelected = filters.transmissions.includes(transmission)
             return (
                <Button
                    key={transmission}
                    variant="outline"
                    onClick={() => {
                        const newTransmissions = isSelected
                            ? filters.transmissions.filter((t) => t !== transmission)
                            : [...filters.transmissions, transmission]
                        onChange('transmissions', newTransmissions)
                    }}
                    className={cn(
                        "rounded-full h-9 px-4 text-xs font-bold transition-all border",
                        isSelected 
                            ? "bg-black text-white border-black hover:bg-zinc-800 hover:text-white" 
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                >
                    {transmission}
                </Button>
             )
          })}
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* Fuel Type */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Fuel Type</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {fuelTypesList.map((fuel: string) => {
             const isSelected = filters.fuelTypes.includes(fuel)
             return (
                <Button
                    key={fuel}
                    variant="outline"
                    onClick={() => {
                        const newFuelTypes = isSelected
                            ? filters.fuelTypes.filter((f) => f !== fuel)
                            : [...filters.fuelTypes, fuel]
                        onChange('fuelTypes', newFuelTypes)
                    }}
                    className={cn(
                        "rounded-full h-9 px-4 text-xs font-bold transition-all border",
                        isSelected 
                            ? "bg-black text-white border-black hover:bg-zinc-800 hover:text-white" 
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                >
                    {fuel}
                </Button>
             )
          })}
        </div>
      </div>
      
    </div>
  )
}
