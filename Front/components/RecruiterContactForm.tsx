"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, User, CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export function RecruiterContactForm() {
  const [name, setName] = useState("")
  const [contactMethod, setContactMethod] = useState("")
  const [contactValue, setContactValue] = useState("")
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
          contactMethod,
          contactValue,
          message,
          source: "RECRUITER_FORM",
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

  return (
    <Card className="bg-white border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
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

        {status === "sent" ? (
          <div className="flex flex-col items-center text-center py-4 space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Got your message!</h3>
            <p className="text-sm text-gray-600">
              Our manager will reach out to you shortly.
            </p>
            <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
              Send another
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Not sure how to post your vacancy?
              </h3>
              <p className="text-sm text-gray-600">
                Leave your name and contact details, and our manager will reach out to guide you.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="rcf-name">*Name</Label>
                <Input
                  id="rcf-name"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rcf-contact-method">*Contact method</Label>
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
                    type={contactMethod === "email" ? "email" : contactMethod === "whatsapp" ? "tel" : "text"}
                    placeholder={
                      contactMethod === "telegram" ? "@username" :
                      contactMethod === "whatsapp" ? "+1234567890" :
                      contactMethod === "email" ? "your@email.com" : ""
                    }
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
                <Label htmlFor="rcf-message">*Message</Label>
                <textarea
                  id="rcf-message"
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
                className="w-full bg-primary hover:bg-primary-hover"
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
