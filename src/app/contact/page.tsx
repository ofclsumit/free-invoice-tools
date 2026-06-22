"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Send, CheckCircle2 } from "lucide-react"
import { SiteLogo } from "@/components/shared/site-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-mesh py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <SiteLogo className="mb-12" />
          <div className="glass-card p-12">
            <div className="h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2">Message Sent!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out. We&apos;ll get back to you within 24 hours.
            </p>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh py-12 px-4">
      <div className="max-w-xl mx-auto">
        <SiteLogo className="mb-8" />

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Contact Us</h1>
            <p className="text-sm text-muted-foreground">We&apos;d love to hear from you</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="How can we help you?"
                rows={5}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Prefer email? Write to{" "}
          <a href="mailto:support@quoteflow.in" className="text-primary hover:underline">
            support@quoteflow.in
          </a>
        </div>
      </div>
    </div>
  )
}
