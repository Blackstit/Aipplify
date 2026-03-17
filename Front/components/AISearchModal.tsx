"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"

interface AISearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AISearchModal({ open, onOpenChange }: AISearchModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Coming soooooon</DialogTitle>
          <DialogDescription className="text-center pt-4">
            We're working on an amazing AI-powered search feature that will help you find the perfect job faster than ever!
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 text-center">
          <p className="text-sm text-gray-600">
            Stay tuned for updates. This feature will revolutionize how you search for jobs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
