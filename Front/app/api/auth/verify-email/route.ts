import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, code } = verifySchema.parse(body)

    const record = await prisma.verificationCode.findFirst({
      where: { email, code },
    })

    if (!record) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
    }

    if (record.expiresAt < new Date()) {
      await prisma.verificationCode.delete({ where: { id: record.id } })
      return NextResponse.json({ error: "Code has expired. Please register again." }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationCode.delete({ where: { id: record.id } })

    // Link any existing anonymous visitor cookie to this user so their
    // pre-registration activity shows up in the admin activity view.
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
          // non-fatal
        }
      }
    }

    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    console.error("Verify email error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
