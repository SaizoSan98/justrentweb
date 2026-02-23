
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload, Car, Banknote, Image as ImageIcon } from "lucide-react"
import { createLongTermCar, updateLongTermCar } from "@/app/actions/long-term-car"
import { toast } from "sonner"
import { CAR_MAKES, CAR_MODELS, CAR_FEATURES } from "@/lib/car-data"

interface LongTermCarFormProps {
  car?: any
  isEditing?: boolean
}

export function LongTermCarForm({ car, isEditing = false }: LongTermCarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State
  const [selectedMake, setSelectedMake] = useState(car?.make || "")
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (!car?.model) return ""
    // If make is not selected or not in known makes, default to car.model (which might be custom)
    // But here we want to determine if the dropdown value should be "Other"
    const makeModels = CAR_MODELS[car?.make]
    if (makeModels && !makeModels.includes(car.model)) return "Other"
    return car.model || ""
  })
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(car?.features || [])
  const [imagePreview, setImagePreview] = useState<string | null>(car?.imageUrl || null)
  const formRef = useRef<HTMLFormElement>(null)

  // Reset model when make changes
  useEffect(() => {
     if (selectedMake !== car?.make) {
        setSelectedModel("")
     }
  }, [selectedMake, car?.make])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature))
    } else {
      setSelectedFeatures([...selectedFeatures, feature])
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    
    // Append features
    formData.append("features", selectedFeatures.join(","))
    
    // If not editing, ensure default availability is set (although schema handles default true, updated checkbox logic handles this)
    if (!isEditing) {
       // isAvailable default true in DB, but form checkbox handles it.
       // Actually switch handles "on" value.
    }

    let result
    if (isEditing && car) {
      result = await updateLongTermCar(car.id, formData)
    } else {
      result = await createLongTermCar(formData)
    }

    setIsSubmitting(false)

    if (result.success) {
      toast.success(isEditing ? "Car updated successfully" : "Car created successfully")
      router.push("/admin/long-term")
      router.refresh()
    } else {
      toast.error(result.error || "Something went wrong")
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Info */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4 text-lg font-bold">
                <Car className="w-5 h-5" />
                Vehicle Information
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Select name="make" value={selectedMake} onValueChange={setSelectedMake}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Make" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_MAKES.map(make => (
                        <SelectItem key={make} value={make}>{make}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedMake === "Other" && (
                    <Input name="customMake" placeholder="Enter custom make" className="mt-2" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  {selectedMake && CAR_MODELS[selectedMake] ? (
                     <>
                     <Select 
                        name="model" 
                        value={selectedModel} 
                        onValueChange={setSelectedModel}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                           {CAR_MODELS[selectedMake].map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                           ))}
                           <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                     {selectedModel === "Other" && (
                        <Input 
                            name="customModel" 
                            placeholder="Enter custom model" 
                            className="mt-2" 
                            defaultValue={car?.model && !CAR_MODELS[selectedMake]?.includes(car.model) ? car.model : ""}
                            required
                        />
                     )}
                     </>
                  ) : (
                     <Input name="model" placeholder="Model Name" defaultValue={car?.model} required />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input name="year" type="number" placeholder="2024" defaultValue={car?.year} required />
                </div>

                <div className="space-y-2">
                  <Label>Seats</Label>
                  <Input name="seats" type="number" placeholder="5" defaultValue={car?.seats} required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select name="transmission" defaultValue={car?.transmission || "MANUAL"}>
                       <SelectTrigger>
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="MANUAL">Manual</SelectItem>
                          <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select name="fuelType" defaultValue={car?.fuelType || "PETROL"}>
                       <SelectTrigger>
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="PETROL">Petrol</SelectItem>
                          <SelectItem value="DIESEL">Diesel</SelectItem>
                          <SelectItem value="ELECTRIC">Electric</SelectItem>
                          <SelectItem value="HYBRID">Hybrid</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  name="description" 
                  placeholder="Detailed description of the car..." 
                  defaultValue={car?.description}
                  className="min-h-[100px]" 
                />
              </div>

              <div className="space-y-2">
                 <Label>Features</Label>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-zinc-50 rounded-lg border">
                    {CAR_FEATURES.map(feature => (
                       <div key={feature} className="flex items-center space-x-2">
                          <Checkbox 
                             id={`f-${feature}`} 
                             checked={selectedFeatures.includes(feature)}
                             onCheckedChange={() => handleFeatureToggle(feature)}
                          />
                          <label 
                             htmlFor={`f-${feature}`} 
                             className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                             {feature}
                          </label>
                       </div>
                    ))}
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
             <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-bold">
                   <Banknote className="w-5 h-5" />
                   Pricing (Monthly)
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label>Monthly Price (€) (Base)</Label>
                      <div className="relative">
                         <span className="absolute left-3 top-2.5 text-zinc-500">€</span>
                         <Input 
                            name="monthlyPrice" 
                            type="number" 
                            step="0.01" 
                            className="pl-8 text-lg font-bold" 
                            placeholder="0.00" 
                            defaultValue={car?.monthlyPrice?.toString()}
                            required 
                         />
                      </div>
                      <p className="text-xs text-zinc-500">Base price for reference</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-lg border">
                      <div className="space-y-2">
                         <Label className="text-sm">Price 1-3 Months (€)</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-zinc-500">€</span>
                            <Input 
                               name="price1to3" 
                               type="number" 
                               step="0.01" 
                               className="pl-8" 
                               placeholder="0.00" 
                               defaultValue={car?.price1to3?.toString() || "0"}
                            />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <Label className="text-sm">Price 4-6 Months (€)</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-zinc-500">€</span>
                            <Input 
                               name="price4to6" 
                               type="number" 
                               step="0.01" 
                               className="pl-8" 
                               placeholder="0.00" 
                               defaultValue={car?.price4to6?.toString() || "0"}
                            />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <Label className="text-sm">Price 7-12 Months (€)</Label>
                         <div className="relative">
                            <span className="absolute left-3 top-2.5 text-zinc-500">€</span>
                            <Input 
                               name="price7plus" 
                               type="number" 
                               step="0.01" 
                               className="pl-8" 
                               placeholder="0.00" 
                               defaultValue={car?.price7plus?.toString() || "0"}
                            />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label>Security Deposit (€)</Label>
                      <div className="relative">
                         <span className="absolute left-3 top-2.5 text-zinc-500">€</span>
                         <Input 
                            name="deposit" 
                            type="number" 
                            step="0.01" 
                            className="pl-8" 
                            placeholder="0.00" 
                            defaultValue={car?.deposit?.toString()}
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border">
                      <Label htmlFor="isAvailable" className="cursor-pointer">Available for Rent</Label>
                      <Switch id="isAvailable" name="isAvailable" defaultChecked={car ? car.isAvailable : true} />
                   </div>
                </div>
             </CardContent>
          </Card>

        </div>

        {/* Right Column: Pricing & Image */}
        <div className="space-y-8">
          
          {/* Image */}
          <Card>
             <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4 text-lg font-bold">
                   <ImageIcon className="w-5 h-5" />
                   Vehicle Image
                </div>
                
                <div className="space-y-4">
                   <div className="aspect-video relative bg-zinc-100 rounded-lg overflow-hidden border-2 border-dashed border-zinc-200 flex items-center justify-center group hover:border-zinc-400 transition-colors">
                      {imagePreview ? (
                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                         <div className="text-center text-zinc-400">
                            <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <span className="text-xs">Click to upload image</span>
                         </div>
                      )}
                      <input 
                         type="file" 
                         name="imageFile" 
                         accept="image/*" 
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         onChange={handleImageChange}
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <Label>Or Image URL</Label>
                      <Input 
                         name="imageUrl" 
                         placeholder="https://..." 
                         defaultValue={car?.imageUrl || ""}
                         onChange={(e) => setImagePreview(e.target.value)}
                      />
                   </div>
                </div>
             </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-black hover:bg-zinc-800 text-white font-bold h-12 text-lg" disabled={isSubmitting}>
             {isSubmitting ? (
                <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Saving...
                </>
             ) : (
                isEditing ? "Update Car" : "Create Car"
             )}
          </Button>

        </div>
      </div>
    </form>
  )
}
