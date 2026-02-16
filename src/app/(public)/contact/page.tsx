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
            <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-4 block">{dictionary.contact.get_in_touch}</span>
            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-8">{dictionary.contact.title}</h1>
            <p className="text-xl text-zinc-500 mb-16 leading-relaxed">
              {dictionary.contact.subtitle}
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-12">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{dictionary.contact.phone_support}</h3>
                    <p className="text-zinc-500 mb-2">{dictionary.contact.phone_desc}</p>
                    <a href="tel:+36204048186" className="text-lg font-semibold hover:text-red-600 transition-colors">+36 20 404 8186</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{dictionary.contact.email_us}</h3>
                    <p className="text-zinc-500 mb-2">{dictionary.contact.email_desc}</p>
                    <a href="mailto:booking@jrandtrans.com" className="text-lg font-semibold hover:text-red-600 transition-colors">booking@jrandtrans.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">{dictionary.contact.main_office}</h3>
                    <p className="text-zinc-500 leading-relaxed">
                      2220 Vecsés,<br/>
                      Dózsa György út 86.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-[2.5rem] p-8 border border-zinc-100">
                <h3 className="text-2xl font-bold text-zinc-900 mb-6">{dictionary.contact.opening_hours}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-zinc-200">
                    <span className="font-medium text-zinc-700">{dictionary.contact.monday_friday}</span>
                    <span className="text-zinc-500">08:00 - 20:00</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-200">
                    <span className="font-medium text-zinc-700">{dictionary.contact.saturday}</span>
                    <span className="text-zinc-500">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-200">
                    <span className="font-medium text-zinc-700">{dictionary.contact.sunday}</span>
                    <span className="text-zinc-500">09:00 - 16:00</span>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center gap-3 text-sm text-zinc-500 bg-white p-4 rounded-xl border border-zinc-100">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>{dictionary.contact.after_hours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
