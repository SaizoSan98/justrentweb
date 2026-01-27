"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Generate times every 30 mins
  const times = React.useMemo(() => {
    return Array.from({ length: 24 * 2 }).map((_, i) => {
      const h = Math.floor(i / 2)
      const m = i % 2 === 0 ? "00" : "30"
      return `${h.toString().padStart(2, '0')}:${m}`
    })
  }, [])

  return (
    <div className="w-24">
      {label && (
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 block">
          {label}
        </label>
      )}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-14 bg-white border-zinc-200 hover:bg-zinc-50 hover:border-red-600 rounded-xl text-lg font-bold text-zinc-900 justify-start pl-3 relative",
              isOpen && "border-red-600 ring-2 ring-red-600/10"
            )}
          >
            {value}
            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-0" align="start">
          <ScrollArea className="h-72 bg-white rounded-xl border border-zinc-100 shadow-xl">
            <div className="p-1 space-y-1">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    onChange(time)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm font-bold rounded-lg transition-colors",
                    value === time 
                      ? "bg-red-600 text-white" 
                      : "text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
