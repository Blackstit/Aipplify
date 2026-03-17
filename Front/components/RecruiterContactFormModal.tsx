"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, User } from "lucide-react"

interface RecruiterContactFormModalProps {
  onClose?: () => void
}

export function RecruiterContactFormModal({ onClose }: RecruiterContactFormModalProps) {
  const [name, setName] = useState("")
  const [contactMethod, setContactMethod] = useState("")
  const [contactValue, setContactValue] = useState("")
  const [message, setMessage] = useState("")

  const getPlaceholder = () => {
    switch (contactMethod) {
      case "telegram":
        return "@username"
      case "whatsapp":
        return "+1234567890"
      case "email":
        return "your@email.com"
      default:
        return ""
    }
  }

  const getInputType = () => {
    if (contactMethod === "email") return "email"
    if (contactMethod === "whatsapp") return "tel"
    return "text"
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

      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault()
        // Handle form submission
        onClose?.()
      }}>
        <div className="space-y-2">
          <Label htmlFor="name">*Name</Label>
          <Input
            id="name"
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-method">*Contact method</Label>
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
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">*Message</Label>
          <textarea
            id="message"
            className="flex min-h-[100px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Let us know how we can help..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-gradient-primary hover:bg-gradient-primary-hover text-white">
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact
        </Button>
      </form>
    </div>
  )
}
