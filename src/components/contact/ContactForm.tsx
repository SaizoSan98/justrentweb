"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

import { submitContactForm } from "@/app/actions/contact"

export function ContactForm({ dictionary }: { dictionary?: any }) {
  const searchParams = useSearchParams()
  const t = (key: string) => dictionary?.contact?.form?.[key] || key;
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const carName = searchParams.get("carName")
    const duration = searchParams.get("duration")
    const price = searchParams.get("price")

    if (carName) {
      setSubject(`Inquiry: ${carName}`)

      if (duration && price) {
        setMessage(`I am interested in renting the ${carName} for ${duration} months at €${price}/month.\n\nPlease provide more information about availability and the next steps.`)
      } else {
        setMessage(`I am interested in renting the ${carName}.\n\nPlease provide more information.`)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await submitContactForm(formData)

    if (result.success) {
      toast.success(t('success'))
      // Optional: Reset form
      // setSubject("")
      // setMessage("")
    } else {
      toast.error(result.error || t('error'))
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-900/5">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">{t('title')}</h3>
        <p className="text-zinc-500">{t('subtitle')}</p>
      </div>

      {/* Honeypot field - visually hidden to humans, attractive to bots */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="lastName">Last Name</Label>
        <Input id="lastName" name="lastName" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('name')}</Label>
          <Input id="name" name="name" placeholder="John Doe" required className="bg-zinc-50 border-zinc-200" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" required className="bg-zinc-50 border-zinc-200" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('phone')}</Label>
        <Input id="phone" name="phone" type="tel" placeholder="+36..." className="bg-zinc-50 border-zinc-200" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{t('subject')}</Label>
        <Input
          id="subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t('subject_placeholder')}
          required
          className="bg-zinc-50 border-zinc-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('message')}</Label>
        <Textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('message_placeholder')}
          required
          className="min-h-[150px] bg-zinc-50 border-zinc-200"
        />
      </div>

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('sending')}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {t('send')}
          </>
        )}
      </Button>
    </form>
  )
}
