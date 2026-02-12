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
  numberOfMonths?: number
  orientation?: "horizontal" | "vertical"
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
  numberOfMonths = 1,
  orientation = "horizontal"
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date())

  // Helpers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const months = React.useMemo(() => {
     return Array.from({ length: numberOfMonths }).map((_, i) => addMonths(currentMonth, i))
  }, [currentMonth, numberOfMonths])

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
    <div className={cn(
        "bg-white p-4", 
        orientation === "horizontal" ? "flex flex-row gap-8 overflow-x-auto" : "flex flex-col gap-8",
        className
    )}>
      {months.map((month, monthIndex) => {
          const monthStart = startOfMonth(month)
          const monthEnd = endOfMonth(monthStart)
          const startDate = startOfWeek(monthStart)
          const endDate = endOfWeek(monthEnd)
        
          const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
          })

          return (
              <div key={month.toString()} className="w-[320px] shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    {/* Prev Button: Only on first month */}
                    <div className="w-8">
                        {monthIndex === 0 && (
                            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="font-semibold text-sm">
                        {format(month, "MMMM yyyy")}
                    </div>

                    {/* Next Button: Only on last month (for horizontal) or just allow navigating from top? 
                        Let's put Next button on the last month for horizontal.
                        For vertical (mobile), we usually just scroll.
                    */}
                    <div className="w-8 flex justify-end">
                        {(orientation === "horizontal" ? monthIndex === numberOfMonths - 1 : monthIndex === 0) && (
                            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-2 text-center">
                    {weekDays.map((day) => (
                    <div key={day} className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {day}
                    </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-2 text-center">
                    {calendarDays.map((day, dayIdx) => {
                    const isSelectedDay = isSelected(day)
                    const isCurrentMonth = isSameMonth(day, month)
                    const isDayToday = isToday(day)
                    const isDisabled = disabled ? disabled(day) : false
                    const inRange = isInRange(day)

                    return (
                        <div key={day.toString()} className="relative p-0.5 w-full flex justify-center">
                        <button
                            onClick={() => !isDisabled && handleDayClick(day)}
                            disabled={isDisabled}
                            className={cn(
                            "h-9 w-9 text-base p-0 font-bold rounded-full flex items-center justify-center transition-all relative z-10",
                            !isCurrentMonth && "text-gray-300 opacity-50", 
                            isSelectedDay && "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md scale-110", 
                            !isSelectedDay && isDayToday && "bg-zinc-100 text-zinc-900 font-black",
                            !isSelectedDay && !isDayToday && isCurrentMonth && "hover:bg-zinc-100 text-zinc-900",
                            isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                            inRange && !isSelectedDay && "bg-zinc-100 text-zinc-900 rounded-none w-full"
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
      })}
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
