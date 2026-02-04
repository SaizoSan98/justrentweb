
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = []

  // Collect all active filters
  searchParams.getAll("category").forEach(v => filters.push({ key: "category", value: v, label: v }))
  searchParams.getAll("transmission").forEach(v => filters.push({ key: "transmission", value: v, label: v }))
  searchParams.getAll("fuelType").forEach(v => filters.push({ key: "fuelType", value: v, label: v }))
  searchParams.getAll("seats").forEach(v => filters.push({ key: "seats", value: v, label: `${v} Seats` }))
  if (searchParams.get("guaranteedModel") === "true") {
      filters.push({ key: "guaranteedModel", value: "true", label: "Guaranteed Model" })
  }

  if (filters.length === 0) return null

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (key === "guaranteedModel") {
        params.delete(key)
    } else {
        const values = params.getAll(key).filter(v => v !== value)
        params.delete(key)
        values.forEach(v => params.append(key, v))
    }
    
    router.push(`/fleet?${params.toString()}`, { scroll: false })
  }

  const clearAll = () => {
      router.push('/fleet', { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {filters.map((filter, idx) => (
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
      
      {filters.length > 0 && (
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
