"use client"

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard") || pathname?.startsWith("/fleet")) {
    return null;
  }

  return (
    <div className="bg-black">
      <footer className="bg-black text-white pt-8 pb-6 md:pt-24 md:pb-12">
        <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-16 mb-8 md:mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-bold text-white">JustRent<span className="text-red-600">.</span></h2>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
              Experience the freedom of Budapest with our premium car rental service. Transparent pricing, instant booking, and a fleet that defines excellence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] transition-all cursor-pointer group">
                <Facebook className="w-5 h-5 group-hover:text-white text-zinc-400" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-all cursor-pointer group">
                <MessageCircle className="w-5 h-5 group-hover:text-white text-zinc-400" />
              </a>
              <a href="#" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#E4405F] hover:border-[#E4405F] transition-all cursor-pointer group">
                <Instagram className="w-5 h-5 group-hover:text-white text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-white text-lg">Explore</h4>
            <ul className="space-y-4 text-zinc-400">
              <li><Link href="/fleet" className="hover:text-red-500 transition-colors">Our Fleet</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Locations</Link></li>
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-white text-lg">Support</h4>
            <ul className="space-y-4 text-zinc-400">
              <li><Link href="/contact" className="hover:text-red-500 transition-colors">Help Center</Link></li>
              <li><Link href="/uploads/Terms%20And%20Conditions%20JR.pdf" target="_blank" className="hover:text-red-500 transition-colors">Terms of Service</Link></li>
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
                <span>2220 Vecsés, Dózsa György út 86.</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-6 h-6 text-red-600 shrink-0" />
                <a href="tel:+36204048186" className="hover:text-white transition-colors">+36 20 404 8186</a>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-6 h-6 text-red-600 shrink-0" />
                <a href="mailto:booking@jrandtrans.com" className="hover:text-white transition-colors">booking@jrandtrans.com</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
          <p className="text-zinc-500 text-sm">© 2026 JustRent Budapest. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-zinc-500">
             <span>Created by: <a href="https://nixovisual.hu" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NixoVisual</a></span>
          </div>
        </div>
      </div>
      </footer>
    </div>
  );
}
