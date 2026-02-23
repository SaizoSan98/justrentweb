"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

export function ContactForm() {
  const searchParams = useSearchParams()
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
    
    // Simulate form submission for now
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success("Message sent successfully! We will contact you shortly.")
    setIsSubmitting(false)
    
    // Reset form (optional, maybe keep it filled?)
    // setSubject("")
    // setMessage("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-900/5">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Send us a message</h3>
        <p className="text-zinc-500">We usually respond within 24 hours.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="John Doe" required className="bg-zinc-50 border-zinc-200" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john@example.com" required className="bg-zinc-50 border-zinc-200" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input id="phone" type="tel" placeholder="+36..." className="bg-zinc-50 border-zinc-200" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input 
          id="subject" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="How can we help?" 
          required 
          className="bg-zinc-50 border-zinc-200"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Your message..." 
          required 
          className="min-h-[150px] bg-zinc-50 border-zinc-200"
        />
      </div>

      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
