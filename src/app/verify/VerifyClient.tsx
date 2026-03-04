
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/ui/logo"
import { verifyAndCreateUser } from "./actions"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Mail } from "lucide-react"
import { Dictionary } from "@/lib/dictionary"

export function VerifyClient({ dictionary }: { dictionary: Dictionary }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, setIsPending] = useState(false)

  const email = searchParams.get("email")
  const name = searchParams.get("name")
  const phone = searchParams.get("phone")
  const password = searchParams.get("password")
  const taxId = searchParams.get("taxId")

  if (!email || !password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{dictionary.verify.invalid_session}</p>
            <Button onClick={() => router.push('/login')} className="mt-4">{dictionary.verify.go_login}</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    // Append hidden fields
    formData.append("email", email)
    formData.append("name", name || "")
    formData.append("phone", phone || "")
    formData.append("password", password)
    formData.append("taxId", taxId || "")

    const result = await verifyAndCreateUser(formData)

    setIsPending(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Account verified successfully!")
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-zinc-200">
        <CardHeader className="space-y-2 pb-6 bg-zinc-50 border-b border-zinc-100">
          <div className="text-center mb-4 flex justify-center">
            <Logo variant="dark" className="scale-125" />
          </div>
          <CardTitle className="text-xl font-bold text-center text-zinc-800">
            {dictionary.verify.title}
          </CardTitle>
          <CardDescription className="text-center text-zinc-500">
            {dictionary.verify.desc} <span className="font-bold text-zinc-900">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center py-2">
              <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="text-center block">{dictionary.verify.code_label}</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="123456"
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {dictionary.verify.submit}
            </Button>

            <p className="text-xs text-center text-zinc-400">
              {dictionary.verify.not_received}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
