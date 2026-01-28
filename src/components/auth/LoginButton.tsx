"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LoginButton() {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-red-600/20 mt-2"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="animate-spin w-4 h-4"/>
          Signing in...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          Sign In
          {/* ArrowRight is not imported here, but that's fine for now or we can add it */}
        </span>
      )}
    </Button>
  )
}
