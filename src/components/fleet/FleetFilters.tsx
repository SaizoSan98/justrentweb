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

  // Calculate dynamic count based on current selection
  // If availableCars is provided, we filter client-side. Otherwise fallback to server count.
  const matchingCount = availableCars ? availableCars.filter(car => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(car.category)
    const matchTransmission = selectedTransmissions.length === 0 || selectedTransmissions.includes(car.transmission)
    const matchFuel = selectedFuelTypes.length === 0 || selectedFuelTypes.includes(car.fuelType)
    const matchSeats = selectedSeats.length === 0 || selectedSeats.includes(car.seats.toString())
    const matchGuaranteed = !guaranteedModel || car.guaranteedModel

    return matchCategory && matchTransmission && matchFuel && matchSeats && matchGuaranteed
  }).length : (counts?.total || 0)

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
    <div className="w-full">
      <div className="flex items-center justify-between gap-4">
          
          {/* Left: Filters & Count */}
          <div className="flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 border-zinc-200 hover:border-zinc-300 bg-white">
                  <SlidersHorizontal className="w-4 h-4" />
                  {t('filters')}
                  {activeFiltersCount > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-[400px] p-0 flex flex-col h-full bg-white">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
                  <h2 className="text-xl font-black uppercase">{t('filters')}</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-red-600">
                    {tCommon('clear_all')}
                  </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Vehicle Type */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-zinc-500 tracking-wider">{t('category')}</h3>
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
                    <h3 className="font-bold text-sm uppercase text-zinc-500 tracking-wider">{t('features')}</h3>
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
                        <Check className="w-4 h-4" /> {t('guaranteed_model')}
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
                          <Gauge className="w-4 h-4" /> {t === 'AUTOMATIC' ? tCommon('automatic') : tCommon('manual')}
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
                          <Fuel className="w-4 h-4" /> {tCommon(f.toLowerCase())}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-zinc-500 tracking-wider">{t('seats')}</h3>
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
                          <Users className="w-4 h-4" /> {num} {t('seats')}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-zinc-100 bg-white">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-lg rounded-xl"
                    onClick={applyFilters}
                  >
                    Show {counts?.total || 0} offers
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="h-6 w-px bg-zinc-200"></div>

            <span className="text-zinc-500 text-sm font-medium">
              {counts?.total || 0} vehicles available
            </span>
          </div>

          {/* Right: Quick Toggles (Horizontal Scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 justify-end">
             {/* Only show categories as quick filters */}
             {categoriesList.slice(0, 4).map(cat => (
                <div 
                  key={cat}
                  className={cn(
                    "px-3 py-1.5 rounded-full cursor-pointer transition-all text-xs font-bold whitespace-nowrap border",
                    selectedCategories.includes(cat) 
                      ? "bg-zinc-900 text-white border-zinc-900" 
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                  )}
                  onClick={() => {
                    toggleSelection(selectedCategories, cat, setSelectedCategories)
                    // Auto apply for quick filters? Or wait? 
                    // Better to just toggle state here, but apply needs router push.
                    // For quick filters usually instant apply is expected.
                    // Let's implement instant apply for these specific clicks
                    const newCats = selectedCategories.includes(cat) 
                      ? selectedCategories.filter(c => c !== cat)
                      : [...selectedCategories, cat]
                    
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("category")
                    newCats.forEach(c => params.append("category", c))
                    router.push(`/fleet?${params.toString()}`)
                  }}
                >
                  {cat}
                </div>
              ))}
          </div>

      </div>
    </div>
  )
}
