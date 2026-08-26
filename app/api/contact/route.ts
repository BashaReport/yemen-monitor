import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactBody = {
  name?: string;
  email?: string;
  organization?: string;
  subject?: string;
  message?: string;
  website?: string;
};

function clean(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

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

    const body =
      (await request.json()) as ContactBody;

    const name = clean(
      body.name
    );

    const email = clean(
      body.email
    );

    const organization = clean(
      body.organization
    );

    const subject =
      clean(body.subject) ||
      "General inquiry";

    const message = clean(
      body.message
    );

    const website = clean(
      body.website
    );

    /*
     * Honeypot field for basic
     * spam protection.
     */
    if (website) {
      return NextResponse.json({
        ok: true,
      });
    }

    if (
      !name ||
      !email ||
      !message
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Name, email and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!validEmail(email)) {
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

    const safeName =
      escapeHtml(name);

    const safeEmail =
      escapeHtml(email);

    const safeOrganization =
      escapeHtml(
        organization ||
          "Not provided"
      );

    const safeSubject =
      escapeHtml(subject);

    const safeMessage =
      escapeHtml(
        message
      ).replace(
        /\n/g,
        "<br />"
      );

    const emailSubject =
      subject
        ? `Basha Report inquiry: ${subject}`
        : `Basha Report inquiry from ${name}`;

    const html = `
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
                  Your reply will go to ${safeEmail}.
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
    `;

    const text = `
New Basha Report Yemen Monitor inquiry

Name: ${name}
Email: ${email}
Organization: ${organization || "Not provided"}
Subject: ${subject}

Message:

${message}

Reply to this email to respond directly to ${email}.
    `.trim();

    const resendResponse =
      await fetch(
        "https://api.resend.com/emails",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            from:
              `Basha Report Yemen Monitor <${fromEmail}>`,

            to: [
              toEmail,
            ],

            reply_to:
              email,

            subject:
              emailSubject,

            html,

            text,
          }),
        }
      );

    const result =
      await resendResponse.json();

    if (!resendResponse.ok) {
      console.error(
        "Resend error",
        resendResponse.status,
        result
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
      result?.id
    );

    return NextResponse.json({
      ok: true,
      id: result?.id || null,
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
