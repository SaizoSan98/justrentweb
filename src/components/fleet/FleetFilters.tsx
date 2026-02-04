
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SlidersHorizontal, Users, Gauge, Fuel, Check } from "lucide-react"
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
  currentFilters?: {
    category?: string[]
    transmission?: string[]
    fuelType?: string[]
    seats?: string[]
    guaranteedModel?: boolean
  }
  counts?: {
    total: number
  }
  options?: {
    categories: string[]
    transmissions: string[]
    fuelTypes: string[]
    seats: number[]
  }
  availableCars?: {
    category: string
    transmission: string
    fuelType: string
    seats: number
    guaranteedModel: boolean
  }[]
  dictionary?: any
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const t = (key: string, section: string = "fleet") => dictionary?.[section]?.[key] || key
  const tCommon = (key: string) => dictionary?.common?.[key?.toLowerCase()] || key

  // Use props or fallbacks (though props should be provided)
  const categoriesList = options?.categories || CATEGORIES
  const transmissionsList = options?.transmissions || TRANSMISSIONS
  const fuelTypesList = options?.fuelTypes || FUEL_TYPES
  const seatsList = options?.seats || SEATS
  
  // State from URL
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.getAll("category")
  )
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(
    searchParams.getAll("transmission")
  )
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(
    searchParams.getAll("fuelType")
  )
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    searchParams.getAll("seats")
  )
  const [guaranteedModel, setGuaranteedModel] = useState(
    searchParams.get("guaranteedModel") === "true"
  )

  const [isOpen, setIsOpen] = useState(false)

  // Update URL helper
  const updateFilters = (newFilters: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Helper to update array params
    const updateArrayParam = (key: string, values: string[] | undefined) => {
      params.delete(key)
      values?.forEach(v => params.append(key, v))
    }

    if ('category' in newFilters) updateArrayParam('category', newFilters.category)
    if ('transmission' in newFilters) updateArrayParam('transmission', newFilters.transmission)
    if ('fuelType' in newFilters) updateArrayParam('fuelType', newFilters.fuelType)
    if ('seats' in newFilters) updateArrayParam('seats', newFilters.seats)
    if ('guaranteedModel' in newFilters) {
        if (newFilters.guaranteedModel) params.set('guaranteedModel', 'true')
        else params.delete('guaranteedModel')
    }

    router.push(`/fleet?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={cn("space-y-8 text-white", isOpen ? "block" : "hidden md:block")}>
      <div className="flex items-center justify-between md:hidden mb-4">
        <h2 className="text-xl font-bold">Filters</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <Check className="w-5 h-5" />
        </Button>
      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-2xl font-black text-white">Filter</h3>
        <button onClick={() => {
            setSelectedCategories([])
            setSelectedTransmissions([])
            setSelectedFuelTypes([])
            setSelectedSeats([])
            setGuaranteedModel(false)
            router.push('/fleet')
        }} className="text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-wider">
            Clear All Filters
        </button>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between cursor-pointer group">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-300 group-hover:text-white">Price Range</h4>
            <div className="text-zinc-500 group-hover:text-white">^</div>
        </div>
        <div className="space-y-2 pl-2">
            {[
                { label: "€0 - €50", val: "0-50" },
                { label: "€50 - €100", val: "50-100" },
                { label: "€100 - €150", val: "100-150" },
                { label: "€150 - €200", val: "150-200" },
                { label: "€200 +", val: "200-plus" },
            ].map((range) => (
                <div key={range.val} className="flex items-center space-x-3">
                    <Checkbox id={`price-${range.val}`} className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                    <label htmlFor={`price-${range.val}`} className="text-sm text-zinc-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-white transition-colors">
                        {range.label}
                    </label>
                </div>
            ))}
        </div>
      </div>

      {/* Vehicle Category */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
         <div className="flex items-center justify-between cursor-pointer group">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-300 group-hover:text-white">Vehicle Category</h4>
            <div className="text-zinc-500 group-hover:text-white">^</div>
        </div>
        <div className="space-y-2 pl-2">
          {categoriesList.map((category) => (
            <div key={category} className="flex items-center space-x-3 group">
              <Checkbox 
                id={category} 
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  const newCategories = checked 
                    ? [...selectedCategories, category]
                    : selectedCategories.filter((c) => c !== category)
                  setSelectedCategories(newCategories)
                  updateFilters({ category: newCategories })
                }}
                className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <label
                htmlFor={category}
                className="text-sm text-zinc-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex justify-between group-hover:text-white transition-colors"
              >
                <span>{category}</span>
                {/* <span className="text-zinc-600 text-xs">(12)</span> */}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Transmission - Renamed to Gear Shift */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
         <div className="flex items-center justify-between cursor-pointer group">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-300 group-hover:text-white">Gear Shift</h4>
            <div className="text-zinc-500 group-hover:text-white">^</div>
        </div>
        <div className="space-y-2 pl-2">
          {transmissionsList.map((transmission) => (
            <div key={transmission} className="flex items-center space-x-3">
              <Checkbox 
                id={transmission} 
                checked={selectedTransmissions.includes(transmission)}
                onCheckedChange={(checked) => {
                  const newTransmissions = checked 
                    ? [...selectedTransmissions, transmission]
                    : selectedTransmissions.filter((t) => t !== transmission)
                  setSelectedTransmissions(newTransmissions)
                  updateFilters({ transmission: newTransmissions })
                }}
                className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <label
                htmlFor={transmission}
                className="text-sm text-zinc-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-white transition-colors"
              >
                {transmission}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div className="space-y-4 pt-4 border-t border-zinc-800">
         <div className="flex items-center justify-between cursor-pointer group">
            <h4 className="font-bold text-sm uppercase tracking-wider text-zinc-300 group-hover:text-white">Fuel Type</h4>
            <div className="text-zinc-500 group-hover:text-white">^</div>
        </div>
        <div className="space-y-2 pl-2">
          {fuelTypesList.map((fuel) => (
            <div key={fuel} className="flex items-center space-x-3">
              <Checkbox 
                id={fuel} 
                checked={selectedFuelTypes.includes(fuel)}
                onCheckedChange={(checked) => {
                  const newFuelTypes = checked 
                    ? [...selectedFuelTypes, fuel]
                    : selectedFuelTypes.filter((f) => f !== fuel)
                  setSelectedFuelTypes(newFuelTypes)
                  updateFilters({ fuelType: newFuelTypes })
                }}
                className="border-zinc-700 data-[state=checked]:bg-white data-[state=checked]:text-black"
              />
              <label
                htmlFor={fuel}
                className="text-sm text-zinc-400 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer hover:text-white transition-colors"
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
