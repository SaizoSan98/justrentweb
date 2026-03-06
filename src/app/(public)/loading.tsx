import { Loader2 } from "lucide-react"

export default function HomeLoading() {
    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans relative">
            {/* Header Skeleton Mock */}
            <div className="h-24 w-full bg-white/50 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-6 z-10 sticky top-0">
                <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse"></div>
                <div className="hidden md:flex gap-6">
                    <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse"></div>
                </div>
            </div>

            {/* Central Spinner Overlay (Matching the Checkout Style but Light) */}
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md pt-24">
                <div className="flex flex-col items-center gap-4 text-zinc-600 bg-white shadow-2xl p-8 rounded-[2rem] border border-zinc-100">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600" />
                    <span className="text-sm font-bold tracking-widest uppercase text-zinc-800">Fetching Live Fleet Data...</span>
                    <p className="text-xs text-zinc-500 font-medium">Connecting to Renteon servers</p>
                </div>
            </div>

            {/* Hero Skeleton */}
            <div className="pt-12 pb-24 bg-zinc-50/30">
                <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="h-16 w-3/4 bg-zinc-200 rounded-xl animate-pulse"></div>
                        <div className="h-16 w-1/2 bg-zinc-200 rounded-xl animate-pulse mb-8"></div>

                        <div className="h-4 w-full bg-zinc-200 rounded animate-pulse"></div>
                        <div className="h-4 w-5/6 bg-zinc-200 rounded animate-pulse"></div>

                        <div className="flex gap-4 pt-6">
                            <div className="h-14 w-40 bg-zinc-200 rounded-full animate-pulse"></div>
                            <div className="h-14 w-32 bg-zinc-200 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full bg-zinc-100 rounded-[3rem] animate-pulse"></div>
                </div>
            </div>

            {/* Booking Engine Skeleton */}
            <div className="w-full max-w-6xl mx-auto px-6 -mt-16 pb-12 relative z-20">
                <div className="h-32 w-full bg-white shadow-xl rounded-2xl border border-zinc-100 animate-pulse"></div>
            </div>

        </div>
    )
}
