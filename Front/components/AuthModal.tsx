"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, User, Building2, Loader2, ShieldCheck } from "lucide-react"

type Step = "auth" | "verify"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<Step>("auth")
  const [pendingEmail, setPendingEmail] = useState("")

  const [isLogin, setIsLogin] = useState(true)
  const [activeTab, setActiveTab] = useState<"job-seeker" | "recruiter">("job-seeker")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerCompanyName, setRegisterCompanyName] = useState("")

  // Verification code — 6 separate inputs
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""])
  const codeRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleCodeDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...codeDigits]
    next[index] = value.slice(-1)
    setCodeDigits(next)
    if (value && index < 5) codeRefs[index + 1].current?.focus()
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeRefs[index - 1].current?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (text.length === 6) {
      setCodeDigits(text.split(""))
      codeRefs[5].current?.focus()
    }
  }

  const handleSuccess = (user: object) => {
    localStorage.setItem("user", JSON.stringify(user))
    window.dispatchEvent(new Event("user-changed"))
    onOpenChange(false)
    setStep("auth")
    setCodeDigits(["", "", "", "", "", ""])
    onSuccess?.()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (data.requiresVerification) {
        setPendingEmail(data.email)
        setStep("verify")
        setLoading(false)
        return
      }
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return }
      handleSuccess(data.user)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
          userType: activeTab === "recruiter" ? "RECRUITER" : "CANDIDATE",
          companyName: activeTab === "recruiter" ? registerCompanyName : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return }
      if (data.requiresVerification) {
        setPendingEmail(data.email)
        setStep("verify")
        setLoading(false)
        return
      }
      handleSuccess(data.user)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = codeDigits.join("")
    if (code.length < 6) { setError("Please enter the full 6-digit code"); return }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Verification failed"); setLoading(false); return }
      handleSuccess(data.user)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setLoading(true)
    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, password: "__resend__" }),
      })
    } finally {
      setLoading(false)
    }
    // Trigger resend via register endpoint
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: pendingEmail,
        password: "__resend_trigger__",
        name: "x",
        userType: "CANDIDATE",
      }),
    })
    const data = await res.json()
    if (data.requiresVerification) {
      setError("")
      setCodeDigits(["", "", "", "", "", ""])
      codeRefs[0].current?.focus()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setStep("auth"); setError(""); setCodeDigits(["","","","","",""]) } }}>
      <DialogContent className="sm:max-w-md">

        {step === "verify" ? (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <DialogTitle className="text-center">Check your email</DialogTitle>
              <DialogDescription className="text-center">
                We sent a 6-digit code to <span className="font-medium text-foreground">{pendingEmail}</span>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerify} className="space-y-6 pt-2">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                {codeDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={codeRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeDigit(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-11 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-primary focus:outline-none transition-colors bg-background"
                    style={{ borderColor: digit ? "hsl(var(--primary))" : undefined }}
                    disabled={loading}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={loading || codeDigits.join("").length < 6}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : "Verify Email"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Didn't receive the code?{" "}
                <button type="button" onClick={handleResend} className="text-primary hover:underline" disabled={loading}>
                  Resend
                </button>
              </p>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isLogin ? "Sign in to your account" : "Create an account"}</DialogTitle>
              <DialogDescription>
                {isLogin
                  ? "Sign in to save jobs and track your applications."
                  : "Create a free account to save jobs and apply."}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "job-seeker" | "recruiter")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="job-seeker">Job Seeker</TabsTrigger>
                <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              {isLogin ? (
                <TabsContent value={activeTab} className="space-y-4 mt-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="your@email.com" className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={loading} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="••••••••" className="pl-10" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required disabled={loading} />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                      Don't have an account?{" "}
                      <button type="button" onClick={() => { setIsLogin(false); setError("") }} className="text-primary hover:underline">Sign Up</button>
                    </p>
                  </form>
                </TabsContent>
              ) : (
                <TabsContent value={activeTab} className="space-y-4 mt-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {activeTab === "recruiter" && (
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="text" placeholder="Your Company" className="pl-10" value={registerCompanyName} onChange={(e) => setRegisterCompanyName(e.target.value)} required disabled={loading} />
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="text" placeholder="John Doe" className="pl-10" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required disabled={loading} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="your@email.com" className="pl-10" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required disabled={loading} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input type="password" placeholder="••••••••" className="pl-10" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required minLength={6} disabled={loading} />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Sign Up"}
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                      Already have an account?{" "}
                      <button type="button" onClick={() => { setIsLogin(true); setError("") }} className="text-primary hover:underline">Sign In</button>
                    </p>
                  </form>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
