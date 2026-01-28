"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { useState } from "react"

export function BookingFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState(searchParams.get("status") || "ALL")
  const [date, setDate] = useState(searchParams.get("date") || "")

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) params.set("search", search)
    else params.delete("search")

    if (status && status !== "ALL") params.set("status", status)
    else params.delete("status")

    if (date) params.set("date", date)
    else params.delete("date")

    router.push(`/admin/bookings?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch("")
    setStatus("ALL")
    setDate("")
    router.push("/admin/bookings")
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Name, Email, License Plate..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <div className="w-[180px] space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px] space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Start Date</label>
        <Input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pb-0.5">
        <Button onClick={handleSearch} className="bg-zinc-900 text-white">
          Filter
        </Button>
        <Button variant="outline" onClick={clearFilters} className="text-zinc-500 hover:text-red-600">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
