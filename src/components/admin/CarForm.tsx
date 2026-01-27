"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Upload, Loader2 } from "lucide-react"
import { createCar, updateCar } from "@/app/admin/actions"

interface PricingTier {
  id?: string
  minDays: number
  maxDays: number | null
  pricePerDay: number
  deposit: number
}

interface CarFormProps {
  car?: any // Replace with proper type
  isEditing?: boolean
}

export function CarForm({ car, isEditing = false }: CarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(
    car?.pricingTiers || []
  )
  const [imagePreview, setImagePreview] = useState<string | null>(car?.imageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddTier = () => {
    setPricingTiers([
      ...pricingTiers,
      { minDays: 1, maxDays: null, pricePerDay: 0, deposit: 0 }
    ])
  }

  const handleRemoveTier = (index: number) => {
    const newTiers = [...pricingTiers]
    newTiers.splice(index, 1)
    setPricingTiers(newTiers)
  }

  const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
    const newTiers = [...pricingTiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setPricingTiers(newTiers)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      // Append pricing tiers as JSON string
      formData.append('pricingTiers', JSON.stringify(pricingTiers))
      
      if (isEditing && car?.id) {
        formData.append('id', car.id)
        await updateCar(formData)
      } else {
        await createCar(formData)
      }
      
      router.push('/admin/cars')
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" name="make" defaultValue={car?.make} placeholder="e.g. BMW" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" defaultValue={car?.model} placeholder="e.g. X5" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" defaultValue={car?.year} placeholder="2024" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" name="licensePlate" defaultValue={car?.licensePlate} placeholder="ABC-123" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={car?.category || "SUV"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Luxury">Luxury</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input id="mileage" name="mileage" type="number" defaultValue={car?.mileage} placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Base Price Per Day (Ft)</Label>
              <Input id="pricePerDay" name="pricePerDay" type="number" defaultValue={car?.pricePerDay} placeholder="25000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Base Deposit (Kaució) (Ft)</Label>
              <Input id="deposit" name="deposit" type="number" defaultValue={car?.deposit} placeholder="500000" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Car Image</Label>
            <div className="flex items-center gap-4">
              <div 
                className="w-32 h-24 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-6 w-6 text-zinc-400" />
                )}
              </div>
              <div className="space-y-1">
                <Input 
                  ref={fileInputRef}
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Choose Image
                </Button>
                <p className="text-xs text-zinc-500">Supported formats: JPG, PNG, WebP</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Pricing Tiers (Optional)</h3>
                <p className="text-sm text-zinc-500">Set different prices based on rental duration (e.g. 7+ days)</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>
            
            {pricingTiers.length === 0 && (
              <div className="text-center py-6 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 text-zinc-500 text-sm">
                No custom pricing tiers configured. Base price will be used.
              </div>
            )}

            <div className="space-y-3">
              {pricingTiers.map((tier, index) => (
                <div key={index} className="flex gap-4 items-start bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                  <div className="grid grid-cols-4 gap-4 flex-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Min Days</Label>
                      <Input 
                        type="number" 
                        value={tier.minDays} 
                        onChange={(e) => handleTierChange(index, 'minDays', parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Days (Optional)</Label>
                      <Input 
                        type="number" 
                        value={tier.maxDays || ''} 
                        onChange={(e) => handleTierChange(index, 'maxDays', e.target.value ? parseInt(e.target.value) : null)}
                        className="h-8"
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price / Day</Label>
                      <Input 
                        type="number" 
                        value={tier.pricePerDay} 
                        onChange={(e) => handleTierChange(index, 'pricePerDay', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Deposit</Label>
                      <Input 
                        type="number" 
                        value={tier.deposit} 
                        onChange={(e) => handleTierChange(index, 'deposit', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="mt-6 text-zinc-400 hover:text-red-600"
                    onClick={() => handleRemoveTier(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-zinc-900 text-white hover:bg-zinc-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Car' : 'Create Car'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
