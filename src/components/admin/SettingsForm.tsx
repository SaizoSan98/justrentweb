"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateSettings } from "@/app/admin/settings/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]

export function SettingsForm({ settings }: { settings: any }) {
  const [loading, setLoading] = useState(false)
  // Parse JSON if string, or use object, or default
  const initialHours = settings.weeklyHours 
    ? (typeof settings.weeklyHours === 'string' ? JSON.parse(settings.weeklyHours) : settings.weeklyHours)
    : {}

  const [hours, setHours] = useState<any>(initialHours)

  // Initialize default if empty
  const defaultDay = { open: "08:00", close: "18:00", isClosed: false }
  
  // Ensure all days exist
  const currentHours = { ...hours }
  DAYS.forEach(day => {
    if (!currentHours[day]) currentHours[day] = { ...defaultDay }
  })
  if (Object.keys(hours).length !== Object.keys(currentHours).length) {
      setHours(currentHours)
  }

  const handleChange = (day: string, field: string, value: any) => {
    setHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateSettings(hours)
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
       {DAYS.map(day => (
         <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
           <div className="w-32 font-medium text-zinc-700">{day}</div>
           <div className="flex items-center gap-2">
             <Switch 
               checked={!hours[day]?.isClosed}
               onCheckedChange={(checked) => handleChange(day, 'isClosed', !checked)}
             />
             <span className={`text-sm w-16 font-medium ${hours[day]?.isClosed ? "text-red-500" : "text-green-600"}`}>
               {hours[day]?.isClosed ? "Closed" : "Open"}
             </span>
           </div>
           
           {!hours[day]?.isClosed && (
             <div className="flex items-center gap-2">
               <Input 
                 type="time" 
                 value={hours[day]?.open} 
                 onChange={(e) => handleChange(day, 'open', e.target.value)}
                 className="w-32"
               />
               <span className="text-zinc-400">-</span>
               <Input 
                 type="time" 
                 value={hours[day]?.close} 
                 onChange={(e) => handleChange(day, 'close', e.target.value)}
                 className="w-32"
               />
             </div>
           )}
         </div>
       ))}
       
       <div className="pt-4">
        <Button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto bg-zinc-900 text-white hover:bg-zinc-800">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Business Hours
        </Button>
       </div>
    </div>
  )
}
