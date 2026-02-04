"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = ["SUV", "Sedan", "Luxury", "Convertible", "Van"]
const TRANSMISSIONS = ["AUTOMATIC", "MANUAL"]
const FUEL_TYPES = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]
const SEATS = [2, 4, 5, 7, 8, 9]

export function FleetFilters({ 
  currentFilters, 
  counts,
  options,
  availableCars,
  dictionary = {}
}: { 
  currentFilters?: any
  counts?: any
  options?: any
  availableCars?: any
  dictionary?: any
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoriesList = options?.categories || CATEGORIES
  const transmissionsList = options?.transmissions || TRANSMISSIONS
  const fuelTypesList = options?.fuelTypes || FUEL_TYPES
  
  // State from URL
  const selectedCategories = searchParams.getAll("category")
  const selectedTransmissions = searchParams.getAll("transmission")
  const selectedFuelTypes = searchParams.getAll("fuelType")

  // Update URL helper
  const updateFilters = (newFilters: any) => {
    const params = new URLSearchParams(searchParams.toString())
    
    const updateArrayParam = (key: string, values: string[] | undefined) => {
      params.delete(key)
      values?.forEach(v => params.append(key, v))
    }

    if ('category' in newFilters) updateArrayParam('category', newFilters.category)
    if ('transmission' in newFilters) updateArrayParam('transmission', newFilters.transmission)
    if ('fuelType' in newFilters) updateArrayParam('fuelType', newFilters.fuelType)
    if ('seats' in newFilters) updateArrayParam('seats', newFilters.seats)

    router.push(`/fleet?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-8 text-zinc-900 bg-white">
      
      {/* Vehicle Category */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Vehicle Category</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((category: string) => {
            const isSelected = selectedCategories.includes(category)
            return (
              <Button
                key={category}
                variant="outline"
                onClick={() => {
                  const newCategories = isSelected
                    ? selectedCategories.filter((c) => c !== category)
                    : [...selectedCategories, category]
                  updateFilters({ category: newCategories })
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
             const isSelected = selectedTransmissions.includes(transmission)
             return (
                <Button
                    key={transmission}
                    variant="outline"
                    onClick={() => {
                        const newTransmissions = isSelected
                            ? selectedTransmissions.filter((t) => t !== transmission)
                            : [...selectedTransmissions, transmission]
                        updateFilters({ transmission: newTransmissions })
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
             const isSelected = selectedFuelTypes.includes(fuel)
             return (
                <Button
                    key={fuel}
                    variant="outline"
                    onClick={() => {
                        const newFuelTypes = isSelected
                            ? selectedFuelTypes.filter((f) => f !== fuel)
                            : [...selectedFuelTypes, fuel]
                        updateFilters({ fuelType: newFuelTypes })
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
