"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, format, startOfWeek, addWeeks, subWeeks } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [cars, setCars] = React.useState<Array<{id: string; make: string; model: string; licensePlate: string}>>([])
  const [selectedCarId, setSelectedCarId] = React.useState<string>("")
  const [availability, setAvailability] = React.useState<Array<{id: string; startDate: string; endDate: string; status: string}>>([])
  const [startDateInput, setStartDateInput] = React.useState<string>("")
  const [endDateInput, setEndDateInput] = React.useState<string>("")
  const [statusInput, setStatusInput] = React.useState<string>("AVAILABLE")
  const [saving, setSaving] = React.useState(false)
  
  React.useEffect(() => {
    ;(async () => {
      const res = await fetch("/api/cars")
      const data = await res.json()
      setCars(data)
      if (data?.length && !selectedCarId) {
        setSelectedCarId(data[0].id)
      }
    })()
  }, [selectedCarId])
  
  React.useEffect(() => {
    ;(async () => {
      if (!selectedCarId) return
      const res = await fetch(`/api/availability?carId=${selectedCarId}`)
      const data = await res.json()
      setAvailability(data)
    })()
  }, [selectedCarId])
  
  const saveAvailability = async () => {
    if (!selectedCarId || !startDateInput || !endDateInput) return
    setSaving(true)
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId: selectedCarId,
        startDate: `${startDateInput}T00:00:00`,
        endDate: `${endDateInput}T23:59:59`,
        status: statusInput,
      }),
    })
    setSaving(false)
    if (res.ok) {
      const refreshed = await fetch(`/api/availability?carId=${selectedCarId}`)
      setAvailability(await refreshed.json())
      setStartDateInput("")
      setEndDateInput("")
    }
  }
  
  // Availability is fetched from API

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i))

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))

  return (
    <Card className="w-full h-full border-zinc-800 bg-zinc-900 text-zinc-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">Booking Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevWeek} className="border-zinc-700 hover:bg-zinc-800">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium min-w-[140px] text-center">
            {format(startDate, "MMM d")} - {format(addDays(startDate, 6), "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={nextWeek} className="border-zinc-700 hover:bg-zinc-800">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Admin Availability Form */}
        <div className="mb-6 p-4 border border-zinc-800 rounded-lg bg-zinc-950">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Car</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
              >
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>{c.make} {c.model} ({c.licensePlate})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Start</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
                value={startDateInput}
                onChange={(e) => setStartDateInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">End</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
                min={startDateInput || undefined}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 font-bold uppercase mb-2 block">Status</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <Button onClick={saveAvailability} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={saving || !selectedCarId || !startDateInput || !endDateInput}>
              {saving ? "Saving..." : "Save Availability"}
            </Button>
          </div>
          <div className="mt-4 text-xs text-zinc-400">
            Entries: {availability.length}
          </div>
        </div>

        <div className="grid grid-cols-8 gap-px bg-zinc-800 rounded-lg overflow-hidden border border-zinc-800">
          {/* Header Row */}
          <div className="bg-zinc-950 p-4 text-sm font-medium text-zinc-400">Car / Date</div>
          {weekDays.map((day) => (
            <div key={day.toString()} className="bg-zinc-950 p-4 text-center text-sm font-medium border-l border-zinc-800">
              <div className="text-zinc-500 text-xs uppercase">{format(day, "EEE")}</div>
              <div className={cn("mt-1 font-bold", format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") && "text-orange-500")}>
                {format(day, "d")}
              </div>
            </div>
          ))}

          {/* Rows for Cars */}
          {cars.map((car) => (
            <React.Fragment key={car.id}>
              <div className="bg-zinc-900 p-4 text-sm font-medium border-t border-zinc-800 flex items-center">
                {car.make} {car.model}
              </div>
              {weekDays.map((day) => {
                 const booking = availability.find(b => day >= new Date(b.startDate) && day <= new Date(b.endDate));
                 const cellClass = "bg-zinc-900 border-t border-l border-zinc-800 h-16 relative group hover:bg-zinc-800/50 transition-colors";
                 
                 return (
                  <div key={`${car.id}-${day}`} className={cellClass}>
                     {booking && (
                       <div className={cn(
                         "absolute inset-1 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm",
                         booking.status === "RENTED" && "bg-green-600/80",
                         booking.status === "AVAILABLE" && "bg-orange-500/80",
                         booking.status === "MAINTENANCE" && "bg-red-600/80",
                         booking.status === "OUT_OF_SERVICE" && "bg-zinc-600/80"
                       )}>
                         {booking.status}
                       </div>
                     )}
                  </div>
                 )
              })}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
