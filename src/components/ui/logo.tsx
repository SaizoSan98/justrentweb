
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  variant?: "light" | "dark"
}

export function Logo({ className, variant = "dark" }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* White/Black Rectangle with JUST */}
      <div className={cn(
        "px-2 py-1 rounded-sm font-black tracking-tighter text-lg leading-none select-none flex items-center justify-center",
        variant === "dark" ? "bg-zinc-900 text-white" : "bg-white text-black"
      )}>
        JUST
      </div>
      
      {/* RENT text */}
      <div className={cn(
        "font-black tracking-tighter text-lg leading-none select-none flex flex-col justify-center",
        variant === "dark" ? "text-zinc-900" : "text-white"
      )}>
        <span>RENT</span>
        <span className={cn(
          "text-[0.4em] font-bold tracking-widest uppercase block mt-[-2px]",
          variant === "dark" ? "text-zinc-500" : "text-zinc-400"
        )}>
          Rent a Car
        </span>
      </div>
    </div>
  )
}
