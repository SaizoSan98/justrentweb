
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, ChevronUp, ChevronDown } from "lucide-react"
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
  const seatsList = options?.seats || SEATS
  
  // State from URL
  const selectedCategories = searchParams.getAll("category")
  const selectedTransmissions = searchParams.getAll("transmission")
  const selectedFuelTypes = searchParams.getAll("fuelType")
  const selectedSeats = searchParams.getAll("seats")

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
      
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Price Range</h4>
        </div>
        <div className="space-y-3 pl-1">
            {[
                { label: "€0 - €50", val: "0-50" },
                { label: "€50 - €100", val: "50-100" },
                { label: "€100 - €150", val: "100-150" },
                { label: "€150 - €200", val: "150-200" },
                { label: "€200 +", val: "200-plus" },
            ].map((range) => (
                <div key={range.val} className="flex items-center space-x-3">
                    <Checkbox 
                        id={`price-${range.val}`} 
                        className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:text-white rounded-md w-5 h-5" 
                    />
                    <label htmlFor={`price-${range.val}`} className="text-sm text-zinc-600 font-medium leading-none cursor-pointer hover:text-black transition-colors">
                        {range.label}
                    </label>
                </div>
            ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* Vehicle Category */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Vehicle Category</h4>
        </div>
        <div className="space-y-3 pl-1">
          {categoriesList.map((category: string) => (
            <div key={category} className="flex items-center space-x-3 group">
              <Checkbox 
                id={category} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  const newCategories = checked 
                    ? [...selectedCategories, category]
                    : selectedCategories.filter((c) => c !== category)
                  updateFilters({ category: newCategories })
                }}
                className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:text-white rounded-md w-5 h-5"
              />
              <label
                htmlFor={category}
                className="text-sm text-zinc-600 font-medium leading-none cursor-pointer flex-1 flex justify-between group-hover:text-black transition-colors"
              >
                <span>{category}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* Transmission */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Gear Shift</h4>
        </div>
        <div className="space-y-3 pl-1">
          {transmissionsList.map((transmission: string) => (
            <div key={transmission} className="flex items-center space-x-3 group">
              <Checkbox 
                id={transmission} 
                checked={selectedTransmissions.includes(transmission)}
                onCheckedChange={(checked) => {
                  const newTransmissions = checked 
                    ? [...selectedTransmissions, transmission]
                    : selectedTransmissions.filter((t) => t !== transmission)
                  updateFilters({ transmission: newTransmissions })
                }}
                className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:text-white rounded-md w-5 h-5"
              />
              <label
                htmlFor={transmission}
                className="text-sm text-zinc-600 font-medium leading-none cursor-pointer hover:text-black transition-colors"
              >
                {transmission}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-100 w-full" />

      {/* Fuel Type */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-900">Fuel Type</h4>
        </div>
        <div className="space-y-3 pl-1">
          {fuelTypesList.map((fuel: string) => (
            <div key={fuel} className="flex items-center space-x-3 group">
              <Checkbox 
                id={fuel} 
                checked={selectedFuelTypes.includes(fuel)}
                onCheckedChange={(checked) => {
                  const newFuelTypes = checked 
                    ? [...selectedFuelTypes, fuel]
                    : selectedFuelTypes.filter((f) => f !== fuel)
                  updateFilters({ fuelType: newFuelTypes })
                }}
                className="border-zinc-300 data-[state=checked]:bg-black data-[state=checked]:text-white rounded-md w-5 h-5"
              />
              <label
                htmlFor={fuel}
                className="text-sm text-zinc-600 font-medium leading-none cursor-pointer hover:text-black transition-colors"
              >
                {fuel}
              </label>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}
