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
  const seatsList = options?.seats || [2, 4, 5, 7, 9]
  
  return (
    <div className="space-y-4 text-zinc-900 bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Category */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-500">Vehicle Category</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                      "rounded-full h-7 px-3 text-[11px] font-bold transition-all border",
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

          {/* Transmission */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-500">Gear Shift</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                            "rounded-full h-7 px-3 text-[11px] font-bold transition-all border",
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
      </div>

      <div className="h-px bg-zinc-200/50 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fuel Type */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-500">Fuel Type</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                            "rounded-full h-7 px-3 text-[11px] font-bold transition-all border",
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

          {/* Seats & Options */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-zinc-500">Seats & Options</h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {seatsList.map((seat: number) => {
                 const isSelected = filters.seats.includes(seat)
                 return (
                    <Button
                        key={seat}
                        variant="outline"
                        onClick={() => {
                            const newSeats = isSelected
                                ? filters.seats.filter((s) => s !== seat)
                                : [...filters.seats, seat]
                            onChange('seats', newSeats)
                        }}
                        className={cn(
                            "rounded-full h-7 px-3 text-[11px] font-bold transition-all border",
                            isSelected 
                                ? "bg-black text-white border-black hover:bg-zinc-800 hover:text-white" 
                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                        )}
                    >
                        {seat} Seats
                    </Button>
                 )
              })}
              
              {/* Guaranteed Model integrated here to save space */}
              <Button
                  variant="outline"
                  onClick={() => onChange('guaranteedModel', !filters.guaranteedModel)}
                  className={cn(
                      "rounded-full h-7 px-3 text-[11px] font-bold transition-all border",
                      filters.guaranteedModel 
                          ? "bg-black text-white border-black hover:bg-zinc-800 hover:text-white" 
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
              >
                  Guaranteed Model
              </Button>
            </div>
          </div>
      </div>
      
    </div>
  )
}
