
import { prisma } from "@/lib/prisma"
import { LongTermCarCard } from "@/components/fleet/LongTermCarCard"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Long Term Rentals | JustRent",
  description: "Browse our exclusive selection of vehicles available for long term rental.",
}

export default async function LongTermRentalsPage() {
  const cars = await prisma.longTermCar.findMany({
    where: { isAvailable: true },
    orderBy: { monthlyPrice: 'asc' }
  })

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
           <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight mb-4">
              LONG TERM <span className="text-red-600">RENTALS</span>
           </h1>
           <p className="text-zinc-500 text-lg md:text-xl max-w-2xl">
              Enjoy the freedom of a car without the commitment of ownership. Flexible monthly plans, all-inclusive pricing, and premium vehicles.
           </p>
        </div>

        {/* Grid */}
        {cars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {cars.map(car => (
                  <LongTermCarCard key={car.id} car={car} />
               ))}
            </div>
        ) : (
            <div className="text-center py-24 border-2 border-dashed border-zinc-200 rounded-3xl">
                <h3 className="text-2xl font-bold text-zinc-400 mb-2">No vehicles currently available</h3>
                <p className="text-zinc-400">Please check back later or contact us for custom requests.</p>
            </div>
        )}

      </div>
    </div>
  )
}
