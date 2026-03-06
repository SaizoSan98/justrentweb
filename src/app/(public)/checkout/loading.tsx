import { Loader2 } from "lucide-react"

export default function CheckoutLoading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-4 bg-zinc-800 rounded"></div>
                    <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                </div>
                <div className="h-10 w-64 bg-zinc-800 rounded mb-4"></div>
                <div className="h-4 w-48 bg-zinc-800 rounded"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form Skeleton */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#18181b] p-8 rounded-[2rem] border border-zinc-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-6 w-6 bg-zinc-800 rounded-full"></div>
                            <div className="h-6 w-48 bg-zinc-800 rounded"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-12 bg-zinc-800/50 rounded-xl"></div>
                            <div className="h-12 bg-zinc-800/50 rounded-xl"></div>
                            <div className="h-12 bg-zinc-800/50 rounded-xl col-span-2"></div>
                            <div className="h-12 bg-zinc-800/50 rounded-xl"></div>
                            <div className="h-12 bg-zinc-800/50 rounded-xl"></div>
                        </div>
                    </div>

                    <div className="bg-[#18181b] p-8 rounded-[2rem] border border-zinc-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-6 w-6 bg-zinc-800 rounded-full"></div>
                            <div className="h-6 w-48 bg-zinc-800 rounded"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-16 bg-zinc-800/50 rounded-xl"></div>
                            <div className="h-16 bg-zinc-800/50 rounded-xl"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary Skeleton */}
                <div className="space-y-6">
                    <div className="bg-[#18181b] rounded-[2rem] border border-zinc-800 overflow-hidden sticky top-24">
                        <div className="h-48 bg-zinc-800/30 w-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                        </div>
                        <div className="p-6">
                            <div className="h-6 w-32 bg-zinc-800 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-zinc-800 rounded mb-6"></div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 bg-zinc-800 rounded"></div>
                                    <div className="h-4 w-16 bg-zinc-800 rounded"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                                    <div className="h-4 w-16 bg-zinc-800 rounded"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 bg-zinc-800 rounded"></div>
                                    <div className="h-4 w-16 bg-zinc-800 rounded"></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800 mb-6 flex justify-between">
                                <div className="h-6 w-16 bg-zinc-800 rounded"></div>
                                <div className="h-6 w-24 bg-zinc-800 rounded"></div>
                            </div>

                            <div className="h-14 w-full bg-zinc-800 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed inset-0 z-[-1] pointer-events-none flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 text-zinc-400">
                    <Loader2 className="w-12 h-12 animate-spin text-white" />
                    <span className="text-sm font-bold tracking-widest uppercase">Fetching Live Availability...</span>
                </div>
            </div>
        </div>
    )
}
