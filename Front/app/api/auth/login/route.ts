import { NextResponse } from "next/server"
import { getUserByEmail, verifyPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Find user
    const user = await getUserByEmail(validatedData.email)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.passwordHash
    )
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Account is not active" },
        { status: 403 }
      )
    }

    // Check email verification
    if (!user.emailVerified) {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      await prisma.verificationCode.deleteMany({ where: { email: user.email } })
      await prisma.verificationCode.create({ data: { email: user.email, code, expiresAt } })
      await sendVerificationEmail(user.email, code)
      return NextResponse.json(
        { requiresVerification: true, email: user.email },
        { status: 403 }
      )
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // If the client already has an anonymous visitor cookie, stamp the user id
    // onto it so the admin activity view can show their devices / referrers.
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const m = cookieHeader.match(/(?:^|;\s*)aipplify_vid=([^;]+)/)
      if (m?.[1]) {
        const visitorId = decodeURIComponent(m[1])
        try {
          await prisma.visitor.updateMany({
            where: { id: visitorId },
            data: { userId: user.id },
          })
        } catch {
          // non-fatal — auth should still succeed
        }
      }
    }

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      )
    }

    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    )
  }
}
