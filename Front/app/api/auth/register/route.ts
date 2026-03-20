import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/auth"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  userType: z.enum(["CANDIDATE", "RECRUITER"]),
  companyName: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.userType,
      validatedData.companyName
    )

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        message: "User registered successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    )
  }
}
