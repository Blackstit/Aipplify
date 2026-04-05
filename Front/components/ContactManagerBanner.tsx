"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Headphones, MessageCircle } from "lucide-react"
import { RecruiterContactFormModal } from "./RecruiterContactFormModal"

export function ContactManagerBanner() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Card className="bg-gradient-primary border-0 overflow-hidden">
        <CardContent className="p-5 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <Headphones className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5 leading-tight">
            Need help publishing a vacancy?
          </h3>
          <p className="text-xs text-white/80 mb-3 leading-relaxed">
            Our manager can help you write and post it the right way.
          </p>
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            size="sm"
            className="bg-white border-0 text-gray-900 hover:bg-gray-50 shadow-sm text-xs h-8 w-full"
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Contact manager
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <RecruiterContactFormModal onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
