
"use client"

import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

const reviews = [
  {
    name: "Botond Gáspár",
    rating: 5,
    text: "Profi csapat, korrekt és rugalmas ügyintézés. Az autót makulátlan állapotban kaptam meg, az adminisztráció pedig gyors és gördülékeny volt. Kedvező árak, megbízható szolgáltatás. minden szempontból elégedett vagyok. Biztosan fogok még itt bérelni!"
  },
  {
    name: "Tamás Czifra",
    rating: 5,
    text: "Autóbérlési céllal kerestük fel a céget, akik még aznap megtalálták az utazásunkhoz kért autót. A csapat segítőkész és összeszedett, minden kérdésemre azonnal válaszoltak. A gépkocsit tisztán és megtankolva kaptuk meg (természetesen így is adtuk vissza), megkoronázta a hosszú utat ez a korrekt hozzáállás. Csak ajánlani tudom őket mindenkinek!"
  },
  {
    name: "Jázmin Farkas",
    rating: 5,
    text: "Ma autót béreltem a Just Rent and Trans cégtől, és rendkívül pozitív élményben volt részem. Az ügyfélszolgálat nagyon kedves és segítőkész volt, ami már az első pillanattól kellemes benyomást tett rám. Az autó, amit kaptam, rendkívül igényes volt, jól karbantartott és tiszta. Összességében egy profi szolgáltatást kaptam, amelyet mindenkinek szívesen ajánlok, aki megbízható autókölcsönzőt keres."
  },
  {
    name: "רפאל טולידאנו",
    rating: 5,
    text: "חברת השכרה הכי טובה בבודפשט. שירות VIP לכולם. זמינות בווצאפ כמעט בכל שעות היממה. שירות הסעה מהשדה תעופה למקות. מחירים טובים. רכבים חדשים במגוון גדול של סוגים. מומלץ בחום רב"
  }
]

export function Reviews() {
  return (
    <section className="py-24 bg-zinc-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
      <div className="absolute -top-[20%] -left-[10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-3xl" />
      <div className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] bg-zinc-900/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
           <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight mb-4">
                 TRUSTED BY <span className="text-red-600">MANY</span>
              </h2>
              <p className="text-zinc-500 text-lg md:text-xl max-w-lg">
                 Don't just take our word for it. See what our customers say about their experience.
              </p>
           </div>
           
           <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center gap-1 mb-2">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                 ))}
              </div>
              <div className="text-zinc-900 font-bold text-lg">
                 5.0 / 5.0 Rating
              </div>
              <div className="text-zinc-400 text-sm font-medium">
                 Based on Google Reviews
              </div>
           </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
           {reviews.map((review, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group"
              >
                 <Quote className="absolute top-8 right-8 w-8 h-8 text-zinc-100 group-hover:text-red-50 transition-colors" />
                 
                 <div className="flex items-center gap-1 mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                       <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                 </div>

                 <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-grow italic">
                    "{review.text}"
                 </p>

                 <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-sm">
                       {review.name.charAt(0)}
                    </div>
                    <div>
                       <div className="font-bold text-zinc-900 text-sm">{review.name}</div>
                       <div className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                          <img src="/google-logo.svg" alt="Google" className="w-3 h-3 opacity-50 grayscale" onError={(e) => e.currentTarget.style.display = 'none'} />
                          Verified Review
                       </div>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>
    </section>
  )
}
