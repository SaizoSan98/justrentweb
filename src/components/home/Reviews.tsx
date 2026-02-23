
"use client"

import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"

const reviews = [
  {
    name: "Botond Gáspár",
    rating: 5,
    text: "Professional team, fair and flexible administration. I received the car in immaculate condition, and the paperwork was quick and smooth. Favorable prices, reliable service. I am satisfied in every respect. I will definitely rent here again!"
  },
  {
    name: "Tamás Czifra",
    rating: 5,
    text: "We contacted the company for car rental purposes, and they found the car requested for our trip the same day. The team is helpful and organized, they answered all my questions immediately. We received the car clean and refueled (of course we returned it the same way), this fair attitude crowned the long journey. I can only recommend them to everyone!"
  },
  {
    name: "Jázmin Farkas",
    rating: 5,
    text: "I rented a car from Just Rent and Trans today, and I had an extremely positive experience. The customer service was very kind and helpful, which made a pleasant impression on me from the very first moment. The car I received was extremely demanding, well-maintained and clean. Overall, I received a professional service, which I would recommend to anyone looking for a reliable car rental company."
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
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group"
              >
                 <Quote className="absolute top-6 right-6 md:top-8 md:right-8 w-6 h-6 md:w-8 md:h-8 text-zinc-100 group-hover:text-red-50 transition-colors" />
                 
                 <div className="flex items-center gap-1 mb-4 md:mb-6">
                    {[...Array(review.rating)].map((_, i) => (
                       <Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                 </div>

                 <p className="text-zinc-600 text-sm leading-relaxed mb-6 flex-grow italic line-clamp-4 md:line-clamp-6">
                    "{review.text}"
                 </p>

                 <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs md:text-sm shrink-0">
                       {review.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                       <div className="font-bold text-zinc-900 text-sm truncate">{review.name}</div>
                       <div className="text-xs text-zinc-400 font-medium flex items-center gap-1 truncate">
                          <img src="/google-logo.svg" alt="Google" className="w-3 h-3 opacity-50 grayscale shrink-0" onError={(e) => e.currentTarget.style.display = 'none'} />
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
