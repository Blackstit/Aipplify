"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/Footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, User, Building2, Loader2, ShieldCheck } from "lucide-react"
import { trackLogin, trackSignUp } from "@/lib/analytics"

type Step = "auth" | "verify"

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("auth")
  const [pendingEmail, setPendingEmail] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [activeTab, setActiveTab] = useState<"job-seeker" | "recruiter">("job-seeker")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register state
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerCompanyName, setRegisterCompanyName] = useState("")

  // Verification code
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""])
  const codeRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
  ]

  const handleCodeDigit = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...codeDigits]
    next[index] = value.slice(-1)
    setCodeDigits(next)
    if (value && index < 5) codeRefs[index + 1].current?.focus()
  }
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) codeRefs[index - 1].current?.focus()
  }
  const handleCodePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (text.length === 6) { setCodeDigits(text.split("")); codeRefs[5].current?.focus() }
  }

  const afterAuth = (user: { type: string }) => {
    localStorage.setItem("user", JSON.stringify(user))
    window.dispatchEvent(new Event("user-changed"))
    router.push(user.type === "RECRUITER" ? "/for-recruiters" : "/jobs")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await response.json()
      if (data.requiresVerification) { setPendingEmail(data.email); setStep("verify"); setLoading(false); return }
      if (!response.ok) { setError(data.error || "Login failed"); setLoading(false); return }
      trackLogin(data.user?.type ?? "CANDIDATE")
      afterAuth(data.user)
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
      const response = await fetch("/api/auth/register", {
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
      const data = await response.json()
      if (!response.ok) { setError(data.error || "Registration failed"); setLoading(false); return }
      if (data.requiresVerification) { setPendingEmail(data.email); setStep("verify"); setLoading(false); return }
      trackSignUp(activeTab === "recruiter" ? "RECRUITER" : "CANDIDATE")
      afterAuth(data.user)
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
      afterAuth(data.user)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                <div className="h-8 w-8 bg-gradient-primary rounded"></div>
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Aipplify</span>
              </Link>
            </div>
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center space-y-3 pb-2">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">Check your email</h1>
                  <p className="text-gray-600 text-sm">
                    We sent a 6-digit code to <span className="font-medium text-foreground">{pendingEmail}</span>
                  </p>
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm text-center">
                    {error}
                  </div>
                )}
                <form onSubmit={handleVerify} className="space-y-6 pt-2">
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
                        className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:border-primary focus:outline-none transition-colors bg-background"
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
                    <button type="button" onClick={() => { setStep("auth"); setError("") }} className="text-primary hover:underline">
                      Go back
                    </button>
                  </p>
                </form>
              </CardHeader>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gradient-primary rounded"></div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Aipplify
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Sign in to your account or create a new one"
                : "Sign up to get started"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <Tabs 
                value={activeTab} 
                onValueChange={(v) => setActiveTab(v as "job-seeker" | "recruiter")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="job-seeker">Job Seeker</TabsTrigger>
                  <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
                </TabsList>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {isLogin ? (
                  <>
                    <TabsContent value="job-seeker" className="space-y-4 mt-0">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-js">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email-js"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-js">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password-js"
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                        <div className="text-center text-sm">
                          <span className="text-gray-600">Don't have an account? </span>
                          <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className="text-primary hover:underline"
                          >
                            Sign Up
                          </button>
                        </div>
                        <div className="text-center text-sm">
                          <Link href="#" className="text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="recruiter" className="space-y-4 mt-0">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email-rec">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email-rec"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-rec">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password-rec"
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In as Recruiter"
                          )}
                        </Button>
                        <div className="text-center text-sm">
                          <span className="text-gray-600">Don't have an account? </span>
                          <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className="text-primary hover:underline"
                          >
                            Sign Up
                          </button>
                        </div>
                        <div className="text-center text-sm">
                          <Link href="#" className="text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                      </form>
                    </TabsContent>
                  </>
                ) : (
                  <>
                    <TabsContent value="job-seeker" className="space-y-4 mt-0">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name-js">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="name-js"
                              type="text"
                              placeholder="John Doe"
                              className="pl-10"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-reg-js">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email-reg-js"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-reg-js">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password-reg-js"
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                              minLength={6}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Sign Up"
                          )}
                        </Button>
                        <div className="text-center text-sm">
                          <span className="text-gray-600">Already have an account? </span>
                          <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className="text-primary hover:underline"
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="recruiter" className="space-y-4 mt-0">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company Name</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="company"
                              type="text"
                              placeholder="Your Company"
                              className="pl-10"
                              value={registerCompanyName}
                              onChange={(e) => setRegisterCompanyName(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name-rec-reg">Your Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="name-rec-reg"
                              type="text"
                              placeholder="John Doe"
                              className="pl-10"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email-rec-reg">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email-rec-reg"
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password-rec-reg">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password-rec-reg"
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                              minLength={6}
                              disabled={loading}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Sign Up as Recruiter"
                          )}
                        </Button>
                        <div className="text-center text-sm">
                          <span className="text-gray-600">Already have an account? </span>
                          <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className="text-primary hover:underline"
                          >
                            Sign In
                          </button>
                        </div>
                      </form>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
