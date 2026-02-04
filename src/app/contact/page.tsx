import { Header } from "@/components/layout/Header";
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { dictionaries } from "@/lib/dictionary"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default async function ContactPage() {
  const session = await getSession()
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "en"
  const dictionary = dictionaries[lang as keyof typeof dictionaries] || dictionaries.en

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Header user={session?.user} dictionary={dictionary} lang={lang} />
      
      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">Get in Touch</span>
            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-8">CONTACT US</h1>
            <p className="text-xl text-zinc-500 mb-16 leading-relaxed">
              Have questions about your booking or need assistance? Our premium support team is available 24/7 to ensure your journey is flawless.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Phone Support</h3>
                    <p className="text-zinc-500 mb-2">Available 24/7 for urgent inquiries.</p>
                    <a href="tel:+3612345678" className="text-lg font-semibold hover:text-red-600 transition-colors">+36 1 234 5678</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Email Us</h3>
                    <p className="text-zinc-500 mb-2">We typically reply within 2 hours.</p>
                    <a href="mailto:hello@justrent.hu" className="text-lg font-semibold hover:text-red-600 transition-colors">hello@justrent.hu</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Main Office</h3>
                    <p className="text-zinc-500 leading-relaxed">
                      Budapest Liszt Ferenc Airport<br/>
                      Terminal 2B, Arrivals Level<br/>
                      1185 Budapest, Hungary
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-[2.5rem] p-8 border border-zinc-100">
                <h3 className="text-2xl font-bold text-zinc-900 mb-6">Opening Hours</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-zinc-200">
                    <span className="font-medium text-zinc-700">Monday - Friday</span>
                    <span className="text-zinc-500">08:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-200">
                    <span className="font-medium text-zinc-700">Saturday</span>
                    <span className="text-zinc-500">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-200">
                    <span className="font-medium text-zinc-700">Sunday</span>
                    <span className="text-zinc-500">09:00 - 16:00</span>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500 bg-white p-4 rounded-xl border border-zinc-100">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>After-hours pickup available upon request.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
