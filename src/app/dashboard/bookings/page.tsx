
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Car, CreditCard } from "lucide-react"
import { dictionaries } from "@/lib/dictionary"
import { cookies } from "next/headers"

export default async function MyBookingsPage() {
    const session = await getSession()
    if (!session?.user?.id) return null

    const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: { car: true, extras: true }
    })

    const cookieStore = await cookies()
    const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
    const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">{dictionary.dashboard.my_bookings}</h1>
                <p className="text-zinc-500">{dictionary.dashboard.manage_rentals}</p>
            </div>

            <div className="space-y-6">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Car Image Section */}
                            <div className="w-full md:w-64 bg-zinc-100 relative h-48 md:h-auto">
                                {booking.car.imageUrl ? (
                                    <img src={booking.car.imageUrl} alt={booking.car.model} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                        <Car className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            {/* Details Section */}
                            <CardContent className="flex-1 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-zinc-900">{booking.car.make} {booking.car.model}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                            'bg-zinc-100 text-zinc-700'
                                                }`}>
                                                {booking.status === 'CONFIRMED' ? dictionary.dashboard.status_confirmed :
                                                    booking.status === 'PENDING' ? dictionary.dashboard.status_pending :
                                                        dictionary.dashboard.status_cancelled}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500">{booking.car.licensePlate}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-zinc-900">€{Number(booking.totalPrice).toFixed(1)}</span>
                                        <span className="text-xs text-zinc-500">{dictionary.dashboard.total_price}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div>
                                                <span className="block text-xs font-bold text-zinc-500 uppercase">{dictionary.dashboard.pick_up}</span>
                                                <p className="font-medium">{new Date(booking.startDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div>
                                                <span className="block text-xs font-bold text-zinc-500 uppercase">{dictionary.dashboard.return_time}</span>
                                                <p className="font-medium">{new Date(booking.endDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <span className="block text-xs font-bold text-zinc-500 uppercase">{dictionary.dashboard.location}</span>
                                                <p className="text-sm">{booking.pickupLocation}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <CreditCard className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <span className="block text-xs font-bold text-zinc-500 uppercase">{dictionary.dashboard.payment}</span>
                                                <p className="text-sm capitalize">{booking.paymentMethod.replace(/_/g, ' ').toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {booking.extras.length > 0 && (
                                    <div className="pt-4 border-t border-zinc-100">
                                        <p className="text-xs font-bold text-zinc-500 uppercase mb-2">{dictionary.dashboard.selected_extras}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {booking.extras.map(extra => (
                                                <span key={extra.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                                                    {extra.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </div>
                    </Card>
                ))}

                {bookings.length === 0 && (
                    <div className="text-center py-20 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                        <p className="text-zinc-500 mb-4">{dictionary.dashboard.no_bookings_yet}</p>
                        <Button className="bg-red-600 hover:bg-red-700">{dictionary.dashboard.find_car}</Button>
                    </div>
                )}
            </div>
        </div>
    )
}
