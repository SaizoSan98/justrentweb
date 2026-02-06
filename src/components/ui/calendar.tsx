"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  format,
  isWithinInterval,
  isBefore,
  isAfter
} from "date-fns"
import { enUS } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

interface CalendarProps {
  className?: string
  mode?: "single" | "range"
  selected?: DateRange | Date
  onSelect?: (date: any) => void
  numberOfMonths?: number // Ignored in this simple custom implementation for now, defaults to 1 view
  defaultMonth?: Date
  disabled?: (date: Date) => boolean
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  defaultMonth,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date())

  // Helpers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  // Generate days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Selection Logic
  const handleDayClick = (day: Date) => {
    if (!onSelect) return

    if (mode === "single") {
      onSelect(day)
    } else if (mode === "range") {
      const range = selected as DateRange | undefined
      
      if (range?.from && range?.to) {
        // Reset if both selected
        onSelect({ from: day, to: undefined })
      } else if (range?.from) {
        // If clicking before start, reset start
        if (isBefore(day, range.from)) {
          onSelect({ from: day, to: undefined })
        } else {
          onSelect({ from: range.from, to: day })
        }
      } else {
        // Start selection
        onSelect({ from: day, to: undefined })
      }
    }
  }

  const isSelected = (day: Date) => {
    if (mode === "single") {
      return selected ? isSameDay(day as Date, selected as Date) : false
    } else {
      const range = selected as DateRange | undefined
      if (!range?.from) return false
      if (isSameDay(day, range.from)) return true
      if (range.to && isSameDay(day, range.to)) return true
      return false
    }
  }

  const isInRange = (day: Date) => {
    if (mode !== "range") return false
    const range = selected as DateRange | undefined
    if (range?.from && range?.to) {
      return isWithinInterval(day, { start: range.from, end: range.to })
    }
    return false
  }

  // Render
  return (
    <div className={cn("p-3 bg-white", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-semibold text-sm">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {weekDays.map((day) => (
          <div key={day} className="text-[0.8rem] font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, dayIdx) => {
          const isSelectedDay = isSelected(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isDayToday = isToday(day)
          const isDisabled = disabled ? disabled(day) : false
          const inRange = isInRange(day)

          return (
            <div key={day.toString()} className="relative p-0.5">
              <button
                onClick={() => !isDisabled && handleDayClick(day)}
                disabled={isDisabled}
                className={cn(
                  "h-8 w-8 text-sm p-0 font-normal rounded-full flex items-center justify-center transition-colors relative z-10",
                  !isCurrentMonth && "text-gray-300 opacity-50", 
                  isSelectedDay && "bg-red-600 text-white hover:bg-red-700 shadow-md",
                  !isSelectedDay && isDayToday && "bg-gray-100 text-zinc-900 font-bold",
                  !isSelectedDay && !isDayToday && isCurrentMonth && "hover:bg-gray-100 text-zinc-900",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                  inRange && !isSelectedDay && "bg-red-50 text-red-900 rounded-none w-full"
                )}
              >
                {format(day, "d")}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
