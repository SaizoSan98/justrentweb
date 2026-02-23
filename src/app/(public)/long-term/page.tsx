
import { prisma } from "@/lib/prisma"
import { LongTermCarCard } from "@/components/fleet/LongTermCarCard"
import { Metadata } from "next"
import { Header } from "@/components/layout/Header"
import { getSession } from "@/lib/auth"
import { dictionaries } from "@/lib/dictionary"

export const metadata: Metadata = {
  title: "Long Term Rentals | JustRent",
  description: "Browse our exclusive selection of vehicles available for long term rental.",
}

export default async function LongTermRentalsPage() {
  const session = await getSession()
  const dictionary = dictionaries.en // Default to EN directly for now
  
  const cars = await prisma.longTermCar.findMany({
    where: { isAvailable: true },
    orderBy: { monthlyPrice: 'asc' }
  })

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={session?.user} dictionary={dictionary} lang="en" />
      
      <div className="pt-32 pb-20 container mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-4xl mb-16">
           <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight mb-6 uppercase leading-none">
              Long Term <br/>
              <span className="text-red-600">Rentals</span>
           </h1>
           <div className="h-2 w-24 bg-red-600 mb-8" />
           <p className="text-zinc-500 text-lg md:text-xl max-w-2xl leading-relaxed">
              Experience the freedom of having a premium vehicle without the long-term commitment of ownership. 
              Our flexible monthly rental plans include insurance, maintenance, and support, giving you complete peace of mind.
              Whether you need a car for a month or a year, we have the perfect solution for you.
           </p>
        </div>

        {/* Grid */}
        {cars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {cars.map((car: any) => (
                  <LongTermCarCard 
                    key={car.id} 
                    car={{
                      ...car,
                      monthlyPrice: Number(car.monthlyPrice),
                      price1to3: Number(car.price1to3),
                      price4to6: Number(car.price4to6),
                      price7plus: Number(car.price7plus),
                      deposit: Number(car.deposit),
                    }} 
                  />
               ))}
            </div>
        ) : (
            <div className="text-center py-24 border-2 border-dashed border-zinc-200 rounded-3xl bg-white">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2">No vehicles currently available</h3>
                <p className="text-zinc-500">Please check back later or contact us directly for custom long-term rental requests.</p>
            </div>
        )}

      </div>
    </div>
  )
}
