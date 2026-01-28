"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Upload, Loader2, Car, Banknote, Tags, Image as ImageIcon } from "lucide-react"
import { createCar, updateCar } from "@/app/admin/actions"
import { CAR_MAKES, CAR_MODELS, CAR_FEATURES, FUEL_POLICIES } from "@/lib/car-data"

interface PricingTier {
  id?: string
  minDays: number
  maxDays: number | null
  pricePerDay: number
  deposit: number
}

interface CarFormProps {
  car?: any // Replace with proper type
  categories?: { id: string, name: string }[]
  isEditing?: boolean
}

export function CarForm({ car, categories = [], isEditing = false }: CarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  
  // Dependent fields state
  const [selectedMake, setSelectedMake] = useState<string>(car?.make || "")
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(car?.features || [])

  // Collections
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(
    car?.pricingTiers || []
  )
  const [imagePreview, setImagePreview] = useState<string | null>(car?.imageUrl || null)
  const [additionalImages, setAdditionalImages] = useState<string[]>(car?.images || [])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectedMake && CAR_MODELS[selectedMake]) {
      setAvailableModels(CAR_MODELS[selectedMake])
    } else {
      setAvailableModels([])
    }
  }, [selectedMake])

  const handleMakeChange = (value: string) => {
    setSelectedMake(value)
  }

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature))
    } else {
      setSelectedFeatures([...selectedFeatures, feature])
    }
  }

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
      // Append complex data
      formData.append('pricingTiers', JSON.stringify(pricingTiers))
      formData.append('features', JSON.stringify(selectedFeatures))
      // formData.append('images', JSON.stringify(additionalImages)) // For future
      
      // Ensure booleans are strings
      if (!formData.has('orSimilar')) formData.append('orSimilar', 'false')
      if (!formData.has('airConditioning')) formData.append('airConditioning', 'false')
      
      if (isEditing && car?.id) {
        formData.append('id', car.id)
        await updateCar(formData)
      } else {
        await createCar(formData)
      }
      
      // router.push('/admin/cars') // Handled by server action redirect usually, but safety here
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="gap-2"><Car className="w-4 h-4" /> General</TabsTrigger>
          <TabsTrigger value="prices" className="gap-2"><Banknote className="w-4 h-4" /> Prices</TabsTrigger>
          <TabsTrigger value="attributes" className="gap-2"><Tags className="w-4 h-4" /> Attributes</TabsTrigger>
          <TabsTrigger value="images" className="gap-2"><ImageIcon className="w-4 h-4" /> Images</TabsTrigger>
        </TabsList>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={car?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                      {categories.length === 0 && <SelectItem value="Other">Other</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Vehicle Make</Label>
                  <Select name="make" value={selectedMake} onValueChange={handleMakeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_MAKES.map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Vehicle Model</Label>
                  {availableModels.length > 0 ? (
                    <Select name="model" defaultValue={car?.model}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map(model => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input name="model" defaultValue={car?.model} placeholder="Type model manually" required />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input name="year" type="number" defaultValue={car?.year} placeholder="2024" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input name="licensePlate" defaultValue={car?.licensePlate} placeholder="ABC-123" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Current Mileage (km)</Label>
                  <Input name="mileage" type="number" defaultValue={car?.mileage} placeholder="0" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Number of Seats</Label>
                  <Select name="seats" defaultValue={car?.seats?.toString() || "5"}>
                    <SelectTrigger>
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 5, 7, 8, 9].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Seats</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doors">Number of Doors</Label>
                  <Select name="doors" defaultValue={car?.doors?.toString() || "5"}>
                    <SelectTrigger>
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Doors</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suitcases">Number of Suitcases</Label>
                  <Input name="suitcases" type="number" defaultValue={car?.suitcases || 2} placeholder="2" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">Gearbox</Label>
                  <Select name="transmission" defaultValue={car?.transmission || "MANUAL"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gearbox" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select name="fuelType" defaultValue={car?.fuelType || "PETROL"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PETROL">Petrol</SelectItem>
                      <SelectItem value="DIESEL">Diesel</SelectItem>
                      <SelectItem value="ELECTRIC">Electric</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 flex flex-col justify-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="orSimilar" name="orSimilar" defaultChecked={car?.orSimilar} />
                    <Label htmlFor="orSimilar">Show "Or Similar" label</Label>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">If enabled, customers see "or similar" next to model name.</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PRICES TAB --- */}
        <TabsContent value="prices">
          <Card>
            <CardContent className="p-6 space-y-8">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay">Base Rental Price / Day (EUR)</Label>
                  <Input name="pricePerDay" type="number" defaultValue={car?.pricePerDay} placeholder="60" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Security Deposit (EUR)</Label>
                  <Input name="deposit" type="number" defaultValue={car?.deposit} placeholder="500" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullInsurancePrice">Full Insurance Price / Day (EUR)</Label>
                  <Input name="fullInsurancePrice" type="number" defaultValue={car?.fullInsurancePrice || 0} placeholder="20" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                 <div className="space-y-2">
                  <Label htmlFor="pickupAfterHoursPrice">Pickup After Business Hours Price (EUR)</Label>
                  <Input name="pickupAfterHoursPrice" type="number" defaultValue={car?.pickupAfterHoursPrice || 0} placeholder="30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnAfterHoursPrice">Return After Business Hours Price (EUR)</Label>
                  <Input name="returnAfterHoursPrice" type="number" defaultValue={car?.returnAfterHoursPrice || 0} placeholder="30" />
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ATTRIBUTES TAB --- */}
        <TabsContent value="attributes">
          <Card>
            <CardContent className="p-6 space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dailyMileageLimit">Daily Mileage Limit (km)</Label>
                  <Input name="dailyMileageLimit" type="number" defaultValue={car?.dailyMileageLimit || ""} placeholder="Leave empty for Unlimited" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelPolicy">Fuel Policy</Label>
                  <Select name="fuelPolicy" defaultValue={car?.fuelPolicy || "FULL_TO_FULL"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_POLICIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch id="airConditioning" name="airConditioning" defaultChecked={car?.airConditioning !== false} />
                  <Label htmlFor="airConditioning">Air Conditioning</Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Car Features (Extras)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {CAR_FEATURES.map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`feat-${feature}`} 
                        checked={selectedFeatures.includes(feature)}
                        onCheckedChange={(checked: boolean) => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={`feat-${feature}`} className="font-normal cursor-pointer">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- IMAGES TAB --- */}
        <TabsContent value="images">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Main Car Image</Label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-48 h-32 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="h-8 w-8 text-zinc-400" />
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
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      Choose Main Image
                    </Button>
                    <p className="text-xs text-zinc-500">Supported formats: JPG, PNG, WebP</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 opacity-50 pointer-events-none">
                <Label>Additional Images (Coming Soon)</Label>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-video bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-zinc-300" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200 shadow-2xl z-50">
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
          className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[150px]"
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
    </form>
  )
}
