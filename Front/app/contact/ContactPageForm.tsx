"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export function ContactPageForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorText, setErrorText] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === "sending") return
    setStatus("sending")
    setErrorText(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          source: "CONTACT_PAGE",
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorText(data.error || "Failed to send. Please try again.")
        return
      }
      setStatus("sent")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch {
      setStatus("error")
      setErrorText("Network error. Please try again.")
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center text-center py-6 space-y-3">
        <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Message received</h3>
        <p className="text-sm text-gray-600 max-w-sm">
          Thanks for reaching out! We&apos;ve logged your request and will get back to you shortly.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="What's this about?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          className="flex min-h-[120px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={5}
          maxLength={5000}
        />
      </div>
      {status === "error" && errorText && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-rose-50 border border-rose-200 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorText}</span>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  )
}
