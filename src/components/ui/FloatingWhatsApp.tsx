"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsApp() {
    const pathname = usePathname();

    // Omit on admin/dashboard routes
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
        return null;
    }

    return (
        <a
            href="https://wa.me/36204048186"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl sm:bottom-8 sm:right-8"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={24} />
            <span className="font-bold tracking-wide">WhatsApp</span>

            {/* Optional ping animation to attract attention */}
            <span className="absolute -z-10 h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75"></span>
        </a>
    );
}
