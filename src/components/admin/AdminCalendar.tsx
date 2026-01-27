"use client"

import * as React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { addDays, format, startOfWeek, addWeeks, subWeeks } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  
  // Mock data for bookings
  const bookings = [
    { id: 1, car: "BMW X5", start: addDays(new Date(), 1), end: addDays(new Date(), 3), status: "confirmed" },
    { id: 2, car: "Mercedes C-Class", start: addDays(new Date(), 2), end: addDays(new Date(), 5), status: "pending" },
    { id: 3, car: "Audi A5", start: addDays(new Date(), 0), end: addDays(new Date(), 2), status: "maintenance" },
  ]

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
          {["BMW X5", "Mercedes C-Class", "Audi A5", "Tesla Model 3"].map((car) => (
            <React.Fragment key={car}>
              <div className="bg-zinc-900 p-4 text-sm font-medium border-t border-zinc-800 flex items-center">
                {car}
              </div>
              {weekDays.map((day) => {
                 const booking = bookings.find(b => b.car === car && day >= b.start && day <= b.end);
                 let cellClass = "bg-zinc-900 border-t border-l border-zinc-800 h-16 relative group hover:bg-zinc-800/50 transition-colors";
                 
                 return (
                  <div key={`${car}-${day}`} className={cellClass}>
                     {booking && (
                       <div className={cn(
                         "absolute inset-1 rounded flex items-center justify-center text-xs font-bold text-white shadow-sm",
                         booking.status === "confirmed" && "bg-green-600/80",
                         booking.status === "pending" && "bg-orange-500/80",
                         booking.status === "maintenance" && "bg-red-600/80"
                       )}>
                         {booking.status === "confirmed" && "Booked"}
                         {booking.status === "pending" && "Pending"}
                         {booking.status === "maintenance" && "Service"}
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
