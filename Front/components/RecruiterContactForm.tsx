"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Send, User } from "lucide-react"

export function RecruiterContactForm() {
  const [name, setName] = useState("")
  const [contactMethod, setContactMethod] = useState("")
  const [contactValue, setContactValue] = useState("")
  const [message, setMessage] = useState("")

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

        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Not sure how to post your vacancy?
          </h3>
          <p className="text-sm text-gray-600">
            Leave your name and contact details, and our manager will reach out to guide you.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">*Name</Label>
            <Input
              id="name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-method">*Contact method</Label>
            <div className="flex gap-2">
              <Select value={contactMethod} onValueChange={setContactMethod}>
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
            />
          </div>

          <Button className="w-full bg-primary hover:bg-primary-hover">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
