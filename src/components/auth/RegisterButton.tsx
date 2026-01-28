"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function RegisterButton() {
  const { pending } = useFormStatus()

  return (
    <Button 
      type="submit" 
      className="w-full bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95 shadow-lg"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </Button>
  )
}
