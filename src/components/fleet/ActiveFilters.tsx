"use client"

import { X } from "lucide-react"

interface ActiveFiltersProps {
  filters: {
    categories: string[]
    transmissions: string[]
    fuelTypes: string[]
    seats: number[]
    guaranteedModel: boolean
    make: string
  }
  onChange: (key: any, value: any) => void
}

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const activeFilters = []

  // Collect all active filters
  filters.categories.forEach(v => activeFilters.push({ key: "categories", value: v, label: v }))
  filters.transmissions.forEach(v => activeFilters.push({ key: "transmissions", value: v, label: v }))
  filters.fuelTypes.forEach(v => activeFilters.push({ key: "fuelTypes", value: v, label: v }))
  filters.seats.forEach(v => activeFilters.push({ key: "seats", value: v, label: `${v} Seats` }))
  if (filters.guaranteedModel) {
      activeFilters.push({ key: "guaranteedModel", value: true, label: "Guaranteed Model" })
  }
  if (filters.make) {
      activeFilters.push({ key: "make", value: filters.make, label: `Search: ${filters.make}` })
  }

  if (activeFilters.length === 0) return null

  const removeFilter = (key: string, value: any) => {
    if (key === "guaranteedModel") {
        onChange("guaranteedModel", false)
    } else if (key === "make") {
        onChange("make", "")
    } else {
        // Array types
        // @ts-ignore
        const currentList = filters[key] as any[]
        const newList = currentList.filter(v => v !== value)
        onChange(key, newList)
    }
  }

  const clearAll = () => {
      onChange("categories", [])
      onChange("transmissions", [])
      onChange("fuelTypes", [])
      onChange("seats", [])
      onChange("guaranteedModel", false)
      onChange("make", "")
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {activeFilters.map((filter, idx) => (
        <div 
          key={`${filter.key}-${filter.value}-${idx}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-bold transition-colors"
        >
          <span>{filter.label}</span>
          <button 
            onClick={() => removeFilter(filter.key, filter.value)}
            className="hover:text-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      {activeFilters.length > 0 && (
          <button 
            onClick={clearAll}
            className="text-xs font-bold text-red-600 hover:text-red-700 ml-2"
          >
              Clear All
          </button>
      )}
    </div>
  )
}
