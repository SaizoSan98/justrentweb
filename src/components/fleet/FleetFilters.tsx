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
  options
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
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  // Quick filters state (outside sheet)
  const activeFiltersCount = 
    selectedCategories.length + 
    selectedTransmissions.length + 
    selectedFuelTypes.length + 
    selectedSeats.length + 
    (guaranteedModel ? 1 : 0)

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Reset all filter params
    params.delete("category")
    params.delete("transmission")
    params.delete("fuelType")
    params.delete("seats")
    params.delete("guaranteedModel")

    // Re-add selected
    selectedCategories.forEach(c => params.append("category", c))
    selectedTransmissions.forEach(t => params.append("transmission", t))
    selectedFuelTypes.forEach(f => params.append("fuelType", f))
    selectedSeats.forEach(s => params.append("seats", s))
    if (guaranteedModel) params.set("guaranteedModel", "true")

    router.push(`/fleet?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTransmissions([])
    setSelectedFuelTypes([])
    setSelectedSeats([])
    setGuaranteedModel(false)
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    params.delete("transmission")
    params.delete("fuelType")
    params.delete("seats")
    params.delete("guaranteedModel")
    router.push(`/fleet?${params.toString()}`)
  }

  const toggleSelection = (list: string[], item: string, setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else {
      setList([...list, item])
    }
  }

  return (
    <div className="w-full bg-white border-b border-zinc-200 sticky top-20 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900">
              Which car would you like to drive?
            </h1>
            <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm font-medium">
              {counts?.total || 0} vehicles available
            </span>
          </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Main Filter Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 rounded-full h-10 px-4 gap-2 shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[400px] p-0 flex flex-col h-full bg-white">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
                  <h2 className="text-xl font-black uppercase">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-red-600">
                    Clear all
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Vehicle Type */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-zinc-500 tracking-wider">Vehicle Type</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categoriesList.map(cat => (
                        <div 
                          key={cat}
                          className={cn(
                            "border-2 rounded-xl p-3 cursor-pointer transition-all text-center text-sm font-bold flex items-center justify-center gap-2",
                            selectedCategories.includes(cat) 
                              ? "border-zinc-900 bg-zinc-900 text-white" 
                              : "border-zinc-100 hover:border-zinc-300 text-zinc-700"
                          )}
                          onClick={() => toggleSelection(selectedCategories, cat, setSelectedCategories)}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-zinc-500 tracking-wider">Features</h3>
                    <div className="flex flex-wrap gap-3">
                       <div 
                        className={cn(
                          "border-2 rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2",
                          guaranteedModel
                            ? "border-zinc-900 bg-zinc-900 text-white" 
                            : "border-zinc-100 hover:border-zinc-300 text-zinc-700"
                        )}
                        onClick={() => setGuaranteedModel(!guaranteedModel)}
                      >
                        <Check className="w-4 h-4" /> Guaranteed Model
                      </div>
                      {transmissionsList.map(t => (
                        <div 
                          key={t}
                          className={cn(
                            "border-2 rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2",
                            selectedTransmissions.includes(t)
                              ? "border-zinc-900 bg-zinc-900 text-white" 
                              : "border-zinc-100 hover:border-zinc-300 text-zinc-700"
                          )}
                          onClick={() => toggleSelection(selectedTransmissions, t, setSelectedTransmissions)}
                        >
                          <Gauge className="w-4 h-4" /> {t === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
                        </div>
                      ))}
                       {fuelTypesList.map(f => (
                        <div 
                          key={f}
                          className={cn(
                            "border-2 rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2",
                            selectedFuelTypes.includes(f)
                              ? "border-zinc-900 bg-zinc-900 text-white" 
                              : "border-zinc-100 hover:border-zinc-300 text-zinc-700"
                          )}
                          onClick={() => toggleSelection(selectedFuelTypes, f, setSelectedFuelTypes)}
                        >
                          <Fuel className="w-4 h-4" /> {f.charAt(0) + f.slice(1).toLowerCase()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-zinc-500 tracking-wider">Seats</h3>
                    <div className="flex flex-wrap gap-3">
                      {seatsList.map(num => (
                        <div 
                          key={num}
                          className={cn(
                            "border-2 rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2",
                            selectedSeats.includes(num.toString()) 
                              ? "border-zinc-900 bg-zinc-900 text-white" 
                              : "border-zinc-100 hover:border-zinc-300 text-zinc-700"
                          )}
                          onClick={() => toggleSelection(selectedSeats, num.toString(), setSelectedSeats)}
                        >
                          <Users className="w-4 h-4" /> {num} Seats
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-zinc-100 bg-white">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-14 text-lg rounded-xl shadow-lg shadow-red-600/20"
                    onClick={applyFilters}
                  >
                    Show {counts?.total || 0} offers
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Quick Filters */}
            <div 
              className={cn(
                "border rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2 whitespace-nowrap",
                selectedTransmissions.includes("AUTOMATIC")
                  ? "border-zinc-900 bg-zinc-900 text-white" 
                  : "border-zinc-200 hover:border-zinc-900 bg-white text-zinc-700"
              )}
              onClick={() => {
                const newT = selectedTransmissions.includes("AUTOMATIC") ? [] : ["AUTOMATIC"]
                setSelectedTransmissions(newT)
                const params = new URLSearchParams(searchParams.toString())
                params.delete("transmission")
                if(newT.length) params.append("transmission", "AUTOMATIC")
                router.push(`/fleet?${params.toString()}`)
              }}
            >
              <Gauge className="w-4 h-4" /> Automatic
            </div>

            <div 
              className={cn(
                "border rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2 whitespace-nowrap",
                selectedFuelTypes.includes("HYBRID")
                  ? "border-zinc-900 bg-zinc-900 text-white" 
                  : "border-zinc-200 hover:border-zinc-900 bg-white text-zinc-700"
              )}
              onClick={() => {
                const newF = selectedFuelTypes.includes("HYBRID") ? [] : ["HYBRID"]
                setSelectedFuelTypes(newF)
                const params = new URLSearchParams(searchParams.toString())
                params.delete("fuelType")
                if(newF.length) params.append("fuelType", "HYBRID")
                router.push(`/fleet?${params.toString()}`)
              }}
            >
              <Fuel className="w-4 h-4" /> Hybrid
            </div>
             <div 
              className={cn(
                "border rounded-full px-4 py-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2 whitespace-nowrap",
                guaranteedModel
                  ? "border-zinc-900 bg-zinc-900 text-white" 
                  : "border-zinc-200 hover:border-zinc-900 bg-white text-zinc-700"
              )}
              onClick={() => {
                const newVal = !guaranteedModel
                setGuaranteedModel(newVal)
                const params = new URLSearchParams(searchParams.toString())
                if(newVal) params.set("guaranteedModel", "true")
                else params.delete("guaranteedModel")
                router.push(`/fleet?${params.toString()}`)
              }}
            >
              <Check className="w-4 h-4" /> Guaranteed Model
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
