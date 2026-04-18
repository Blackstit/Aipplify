import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || "Aipplify <noreply@aipplify.com>"

export async function sendVerificationEmail(email: string, code: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email – Aipplify</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 48px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.2);border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:800;line-height:36px;">A</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Aipplify</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 0;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;color:#18181b;letter-spacing:-0.5px;">Verify your email address</h1>
              <p style="margin:0 0 32px;font-size:16px;color:#71717a;line-height:1.6;">
                Thanks for signing up! Use the code below to confirm your email and activate your Aipplify account.
              </p>

              <!-- Code block -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#fafafa;border:2px dashed #e4e4e7;border-radius:12px;padding:28px 0;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#a1a1aa;">Your verification code</p>
                    <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#6366f1;font-variant-numeric:tabular-nums;">${code}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:14px;color:#a1a1aa;text-align:center;">
                This code expires in <strong style="color:#71717a;">15 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 48px 0;">
              <hr style="border:none;border-top:1px solid #f4f4f5;margin:0;" />
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:24px 48px 40px;">
              <p style="margin:0;font-size:13px;color:#a1a1aa;line-height:1.6;">
                If you didn't create an account on Aipplify, you can safely ignore this email — no action is needed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fafafa;border-top:1px solid #f4f4f5;padding:24px 48px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;color:#a1a1aa;">
                      © ${new Date().getFullYear()} Aipplify. AI-powered job search.
                    </p>
                  </td>
                  <td align="right">
                    <a href="https://aipplify.com" style="font-size:12px;color:#6366f1;text-decoration:none;">aipplify.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your Aipplify verification code",
    html,
  })
}
