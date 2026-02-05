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

  return (
    <div className={cn("p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-zinc-200 w-full max-w-[320px] sm:max-w-fit mx-auto", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={prevMonth}
          className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
          type="button"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-600" />
        </button>
        <div className="font-bold text-base sm:text-lg text-zinc-900 capitalize">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button 
          onClick={nextMonth}
          className="p-1 hover:bg-zinc-100 rounded-full transition-colors"
          type="button"
        >
          <ChevronRight className="h-5 w-5 text-zinc-600" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-[10px] sm:text-sm font-bold text-zinc-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart)
          const selectedDay = isSelected(day)
          const inRange = isInRange(day)
          const isRangeStart = mode === "range" && (selected as DateRange)?.from && isSameDay(day, (selected as DateRange).from!)
          const isRangeEnd = mode === "range" && (selected as DateRange)?.to && isSameDay(day, (selected as DateRange).to!)
          const isDisabled = disabled ? disabled(day) : false
          
          let bgClass = "bg-transparent"
          let textClass = isCurrentMonth ? "text-zinc-900" : "text-zinc-300"
          
          if (isDisabled) {
            textClass = "text-zinc-200 cursor-not-allowed"
            bgClass = "hover:bg-transparent"
          } else if (selectedDay) {
            bgClass = "!bg-red-600 shadow-md shadow-red-600/20"
            textClass = "!text-white font-bold"
          } else if (inRange) {
            bgClass = "bg-red-50"
            textClass = "text-red-900"
          } else if (isToday(day) && !selectedDay) {
            bgClass = "bg-zinc-100"
            textClass = "text-zinc-900 font-bold"
          }

          // Rounding for range
          let roundedClass = "rounded-md"
          if (inRange && !isDisabled) {
            roundedClass = "rounded-none"
            if (isRangeStart) roundedClass = "rounded-l-md"
            if (isRangeEnd) roundedClass = "rounded-r-md"
          }

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && handleDayClick(day)}
              disabled={isDisabled}
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm transition-all hover:bg-zinc-100 mx-auto",
                bgClass,
                textClass,
                roundedClass,
                selectedDay && "hover:bg-red-700",
                isDisabled && "hover:bg-transparent opacity-50"
              )}
              type="button"
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
