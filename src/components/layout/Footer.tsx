import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <div className="px-4 pb-4 md:px-6 md:pb-6 bg-zinc-50">
      <footer className="bg-zinc-950 text-white pt-24 pb-12 rounded-[2.5rem] shadow-2xl">
        <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Logo variant="light" className="scale-125 origin-left" />
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
              Experience the freedom of Budapest with our premium car rental service. Transparent pricing, instant booking, and a fleet that defines excellence.
            </p>
            <div className="flex gap-4">
              {['Facebook', 'Instagram', 'LinkedIn'].map((social) => (
                <div key={social} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all cursor-pointer group">
                  <span className="sr-only">{social}</span>
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:text-white text-zinc-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-white text-lg">Explore</h4>
            <ul className="space-y-4 text-zinc-400">
              <li><Link href="/fleet" className="hover:text-red-500 transition-colors">Popular Cars</Link></li>
              <li><Link href="/#why-choose-us" className="hover:text-red-500 transition-colors">Why Choose Us</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Locations</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Travel Blog</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-white text-lg">Support</h4>
            <ul className="space-y-4 text-zinc-400">
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="font-bold text-white text-lg">Visit Us</h4>
            <ul className="space-y-6 text-zinc-400">
              <li className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                <span>Budapest Liszt Ferenc Airport<br/>Terminal 2B, Arrivals Level</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-red-600 shrink-0" />
                <a href="tel:+3612345678" className="hover:text-white transition-colors">+36 1 234 5678</a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-red-600 shrink-0" />
                <a href="mailto:hello@justrent.hu" className="hover:text-white transition-colors">hello@justrent.hu</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
          <p className="text-zinc-500 text-sm">© 2026 JustRent Budapest. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-zinc-500">
             <span>Created by K.D Budapest</span>
          </div>
        </div>
      </div>
      </footer>
    </div>
  );
}
