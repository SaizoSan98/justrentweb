"use client"

import * as React from "react"
import { format, addDays, setHours, setMinutes, startOfToday } from "date-fns"
import { Calendar as CalendarIcon, ArrowRight, X, ChevronRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FleetDatePickerProps {
  date: { from: Date | undefined; to: Date | undefined }
  setDate: (date: { from: Date | undefined; to: Date | undefined }) => void
  className?: string
  triggerClassName?: string
}

export function FleetDatePicker({ date, setDate, className, triggerClassName }: FleetDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  // Detect mobile
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Generate time options (every 30 mins)
  const timeOptions = React.useMemo(() => {
    const times = []
    for (let i = 0; i < 24; i++) {
      times.push(`${i.toString().padStart(2, '0')}:00`)
      times.push(`${i.toString().padStart(2, '0')}:30`)
    }
    return times
  }, [])

  const handleTimeChange = (type: 'from' | 'to', timeStr: string) => {
    if (!date[type]) return

    const [hours, minutes] = timeStr.split(':').map(Number)
    const newDate = setHours(setMinutes(date[type]!, minutes), hours)
    
    setDate({
      ...date,
      [type]: newDate
    })
  }

  const getTimeString = (d: Date | undefined) => {
    if (!d) return "10:00"
    return format(d, "HH:mm")
  }

  // Simplified select for time
  const TimeSelect = ({ type, value }: { type: 'from' | 'to', value: string }) => (
    <div className="relative">
      <select
        className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm font-bold rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
        value={value}
        onChange={(e) => handleTimeChange(type, e.target.value)}
      >
        {timeOptions.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <Clock className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
    </div>
  )

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Top Bar: Dates & Times */}
      <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-zinc-100 bg-white">
        {/* Pick Up */}
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pick Up</label>
          <div className="flex items-center gap-2">
             <div className={cn(
               "flex-1 h-10 px-3 flex items-center border rounded-lg bg-zinc-50 text-sm font-bold",
               date.from ? "border-zinc-200 text-zinc-900" : "border-red-200 text-red-500"
             )}>
                {date.from ? format(date.from, "MMM dd, yyyy") : "Select Date"}
             </div>
             <TimeSelect type="from" value={getTimeString(date.from)} />
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center justify-center pt-6">
            <ArrowRight className="w-4 h-4 text-zinc-300" />
        </div>

        {/* Return */}
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Return</label>
          <div className="flex items-center gap-2">
             <div className={cn(
               "flex-1 h-10 px-3 flex items-center border rounded-lg bg-zinc-50 text-sm font-bold",
               date.to ? "border-zinc-200 text-zinc-900" : "border-zinc-200 text-zinc-400"
             )}>
                {date.to ? format(date.to, "MMM dd, yyyy") : "Select Date"}
             </div>
             <TimeSelect type="to" value={getTimeString(date.to)} />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-0 md:p-4 flex-1 overflow-auto bg-white">
         <Calendar
            mode="range"
            defaultMonth={date.from || new Date()}
            selected={date}
            onSelect={setDate}
            numberOfMonths={isMobile ? 12 : 2}
            orientation={isMobile ? "vertical" : "horizontal"}
            className="w-full border-0"
            disabled={(d) => d < startOfToday()}
         />
      </div>

      {/* Footer (Mobile Only mostly) */}
      <div className="p-4 border-t border-zinc-100 bg-white md:hidden mt-auto">
         <Button 
            className="w-full bg-[#ff5f00] hover:bg-[#ff5f00]/90 text-white font-black h-12 rounded-xl uppercase tracking-wider"
            onClick={() => setIsOpen(false)}
         >
            Confirm Dates
         </Button>
      </div>
    </div>
  )

  // Trigger Button Design
  const TriggerButton = React.forwardRef<HTMLButtonElement, any>((props, ref) => (
    <Button
        ref={ref}
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className={cn(
            "w-full justify-start text-left font-bold text-white p-0 hover:bg-transparent hover:text-red-500 h-auto",
            !date.from && "text-muted-foreground",
            triggerClassName
        )}
        {...props}
    >
        {date?.from ? (
            date.to ? (
                <div className="flex flex-col items-start gap-0.5 w-full">
                    <span className="flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                        {format(date.from, "MMM dd")} 
                        <span className="text-zinc-400">|</span>
                        {format(date.to, "MMM dd")}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-2">
                        {format(date.from, "HH:mm")}
                        <ArrowRight className="w-3 h-3" />
                        {format(date.to, "HH:mm")}
                    </span>
                </div>
            ) : (
                format(date.from, "LLL dd, HH:mm")
            )
        ) : (
            <span>Pick dates</span>
        )}
    </Button>
  ))
  TriggerButton.displayName = "TriggerButton"

  if (isMobile) {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <TriggerButton />
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[95vh] p-0 rounded-t-[2rem] overflow-hidden bg-white">
                <SheetHeader className="px-6 py-4 border-b border-zinc-100 flex flex-row items-center justify-between">
                    <SheetTitle className="text-lg font-black text-zinc-900 uppercase tracking-tight">Select Dates</SheetTitle>
                    <SheetClose className="rounded-full bg-zinc-100 p-2 hover:bg-zinc-200 transition-colors">
                        <X className="w-4 h-4 text-zinc-900" />
                    </SheetClose>
                </SheetHeader>
                <Content />
            </SheetContent>
        </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
            <TriggerButton />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-zinc-100 shadow-2xl rounded-2xl overflow-hidden" align="start">
            <Content />
        </PopoverContent>
    </Popover>
  )
}
