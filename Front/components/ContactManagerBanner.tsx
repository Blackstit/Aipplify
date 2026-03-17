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
      <Card className="bg-gradient-primary border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon on the left */}
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Headphones className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* Text content and button */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                Need help publishing a vacancy?
              </h3>
              <p className="text-sm text-white/90 mb-4">
                Our manager can help you write and post it the right way.
              </p>
              <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50 shadow-sm"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-gray-900" />
                Contact manager
              </Button>
            </div>
          </div>
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
