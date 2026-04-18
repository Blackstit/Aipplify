import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  userType: z.enum(["CANDIDATE", "RECRUITER"]),
  companyName: z.string().optional(),
})

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      // If already registered but not verified — resend code
      if (!existingUser.emailVerified) {
        const code = generateCode()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

        await prisma.verificationCode.deleteMany({ where: { email: validatedData.email } })
        await prisma.verificationCode.create({ data: { email: validatedData.email, code, expiresAt } })
        await sendVerificationEmail(validatedData.email, code)

        return NextResponse.json({ requiresVerification: true, email: validatedData.email }, { status: 200 })
      }

      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.userType,
      validatedData.companyName
    )

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.verificationCode.deleteMany({ where: { email: validatedData.email } })
    await prisma.verificationCode.create({ data: { email: validatedData.email, code, expiresAt } })
    await sendVerificationEmail(validatedData.email, code)

    return NextResponse.json({ requiresVerification: true, email: validatedData.email }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Validation error" }, { status: 400 })
    }

    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
