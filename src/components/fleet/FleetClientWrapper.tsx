"use client"

import { useState, useMemo, useEffect } from "react"
import { FleetFilters } from "./FleetFilters"
import { ActiveFilters } from "./ActiveFilters"
import { FleetCard } from "./FleetCard"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FleetClientWrapperProps {
  cars: any[]
  dictionary: any
  options: {
    categories: string[]
    transmissions: string[]
    fuelTypes: string[]
    seats: number[]
  }
}

export function FleetClientWrapper({ cars, dictionary, options }: FleetClientWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL
  const [filters, setFilters] = useState({
    categories: searchParams.getAll("category"),
    transmissions: searchParams.getAll("transmission"),
    fuelTypes: searchParams.getAll("fuelType"),
    seats: searchParams.getAll("seats").map(Number),
    guaranteedModel: searchParams.get("guaranteedModel") === "true",
    make: searchParams.get("make") || ""
  })

  const [showFilters, setShowFilters] = useState(false)

  // Sync state with URL when URL changes (e.g. back button)
  useEffect(() => {
    setFilters({
      categories: searchParams.getAll("category"),
      transmissions: searchParams.getAll("transmission"),
      fuelTypes: searchParams.getAll("fuelType"),
      seats: searchParams.getAll("seats").map(Number),
      guaranteedModel: searchParams.get("guaranteedModel") === "true",
      make: searchParams.get("make") || ""
    })
  }, [searchParams])

  // Update URL when filters change (without triggering server navigation if possible, 
  // but Next.js router.push/replace triggers it. 
  // To avoid server load/delay, we rely on client-side filtering visually, 
  // and update URL for shareability.
  const updateUrl = (newFilters: typeof filters) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Clear existing
    params.delete("category")
    params.delete("transmission")
    params.delete("fuelType")
    params.delete("seats")
    params.delete("guaranteedModel")
    params.delete("make")

    // Append new
    newFilters.categories.forEach(c => params.append("category", c))
    newFilters.transmissions.forEach(t => params.append("transmission", t))
    newFilters.fuelTypes.forEach(f => params.append("fuelType", f))
    newFilters.seats.forEach(s => params.append("seats", s.toString()))
    if (newFilters.guaranteedModel) params.set("guaranteedModel", "true")
    if (newFilters.make) params.set("make", newFilters.make)

    // Use replace to update URL without adding to history stack for every click, 
    // or push if we want history. Let's use replace for filters usually, or push.
    // scroll: false is key.
    // We update the URL so if user refreshes, they get the same state.
    // Note: This WILL trigger a server request in Next.js App Router (RSC refresh).
    // But since we are filtering on client side, the UI will update immediately via state.
    // The server response will eventually come and ideally match the client state.
    // To make it truly instant and avoid flicker, we rely on the local `filteredCars`.
    router.replace(`/fleet?${params.toString()}`, { scroll: false })
  }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateUrl(newFilters)
  }

  const handleClearAll = () => {
    const newFilters = {
        categories: [],
        transmissions: [],
        fuelTypes: [],
        seats: [],
        guaranteedModel: false,
        make: ""
    }
    setFilters(newFilters)
    updateUrl(newFilters)
  }

  // Filter Logic
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      // Category
      if (filters.categories.length > 0) {
        const carCats = car.categories.map((c: any) => c.name)
        if (!filters.categories.some(c => carCats.includes(c))) return false
      }

      // Transmission
      if (filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) return false

      // Fuel Type
      if (filters.fuelTypes.length > 0 && !filters.fuelTypes.includes(car.fuelType)) return false

      // Seats
      if (filters.seats.length > 0 && !filters.seats.includes(car.seats)) return false

      // Guaranteed Model
      if (filters.guaranteedModel && car.orSimilar) return false

      // Make (Generic Search)
      if (filters.make) {
        const searchTerm = filters.make.toLowerCase()
        const carName = `${car.make} ${car.model}`.toLowerCase()
        const renteonId = car.renteonId?.toString().toLowerCase() || ""
        const internalId = car.id.toLowerCase()
        
        if (!carName.includes(searchTerm) && 
            !renteonId.includes(searchTerm) && 
            !internalId.includes(searchTerm)) {
            return false
        }
      }

      return true
    })
  }, [cars, filters])

  return (
    <div className="flex flex-col gap-8">
      
      {/* Top Controls: Result Count & Filter Toggle */}
      <div className="flex items-center justify-between gap-4">
           <h2 className="text-xl font-bold text-zinc-900">
              Available Vehicles <span className="text-zinc-400 text-sm ml-2">({filteredCars.filter(c => c.isAvailable !== false).length})</span>
           </h2>
           
           <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="gap-2 border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-all rounded-full h-9 px-4 text-xs font-bold uppercase tracking-wider"
           >
               <SlidersHorizontal className="w-3.5 h-3.5" />
               {showFilters ? 'Hide Filters' : 'Filters'}
           </Button>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="py-4">
                    <FleetFilters 
                        filters={filters} 
                        onChange={handleFilterChange} 
                        options={options}
                        dictionary={dictionary}
                    />
                </div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active Filters Summary */}
      <ActiveFilters 
          filters={filters} 
          onChange={handleFilterChange} 
          onClearAll={handleClearAll}
      />

      {/* Main Grid */}
      <div className="flex-1">
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                  <FleetCard 
                    key={car.id}
                    car={car} 
                    dictionary={dictionary}
                    searchParams={Object.fromEntries(searchParams.entries())}
                  />
              ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-zinc-50 rounded-3xl border border-zinc-100">
             <div className="mb-4 text-4xl">🔍</div>
             <h3 className="text-xl font-bold text-zinc-900 mb-2">No vehicles found</h3>
             <p className="text-zinc-500">Try adjusting your filters to see more results.</p>
             <button 
                onClick={handleClearAll}
                className="mt-6 text-red-600 font-bold hover:underline"
             >
                Clear all filters
             </button>
          </div>
        )}
      </div>
    </div>
  )
}
