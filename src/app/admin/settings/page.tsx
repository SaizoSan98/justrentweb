import { getSettings, updateSettings } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">System Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="space-y-4 max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input 
                  id="openingTime" 
                  name="openingTime" 
                  type="time" 
                  defaultValue={settings.openingTime} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingTime">Closing Time</Label>
                <Input 
                  id="closingTime" 
                  name="closingTime" 
                  type="time" 
                  defaultValue={settings.closingTime} 
                  required 
                />
              </div>
            </div>
            <p className="text-sm text-zinc-500">
              These hours determine when "After Hours" fees are applied.
            </p>
            <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800">
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
