import { NextResponse } from "next/server";

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

    if (!apiKey) {
      console.error(
        "RESEND_API_KEY is missing"
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Contact service is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (!toEmail) {
      console.error(
        "CONTACT_TO_EMAIL is missing"
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Contact destination is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (!fromEmail) {
      console.error(
        "CONTACT_FROM_EMAIL is missing"
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Contact sender is not configured.",
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
      "Yemen Monitor inquiry";

    const message = clean(
      body.message
    );

    const website = clean(
      body.website
    );

    /*
     * Honeypot field.
     * Real visitors will never fill this.
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

    if (name.length > 120) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (email.length > 200) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Email address is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      organization.length > 200
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Organization name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Subject is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Message is too long.",
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
      escapeHtml(organization);

    const safeSubject =
      escapeHtml(subject);

    const safeMessage =
      escapeHtml(message).replace(
        /\n/g,
        "<br />"
      );

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
              `Yemen Monitor <${fromEmail}>`,

            to: [
              toEmail,
            ],

            reply_to:
              email,

            subject:
              `[Yemen Monitor] ${subject}`,

            html: `
              <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#2d201d;">
                <h2 style="color:#320303;">
                  Yemen Monitor Contact Request
                </h2>

                <p>
                  <strong>Name</strong><br />
                  ${safeName}
                </p>

                <p>
                  <strong>Email</strong><br />
                  ${safeEmail}
                </p>

                <p>
                  <strong>Organization</strong><br />
                  ${
                    safeOrganization ||
                    "Not provided"
                  }
                </p>

                <p>
                  <strong>Subject</strong><br />
                  ${safeSubject}
                </p>

                <hr style="border:0;border-top:1px solid #ddd;margin:24px 0;" />

                <p>
                  <strong>Message</strong>
                </p>

                <p style="line-height:1.6;">
                  ${safeMessage}
                </p>

                <hr style="border:0;border-top:1px solid #ddd;margin:24px 0;" />

                <p style="font-size:12px;color:#777;">
                  Sent through the Basha Report Yemen Monitor contact form.
                </p>
              </div>
            `,
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
