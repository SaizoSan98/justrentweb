"use client"

import { Globe } from "lucide-react"
import { setLanguage } from "@/app/actions/i18n"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ currentLang, variant = 'dark' }: { currentLang: string, variant?: 'light' | 'dark' }) {
  const router = useRouter()

  const handleLanguageChange = async (lang: string) => {
    // Create FormData to use with Server Action
    const formData = new FormData()
    formData.append("lang", lang)
    await setLanguage(formData)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn(
            "hidden md:flex items-center gap-2 cursor-pointer transition-colors group p-0 hover:bg-transparent",
            variant === 'light' ? "text-white/80 hover:text-white" : "text-zinc-600 hover:text-zinc-900"
          )}
        >
          <Globe className={cn("w-5 h-5 transition-colors", variant === 'light' ? "group-hover:text-white" : "group-hover:text-red-600")} />
          <span className="text-sm font-bold">
            {currentLang === 'he' ? 'עברית | EUR' : 'ENG | EUR'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('en')} className="font-bold">
          English (ENG)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('he')} className="font-bold text-right">
          עברית (HE)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
