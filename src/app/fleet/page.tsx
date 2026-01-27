import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Briefcase, Fuel, Snowflake, Gauge, Info } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function FleetPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const params = searchParams ?? {};
  const category = typeof params.category === 'string' ? params.category : undefined;
  
  type PricingTier = {
    minDays: number;
    maxDays: number | null;
    pricePerDay: number;
    deposit: number;
  };
  type CarItem = {
    id: string;
    make: string;
    model: string;
    year: number;
    category: string;
    imageUrl: string | null;
    pricePerDay: number;
    status: string;
    pricingTiers: PricingTier[];
  };
  
  function getStockImageUrl(make: string, model: string): string {
    const key = `${make} ${model}`.toLowerCase();
    const map: Record<string, string> = {
      "bmw x5": "https://images.unsplash.com/photo-1555215696-99ac45e43d34?auto=format&fit=crop&q=80",
      "mercedes-benz c-class": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80",
      "audi a5": "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80",
      "tesla model 3": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80",
      "porsche 911 carrera": "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80",
    };
    if (map[key]) return map[key];
    const brandFallback: Record<string, string> = {
      "bmw": "https://images.unsplash.com/photo-1619767886558-ef9bb5e31403?auto=format&fit=crop&q=80",
      "mercedes-benz": "https://images.unsplash.com/photo-1616789919274-52a8d55e6b69?auto=format&fit=crop&q=80",
      "audi": "https://images.unsplash.com/photo-1614241202229-4a27a8d15b10?auto=format&fit=crop&q=80",
      "tesla": "https://images.unsplash.com/photo-1606676463510-b1c153c0a5fd?auto=format&fit=crop&q=80",
      "porsche": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80",
    };
    const brand = make.toLowerCase();
    return brandFallback[brand] ?? "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80";
  }
  
  // Date parsing and calculation
  const startDateStr = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDateStr = typeof params.endDate === 'string' ? params.endDate : undefined;
  
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  const endDate = endDateStr ? new Date(endDateStr) : new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

  const whereClause: { status: 'AVAILABLE'; category?: string } = {
    status: 'AVAILABLE',
  };

  if (category && category !== 'All Categories') {
    whereClause.category = category;
  }

  const cars: CarItem[] = await prisma.car.findMany({
    where: {
      ...whereClause,
      AND: [
        {
          availabilities: {
            some: {
              status: 'AVAILABLE',
              startDate: { lte: startDate },
              endDate: { gte: endDate },
            },
          },
        },
        {
          NOT: {
            availabilities: {
              some: {
                status: { in: ['MAINTENANCE', 'RENTED', 'OUT_OF_SERVICE'] },
                AND: [
                  { startDate: { lt: endDate } },
                  { endDate: { gt: startDate } },
                ],
              },
            },
          },
        },
      ],
    },
    include: {
      pricingTiers: true,
    },
    orderBy: {
      pricePerDay: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            Just<span className="text-orange-600">Rent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-zinc-600 hover:text-orange-600 transition-colors">Home</Link>
            <Link href="/fleet" className="text-orange-600">Fleet</Link>
            <Link href="/about" className="text-zinc-600 hover:text-orange-600 transition-colors">About</Link>
            <Link href="/contact" className="text-zinc-600 hover:text-orange-600 transition-colors">Contact</Link>
          </nav>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 font-semibold shadow-md shadow-orange-600/20">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-zinc-900 tracking-tight">Our Premium Fleet</h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Showing prices for <span className="font-bold text-orange-600">{diffDays} days</span> rental period.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4">
          {['All Categories', 'SUV', 'Sedan', 'Sports', 'Luxury'].map((cat) => (
            <Link 
              key={cat} 
              href={cat === 'All Categories' ? `/fleet?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}` : `/fleet?category=${cat}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                (category === cat || (!category && cat === 'All Categories'))
                  ? 'bg-orange-600 text-white shadow-orange-600/30 transform scale-105' 
                  : 'bg-white text-zinc-500 border border-zinc-200 hover:border-orange-600 hover:text-orange-600'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Car Grid */}
        {cars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No cars available</h3>
            <p className="text-zinc-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => {
              const imageUrl = car.imageUrl ?? getStockImageUrl(car.make, car.model);
              return (
                <FleetCard 
                  key={car.id} 
                  car={car} 
                  diffDays={diffDays} 
                  imageUrl={imageUrl} 
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
