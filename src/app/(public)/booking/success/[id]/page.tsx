import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { CheckCircle, Calendar, MapPin, User, ShieldCheck, Wallet, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      car: true,
      extras: true
    }
  })

  if (!booking) {
    notFound()
  }

  const days = Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header user={session?.user} dictionary={dictionary} lang={lang} />

      <main className="container mx-auto px-6 pt-32 pb-12">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">{dictionary.booking_success.title}</h1>
              <p className="text-green-700">
                {dictionary.booking_success.thank_you}, {booking.firstName}! {dictionary.booking_success.reference_is} <span className="font-mono font-bold">{booking.id.slice(-8).toUpperCase()}</span>.
              </p>
              <p className="text-green-600 text-sm mt-2">
                {dictionary.booking_success.email_sent} {booking.email}. {dictionary.booking_success.contact_shortly}
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 bg-zinc-900 text-white p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="text-zinc-400 text-sm uppercase tracking-wider mb-1">{dictionary.fleet.vehicle}</div>
                  <CardTitle className="text-2xl font-bold">{booking.car.make} {booking.car.model}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="text-zinc-400 text-sm uppercase tracking-wider mb-1">{dictionary.booking.total_price}</div>
                  <div className="text-2xl font-bold text-red-500">€{Number(Number(booking.totalPrice).toFixed(1))}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Details Grid */}
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">

                {/* Left Column */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      {dictionary.booking_success.trip_details}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <div className="space-y-1">
                          <span className="text-xs text-zinc-500">{dictionary.booking.pickup}</span>
                          <div className="font-bold text-sm">{format(new Date(booking.startDate), 'MMM d, yyyy HH:mm')}</div>
                          <div className="text-xs text-zinc-500">{booking.pickupLocation}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-xs text-zinc-500">{dictionary.booking.return}</span>
                          <div className="font-bold text-sm">{format(new Date(booking.endDate), 'MMM d, yyyy HH:mm')}</div>
                          <div className="text-xs text-zinc-500">{booking.dropoffLocation}</div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-sm text-zinc-600">{dictionary.booking_success.duration_label}</span>
                        <span className="font-bold text-sm">{days} {dictionary.common.days}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-red-600" />
                      {dictionary.booking.driver_details}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">{dictionary.booking_success.full_name}</span>
                        <span className="text-sm font-medium">{booking.firstName} {booking.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">{dictionary.booking.email}</span>
                        <span className="text-sm font-medium">{booking.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">{dictionary.booking.phone}</span>
                        <span className="text-sm font-medium">{booking.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-red-600" />
                      {dictionary.booking_success.payment_breakdown}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-zinc-500">{dictionary.booking_success.vehicle_rental}</span>
                        <span className="text-sm font-medium">€{Number(Number(booking.totalPrice).toFixed(1))}</span>
                      </div>
                      {/* Extras would go here if we stored their individual prices in booking or calculated them */}
                      <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-sm font-bold">{dictionary.booking_success.total_due}</span>
                        <span className="text-lg font-bold text-red-600">€{Number(Number(booking.totalPrice).toFixed(1))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-lg">
                    <div className="flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-zinc-400 shrink-0" />
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        {dictionary.booking_success.no_payment_taken}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="mr-4">{dictionary.booking_success.view_bookings}</Button>
            </Link>
            <Link href="/">
              <Button>{dictionary.booking_success.return_home}</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
