import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/layout/Header"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <Header />
      
      {/* Booking Engine Skeleton */}
      <div className="pt-32 pb-8 bg-zinc-50/50">
        <div className="w-full max-w-6xl mx-auto px-4">
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      <main className="container mx-auto px-6 py-12">
        {/* Filters Skeleton */}
        <div className="flex justify-center gap-3 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full" />
          ))}
        </div>

        {/* Car Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-zinc-200 h-[450px] p-6 flex flex-col gap-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex-grow flex items-center justify-center">
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="flex justify-between items-end mt-auto">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
