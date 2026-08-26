import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const organization =
      typeof body.organization === "string"
        ? body.organization.trim()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const website =
      typeof body.website === "string"
        ? body.website.trim()
        : "";

    // Honeypot field for basic spam protection.
    if (website) {
      return NextResponse.json({
        ok: true,
      });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Name, email, and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      name.length > 120 ||
      email.length > 200 ||
      organization.length > 200 ||
      subject.length > 200 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "One or more fields are too long.",
        },
        {
          status: 400,
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey =
      process.env.RESEND_API_KEY;

    const toEmail =
      process.env.CONTACT_TO_EMAIL;

    const fromEmail =
      process.env.CONTACT_FROM_EMAIL;

    if (
      !apiKey ||
      !toEmail ||
      !fromEmail
    ) {
      console.error(
        "Contact email environment variables are missing."
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Email service is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const safeName =
      escapeHtml(name);

    const safeEmail =
      escapeHtml(email);

    const safeOrganization =
      escapeHtml(
        organization || "Not provided"
      );

    const safeSubject =
      escapeHtml(
        subject || "General inquiry"
      );

    const safeMessage =
      escapeHtml(message).replace(
        /\n/g,
        "<br />"
      );

    const emailSubject = subject
      ? `Basha Report inquiry: ${subject}`
      : `Basha Report inquiry from ${name}`;

    const { data, error } =
      await resend.emails.send({
        from: `Basha Report Yemen Monitor <${fromEmail}>`,

        to: [toEmail],

        replyTo: email,

        subject: emailSubject,

        html: `
          <!doctype html>
          <html>
            <body
              style="
                margin:0;
                padding:0;
                background:#f5efe6;
                font-family:Arial,Helvetica,sans-serif;
                color:#321313;
              "
            >
              <div
                style="
                  max-width:680px;
                  margin:0 auto;
                  padding:32px 18px;
                "
              >
                <div
                  style="
                    background:#ffffff;
                    border:1px solid #e5d8c8;
                    border-radius:12px;
                    overflow:hidden;
                  "
                >
                  <div
                    style="
                      background:#320303;
                      color:#ffffff;
                      padding:22px 26px;
                    "
                  >
                    <div
                      style="
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:1.5px;
                        color:#d8ad65;
                        text-transform:uppercase;
                        margin-bottom:8px;
                      "
                    >
                      Basha Report Intelligence
                    </div>

                    <div
                      style="
                        font-family:Georgia,serif;
                        font-size:25px;
                        line-height:1.2;
                      "
                    >
                      New Yemen Monitor Inquiry
                    </div>
                  </div>

                  <div
                    style="
                      padding:26px;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        border-collapse:collapse;
                        margin-bottom:24px;
                      "
                    >
                      <tr>
                        <td
                          style="
                            padding:9px 0;
                            width:130px;
                            color:#806e67;
                            font-size:12px;
                            font-weight:700;
                          "
                        >
                          NAME
                        </td>

                        <td
                          style="
                            padding:9px 0;
                            font-size:14px;
                          "
                        >
                          ${safeName}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:9px 0;
                            color:#806e67;
                            font-size:12px;
                            font-weight:700;
                          "
                        >
                          EMAIL
                        </td>

                        <td
                          style="
                            padding:9px 0;
                            font-size:14px;
                          "
                        >
                          ${safeEmail}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:9px 0;
                            color:#806e67;
                            font-size:12px;
                            font-weight:700;
                          "
                        >
                          ORGANIZATION
                        </td>

                        <td
                          style="
                            padding:9px 0;
                            font-size:14px;
                          "
                        >
                          ${safeOrganization}
                        </td>
                      </tr>

                      <tr>
                        <td
                          style="
                            padding:9px 0;
                            color:#806e67;
                            font-size:12px;
                            font-weight:700;
                          "
                        >
                          SUBJECT
                        </td>

                        <td
                          style="
                            padding:9px 0;
                            font-size:14px;
                          "
                        >
                          ${safeSubject}
                        </td>
                      </tr>
                    </table>

                    <div
                      style="
                        border-top:1px solid #eadfd3;
                        padding-top:22px;
                      "
                    >
                      <div
                        style="
                          color:#a86604;
                          font-size:11px;
                          font-weight:700;
                          letter-spacing:1px;
                          text-transform:uppercase;
                          margin-bottom:10px;
                        "
                      >
                        Message
                      </div>

                      <div
                        style="
                          font-family:Georgia,serif;
                          font-size:16px;
                          line-height:1.7;
                          color:#3c2522;
                        "
                      >
                        ${safeMessage}
                      </div>
                    </div>

                    <div
                      style="
                        margin-top:26px;
                        padding:14px 16px;
                        background:#f7f1e9;
                        border-radius:8px;
                        color:#6c5a54;
                        font-size:12px;
                        line-height:1.5;
                      "
                    >
                      Reply directly to this email to respond to ${safeName}.
                      Your reply will be addressed to ${safeEmail}.
                    </div>
                  </div>
                </div>

                <div
                  style="
                    text-align:center;
                    color:#8b7971;
                    font-size:11px;
                    padding:18px;
                  "
                >
                  Sent through Basha Report Yemen Monitor
                </div>
              </div>
            </body>
          </html>
        `,

        text: `
New Basha Report Yemen Monitor inquiry

Name: ${name}
Email: ${email}
Organization: ${organization || "Not provided"}
Subject: ${subject || "General inquiry"}

Message:

${message}

Reply to this email to respond directly to ${email}.
        `.trim(),
      });

    if (error) {
      console.error(
        "Resend error",
        error
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to send your message right now.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Contact message sent",
      data?.id
    );

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Contact API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to send your message right now.",
      },
      {
        status: 500,
      }
    );
  }
}
