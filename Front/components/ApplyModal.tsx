"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, X, AlertCircle, Handshake, HelpCircle } from "lucide-react"
import Link from "next/link"

interface ApplyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobTitle: string
  jobSlug: string
  recruiterContact?: string // Telegram username, email, or phone
  onApply: () => void
}

export function ApplyModal({
  open,
  onOpenChange,
  jobTitle,
  jobSlug,
  recruiterContact,
  onApply,
}: ApplyModalProps) {
  const [copied, setCopied] = useState(false)
  const [warningDismissed, setWarningDismissed] = useState(false)

  // Default contact if not provided
  const contact = recruiterContact || "@anastasias_recruiter"
  
  // Determine contact type and create URL
  let contactUrl = ""
  let isTelegram = false
  let isEmail = false
  
  if (contact.startsWith("@")) {
    isTelegram = true
    contactUrl = `https://t.me/${contact.replace("@", "")}`
  } else if (contact.includes("t.me/")) {
    isTelegram = true
    const username = contact.includes("t.me/") 
      ? contact.split("t.me/")[1].split("?")[0]
      : contact.replace("@", "")
    contactUrl = `https://t.me/${username}`
  } else if (contact.includes("@") && !contact.includes(" ")) {
    isEmail = true
    contactUrl = `mailto:${contact}`
  } else if (/^\+?[\d\s\-\(\)]+$/.test(contact.replace(/\s/g, ""))) {
    contactUrl = `tel:${contact}`
  } else {
    // Default to Telegram if unclear
    isTelegram = true
    const username = contact.replace(/[@\s]/g, "")
    contactUrl = `https://t.me/${username}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(contact)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleContactClick = () => {
    onApply() // Save application when user clicks contact link
    window.open(contactUrl, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Links:</DialogTitle>
        </DialogHeader>

        {/* Info bar */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm text-gray-600">
          <span>Your application will be saved to history when you follow the links</span>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Contact section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Recruiter Contact:</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
              {contact}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="flex-shrink-0"
            >
              <Copy className={`h-4 w-4 ${copied ? "text-green-600" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleContactClick}
              className="flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warning section */}
        {!warningDismissed && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-red-900">
                  Do not log in with your accounts (Apple, Google, etc.) on platforms at the request of the employer. Do not send verification codes. Do not send money.
                </p>
                <Link
                  href="/guide/scam-protection"
                  className="text-sm text-red-700 hover:text-red-900 underline"
                >
                  Guide: How to protect yourself from scammers
                </Link>
              </div>
              <button
                onClick={() => setWarningDismissed(true)}
                className="text-red-400 hover:text-red-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={() => setWarningDismissed(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              Got it
            </Button>
          </div>
        )}

        {/* Tips section */}
        <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Handshake className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-900">
              Don't forget to attach a link to this job posting, write a cover letter, and be polite ❤️ Always attach your CV to the first message!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            href="/help/links-not-working"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Links not working</span>
          </Link>
          <div className="text-sm text-gray-600">
            Like Aipplify? Tell your friends 😊
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
