"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/Footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Lock, User, Building2, Loader2 } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setLoading(false)
        return
      }

      // Save user to localStorage (temporary, later use proper session)
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // Dispatch custom event to update Header
      window.dispatchEvent(new Event("user-changed"))
      
      // Redirect based on user type
      if (data.user.type === "RECRUITER") {
        router.push("/for-recruiters")
      } else {
        router.push("/jobs")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
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

      if (!response.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Auto login after registration
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // Dispatch custom event to update Header
      window.dispatchEvent(new Event("user-changed"))
      
      // Redirect based on user type
      if (data.user.type === "RECRUITER") {
        router.push("/for-recruiters")
      } else {
        router.push("/jobs")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
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
