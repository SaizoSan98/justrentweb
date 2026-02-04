
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateInsurancePlan } from "./actions"

export const dynamic = 'force-dynamic'

export default async function InsurancesPage() {
  const plans = await prisma.insurancePlan.findMany({
    orderBy: { order: 'asc' },
    where: {
      name: {
        not: 'Basic'
      }
    }
  })

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Insurance Plans</h1>
        <p className="text-zinc-500">Manage global insurance descriptions.</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {plans.map((plan) => (
          <Card key={plan.id} className="bg-white border-zinc-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-zinc-900 flex items-center justify-between">
                {plan.name}
                {plan.isDefault && <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-500 font-normal">Default</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateInsurancePlan.bind(null, plan.id)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`desc-${plan.id}`} className="text-zinc-500">Description (displayed to user)</Label>
                  <Textarea 
                    id={`desc-${plan.id}`} 
                    name="description" 
                    defaultValue={plan.description || ""} 
                    className="bg-zinc-50 border-zinc-200 text-zinc-900 min-h-[100px] focus:ring-red-600 focus:border-red-600"
                    placeholder="e.g. Includes CDW, TP, and Windshield coverage."
                  />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" className="bg-red-600 text-white hover:bg-red-700">
                        Save Changes
                    </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
        
        {plans.length === 0 && (
            <div className="text-zinc-500">No insurance plans found. Please run the seed script.</div>
        )}
      </div>
    </div>
  )
}
