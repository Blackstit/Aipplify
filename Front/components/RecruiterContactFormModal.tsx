"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, User, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

interface RecruiterContactFormModalProps {
  onClose?: () => void
}

export function RecruiterContactFormModal({ onClose }: RecruiterContactFormModalProps) {
  const [name, setName] = useState("")
  const [contactMethod, setContactMethod] = useState("")
  const [contactValue, setContactValue] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errorText, setErrorText] = useState<string | null>(null)

  const getPlaceholder = () => {
    switch (contactMethod) {
      case "telegram": return "@username"
      case "whatsapp": return "+1234567890"
      case "email": return "your@email.com"
      default: return ""
    }
  }

  const getInputType = () => {
    if (contactMethod === "email") return "email"
    if (contactMethod === "whatsapp") return "tel"
    return "text"
  }

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
          contactMethod,
          contactValue,
          message,
          source: "RECRUITER_BANNER",
          pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("error")
        setErrorText(data.error || "Failed to send.")
        return
      }
      setStatus("sent")
      setName(""); setContactMethod(""); setContactValue(""); setMessage("")
    } catch {
      setStatus("error")
      setErrorText("Network error. Please try again.")
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center text-center py-8 space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Got your message!</h3>
        <p className="text-sm text-gray-600 max-w-sm">
          Thanks for reaching out. Our manager will contact you via{" "}
          <span className="font-medium">{contactMethod || "the method you provided"}</span>{" "}
          shortly.
        </p>
        <Button onClick={() => onClose?.()} className="w-full bg-gradient-primary hover:bg-gradient-primary-hover text-white">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Olga Novikova</p>
          <p className="text-sm text-gray-600">Talent Partner</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Not sure how to post your vacancy?
        </h3>
        <p className="text-sm text-gray-600">
          Leave your name and contact details, and our manager will reach out to guide you.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="rcfm-name">*Name</Label>
          <Input
            id="rcfm-name"
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rcfm-contact-method">*Contact method</Label>
          <div className="flex gap-2">
            <Select value={contactMethod} onValueChange={setContactMethod} required>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type={getInputType()}
              placeholder={getPlaceholder()}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              className="flex-1"
              required
              disabled={!contactMethod}
              maxLength={200}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rcfm-message">*Message</Label>
          <textarea
            id="rcfm-message"
            className="flex min-h-[100px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Let us know how we can help..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            minLength={5}
            maxLength={5000}
          />
        </div>

        {status === "error" && errorText && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-primary hover:bg-gradient-primary-hover text-white"
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
