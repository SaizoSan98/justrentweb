"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Upload, Loader2, Car, Banknote, Tags, Image as ImageIcon, Shield } from "lucide-react"
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
  insurancePlans?: any[]
  isEditing?: boolean
  translations?: any[]
}

import { toast } from "sonner"

export function CarForm({ car, categories = [], insurancePlans = [], isEditing = false, translations = [] }: CarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  
  // Dependent fields state
  const [selectedMake, setSelectedMake] = useState<string>(car?.make || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    car?.categories?.map((c: any) => c.name) || []
  )
  const [selectedModel, setSelectedModel] = useState<string>(car?.model || "")
  const [selectedSeats, setSelectedSeats] = useState<string>(car?.seats?.toString() || "")
  const [selectedDoors, setSelectedDoors] = useState<string>(car?.doors?.toString() || "")
  const [selectedTransmission, setSelectedTransmission] = useState<string>(car?.transmission || "")
  const [selectedFuelType, setSelectedFuelType] = useState<string>(car?.fuelType || "")
  const [selectedFuelPolicy, setSelectedFuelPolicy] = useState<string>(car?.fuelPolicy || "FULL_TO_FULL")
  const [orSimilar, setOrSimilar] = useState<boolean>(car?.orSimilar || false)
  const [description, setDescription] = useState<string>(car?.description || "")
  const [descriptionHe, setDescriptionHe] = useState<string>(translations?.find((t: any) => t.field === 'description' && t.language === 'he')?.value || "")
  const [airConditioning, setAirConditioning] = useState<boolean>(car?.airConditioning !== false) // default true if undefined? Schema says default true.
  
  // Controlled Inputs State
  const [year, setYear] = useState<string>(car?.year?.toString() || "")
  const [licensePlate, setLicensePlate] = useState<string>(car?.licensePlate || "")
  const [mileage, setMileage] = useState<string>(car?.mileage?.toString() || "")
  const [suitcases, setSuitcases] = useState<string>(car?.suitcases?.toString() || "")
  const [pricePerDay, setPricePerDay] = useState<string>(car?.pricePerDay?.toString() || "")
  const [deposit, setDeposit] = useState<string>(car?.deposit?.toString() || "")
  const [fullInsurancePrice, setFullInsurancePrice] = useState<string>(car?.fullInsurancePrice?.toString() || "")
  const [pickupAfterHoursPrice, setPickupAfterHoursPrice] = useState<string>(car?.pickupAfterHoursPrice?.toString() || "")
  const [returnAfterHoursPrice, setReturnAfterHoursPrice] = useState<string>(car?.returnAfterHoursPrice?.toString() || "")
  const [extraKmPrice, setExtraKmPrice] = useState<string>(car?.extraKmPrice?.toString() || "")
  const [unlimitedMileagePrice, setUnlimitedMileagePrice] = useState<string>(car?.unlimitedMileagePrice?.toString() || "")
  const [dailyMileageLimit, setDailyMileageLimit] = useState<string>(car?.dailyMileageLimit?.toString() || "")
  
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(car?.features || [])

  // Collections
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(
    car?.pricingTiers || []
  )
  const [imagePreview, setImagePreview] = useState<string | null>(car?.imageUrl || null)
  const [additionalImages, setAdditionalImages] = useState<string[]>(car?.images || [])
  
  // Insurance Plans State
  const [insuranceValues, setInsuranceValues] = useState<Record<string, { price: string, deposit: string }>>({})

  useEffect(() => {
    if (car?.insuranceOptions) {
      const initial: Record<string, { price: string, deposit: string }> = {}
      car.insuranceOptions.forEach((opt: any) => {
        initial[opt.planId] = { 
            price: opt.pricePerDay?.toString() || "0", 
            deposit: opt.deposit?.toString() || "0" 
        }
      })
      setInsuranceValues(initial)
    } else if (insurancePlans.length > 0 && !isEditing) {
        // Initialize with defaults if new car? Maybe not needed, fields can be empty/0
        // But helpful to prepopulate keys
        const initial: Record<string, { price: string, deposit: string }> = {}
        insurancePlans.forEach((plan: any) => {
             initial[plan.id] = { price: "0", deposit: "0" }
        })
        setInsuranceValues(initial)
    }
  }, [car, insurancePlans, isEditing])

  const handleInsuranceChange = (planId: string, field: 'price' | 'deposit', value: string) => {
    setInsuranceValues(prev => ({
        ...prev,
        [planId]: {
            ...prev[planId],
            [field]: value
        }
    }))
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

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

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault() // Stop any default behavior
    e.stopPropagation()

    if (!formRef.current) return

    const formData = new FormData(formRef.current)

    // Log form data for debugging
    console.log("Form Data Entries:")
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
    }

    // Basic validation
    // Use state values directly instead of formData because Tabs unmount content!
    if (!selectedMake || !selectedModel || !pricePerDay) {
      toast.error("Please fill in all required fields (Make, Model, Price)")
      return
    }

    setIsSubmitting(true)
    try {
      // Manually construct FormData from state to ensure all fields are present
      // regardless of active tab (which unmounts other tabs' inputs)
      const data = new FormData()
      
      // General
      data.append('categories', JSON.stringify(selectedCategories))
      data.append('make', selectedMake)
      data.append('model', selectedModel)
      data.append('description', description)
      data.append('description_he', descriptionHe)
      data.append('year', year)
      data.append('licensePlate', licensePlate)
      data.append('mileage', mileage)
      data.append('seats', selectedSeats)
      data.append('doors', selectedDoors)
      data.append('suitcases', suitcases)
      data.append('transmission', selectedTransmission)
      data.append('fuelType', selectedFuelType)
      data.append('orSimilar', orSimilar ? 'true' : 'false')
      data.append('airConditioning', airConditioning ? 'true' : 'false')
      
      // Prices
      data.append('pricePerDay', pricePerDay)
      data.append('deposit', deposit)
      data.append('fullInsurancePrice', fullInsurancePrice)
      data.append('pickupAfterHoursPrice', pickupAfterHoursPrice)
      data.append('returnAfterHoursPrice', returnAfterHoursPrice)
      data.append('extraKmPrice', extraKmPrice)
      data.append('unlimitedMileagePrice', unlimitedMileagePrice)
      
      // Attributes
      data.append('dailyMileageLimit', dailyMileageLimit)
      data.append('fuelPolicy', selectedFuelPolicy)
      
      // Complex data
      data.append('pricingTiers', JSON.stringify(pricingTiers))
      data.append('features', JSON.stringify(selectedFeatures))
      
      // Handle Image manually
      if (fileInputRef.current?.files?.[0]) {
        data.append('image', fileInputRef.current.files[0])
      }
      // If editing and no new image, we might need to handle keeping existing URL logic on server,
      // or pass imageUrl if we had it in state. Server action handles this if 'image' is missing but we need to pass 'imageUrl' hidden input?
      // Better: pass the existing imageUrl string if we have it.
      if (car?.imageUrl) {
        data.append('imageUrl', car.imageUrl)
      }

      // Switches (Fixing previous comment logic)
       
       let result
      if (isEditing && car?.id) {
        data.append('id', car.id)
        result = await updateCar(data)
      } else {
        result = await createCar(data)
      }

      console.log("Server Result:", result)

      if (result.success) {
        toast.success(isEditing ? "Vehicle successfully updated!" : "Vehicle successfully created!")
        router.push('/admin/cars')
      } else {
        throw new Error(result.error || "Unknown error")
      }
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast.error(`Failed to save vehicle: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="general" className="gap-2"><Car className="w-4 h-4" /> General</TabsTrigger>
          <TabsTrigger value="insurance" className="gap-2"><Shield className="w-4 h-4" /> Insurance</TabsTrigger>
          <TabsTrigger value="prices" className="gap-2"><Banknote className="w-4 h-4" /> Prices</TabsTrigger>
          <TabsTrigger value="attributes" className="gap-2"><Tags className="w-4 h-4" /> Attributes</TabsTrigger>
          <TabsTrigger value="images" className="gap-2"><ImageIcon className="w-4 h-4" /> Images</TabsTrigger>
        </TabsList>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border p-4 rounded-md bg-zinc-50">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`cat-${cat.id}`}
                          checked={selectedCategories.includes(cat.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, cat.name])
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat.name))
                            }
                          }}
                        />
                        <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">{cat.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Vehicle Make</Label>
                  <input type="hidden" name="make" value={selectedMake} />
                  <Select value={selectedMake} onValueChange={handleMakeChange} required>
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
                    <>
                      <input type="hidden" name="model" value={selectedModel} />
                      <Select value={selectedModel} onValueChange={setSelectedModel} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableModels.map(model => (
                            <SelectItem key={model} value={model}>{model}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <Input name="model" defaultValue={car?.model} placeholder="Type model manually" required />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input 
                    name="year" 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                    placeholder="2024" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input 
                    name="licensePlate" 
                    value={licensePlate} 
                    onChange={(e) => setLicensePlate(e.target.value)} 
                    placeholder="ABC-123" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage">Current Mileage (km)</Label>
                  <Input 
                    name="mileage" 
                    type="number" 
                    value={mileage} 
                    onChange={(e) => setMileage(e.target.value)} 
                    placeholder="0" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seats">Number of Seats</Label>
                  <input type="hidden" name="seats" value={selectedSeats} />
                  <Select value={selectedSeats} onValueChange={setSelectedSeats}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seats" />
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
                  <input type="hidden" name="doors" value={selectedDoors} />
                  <Select value={selectedDoors} onValueChange={setSelectedDoors}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doors" />
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
                  <Input 
                    name="suitcases" 
                    type="number" 
                    value={suitcases} 
                    onChange={(e) => setSuitcases(e.target.value)} 
                    placeholder="e.g. 2" 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transmission">Gearbox</Label>
                  <input type="hidden" name="transmission" value={selectedTransmission} />
                  <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
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
                  <input type="hidden" name="fuelType" value={selectedFuelType} />
                  <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
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

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description (English)</Label>
                  <Textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter vehicle description..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="descriptionHe">Description (Hebrew)</Label>
                    <span className="text-xs text-zinc-500">Auto-translated if left empty</span>
                  </div>
                  <Textarea 
                    id="descriptionHe"
                    value={descriptionHe}
                    onChange={(e) => setDescriptionHe(e.target.value)}
                    placeholder="Hebrew translation..."
                    dir="rtl"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-end pb-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="orSimilar" 
                      name="orSimilar" 
                      checked={orSimilar} 
                      onCheckedChange={setOrSimilar} 
                    />
                    <Label htmlFor="orSimilar">Show "Or Similar" label</Label>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">If enabled, customers see "or similar" next to model name.</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insurance & Deposits */}
        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-zinc-500" />
                <h3 className="font-bold text-lg">Insurance Plans & Deposits</h3>
              </div>
              
              <div className="grid gap-6">
                {insurancePlans.filter(p => !p.name.toLowerCase().includes('basic')).map((plan: any) => (
                  <div key={plan.id} className="grid md:grid-cols-3 gap-4 p-4 border rounded-lg bg-zinc-50/50">
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold">{plan.name}</h4>
                      {plan.isDefault && <span className="text-xs text-zinc-500">Default Plan</span>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ins-price-${plan.id}`}>Daily Price Add-on (€)</Label>
                      <Input 
                        id={`ins-price-${plan.id}`}
                        type="number" 
                        min="0"
                        placeholder="0"
                        value={insuranceValues[plan.id]?.price || ""}
                        onChange={(e) => handleInsuranceChange(plan.id, 'price', e.target.value)}
                      />
                      <input type="hidden" name={`insurance_price_${plan.id}`} value={insuranceValues[plan.id]?.price || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ins-deposit-${plan.id}`}>Deposit Required (€)</Label>
                      <Input 
                        id={`ins-deposit-${plan.id}`}
                        type="number" 
                        min="0"
                        placeholder="0"
                        value={insuranceValues[plan.id]?.deposit || ""}
                        onChange={(e) => handleInsuranceChange(plan.id, 'deposit', e.target.value)}
                      />
                      <input type="hidden" name={`insurance_deposit_${plan.id}`} value={insuranceValues[plan.id]?.deposit || "0"} />
                    </div>
                  </div>
                ))}
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
                  <Input 
                    name="pricePerDay" 
                    type="number" 
                    value={pricePerDay} 
                    onChange={(e) => setPricePerDay(e.target.value)} 
                    placeholder="60" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Security Deposit (EUR)</Label>
                  <Input 
                    name="deposit" 
                    type="number" 
                    value={deposit} 
                    onChange={(e) => setDeposit(e.target.value)} 
                    placeholder="500" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullInsurancePrice">Full Insurance Price / Day (EUR)</Label>
                  <Input 
                    name="fullInsurancePrice" 
                    type="number" 
                    value={fullInsurancePrice} 
                    onChange={(e) => setFullInsurancePrice(e.target.value)} 
                    placeholder="20" 
                    required 
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="space-y-2">
                  <Label htmlFor="pickupAfterHoursPrice">Pickup After Business Hours Price (EUR)</Label>
                  <Input 
                    name="pickupAfterHoursPrice" 
                    type="number" 
                    value={pickupAfterHoursPrice} 
                    onChange={(e) => setPickupAfterHoursPrice(e.target.value)} 
                    placeholder="30" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="returnAfterHoursPrice">Return After Business Hours Price (EUR)</Label>
                  <Input 
                    name="returnAfterHoursPrice" 
                    type="number" 
                    value={returnAfterHoursPrice} 
                    onChange={(e) => setReturnAfterHoursPrice(e.target.value)} 
                    placeholder="30" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extraKmPrice">Extra KM Price (EUR)</Label>
                  <Input 
                    name="extraKmPrice" 
                    type="number" 
                    value={extraKmPrice} 
                    onChange={(e) => setExtraKmPrice(e.target.value)} 
                    placeholder="0.5" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unlimitedMileagePrice">Unlimited Mileage Price (EUR)</Label>
                  <Input 
                    name="unlimitedMileagePrice" 
                    type="number" 
                    value={unlimitedMileagePrice} 
                    onChange={(e) => setUnlimitedMileagePrice(e.target.value)} 
                    placeholder="50" 
                  />
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
                  <Input 
                    name="dailyMileageLimit" 
                    type="number" 
                    value={dailyMileageLimit} 
                    onChange={(e) => setDailyMileageLimit(e.target.value)} 
                    placeholder="Leave empty for Unlimited" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelPolicy">Fuel Policy</Label>
                  <input type="hidden" name="fuelPolicy" value={selectedFuelPolicy} />
                  <Select value={selectedFuelPolicy} onValueChange={setSelectedFuelPolicy}>
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
          type="button" 
          className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[150px]"
          disabled={isSubmitting}
          onClick={handleSave}
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
