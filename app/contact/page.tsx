"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

export default function ContactPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [
    organization,
    setOrganization,
  ] = useState("");

  const [subject, setSubject] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setSending(true);
    setSuccess(false);
    setError("");

    try {
      const response =
        await fetch(
          "/api/contact",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              organization,
              subject,
              message,
              website,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            "Unable to send message."
        );
      }

      setSuccess(true);

      setName("");
      setEmail("");
      setOrganization("");
      setSubject("");
      setMessage("");
      setWebsite("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="brandWrap">
          <Image
            src="/brand/basha-report-logo.png"
            alt="Basha Report"
            width={110}
            height={104}
            className="brandLogo"
            priority
          />

          <div className="brandDivider" />

          <div>
            <div className="productName">
              Yemen Monitor
            </div>

            <div className="productSub">
              Basha Report Intelligence
            </div>
          </div>
        </div>
      </header>

      <section className="liveFeedPage">
        <Link
          href="/"
          className="backLink"
        >
          <ArrowLeft size={16} />
          Back to overview
        </Link>

        <div className="liveFeedHeading">
          <div>
            <div className="eyebrow">
              CONTACT BASHA REPORT
            </div>

            <h1>
              Contact Us
            </h1>

            <p>
              Request a briefing,
              ask about Yemen Monitor,
              or contact Basha Report
              about research and analysis.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(280px, 0.4fr)",
            gap: "14px",
            marginTop: "14px",
          }}
        >
          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="eyebrow">
                  SEND A MESSAGE
                </div>

                <h2>
                  Contact Basha Report
                </h2>
              </div>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                }}
              >
                <Field
                  label="Name"
                  required
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(
                      event
                    ) =>
                      setName(
                        event.target
                          .value
                      )
                    }
                    required
                    maxLength={120}
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field
                  label="Email"
                  required
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target
                          .value
                      )
                    }
                    required
                    maxLength={200}
                    style={
                      inputStyle
                    }
                  />
                </Field>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "14px",
                  marginTop:
                    "14px",
                }}
              >
                <Field label="Organization">
                  <input
                    type="text"
                    value={
                      organization
                    }
                    onChange={(
                      event
                    ) =>
                      setOrganization(
                        event.target
                          .value
                      )
                    }
                    maxLength={200}
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Subject">
                  <input
                    type="text"
                    value={subject}
                    onChange={(
                      event
                    ) =>
                      setSubject(
                        event.target
                          .value
                      )
                    }
                    maxLength={200}
                    placeholder="Briefing request"
                    style={
                      inputStyle
                    }
                  />
                </Field>
              </div>

              <div
                style={{
                  marginTop:
                    "14px",
                }}
              >
                <Field
                  label="Message"
                  required
                >
                  <textarea
                    value={message}
                    onChange={(
                      event
                    ) =>
                      setMessage(
                        event.target
                          .value
                      )
                    }
                    required
                    maxLength={5000}
                    rows={9}
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                    }}
                  />
                </Field>
              </div>

              <div
                style={{
                  position:
                    "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  overflow:
                    "hidden",
                }}
                aria-hidden="true"
              >
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(
                      event
                    ) =>
                      setWebsite(
                        event.target
                          .value
                      )
                    }
                  />
                </label>
              </div>

              {error && (
                <div
                  style={{
                    marginTop:
                      "14px",
                    padding:
                      "12px 14px",
                    borderRadius:
                      "8px",
                    background:
                      "rgba(138,43,37,0.08)",
                    color:
                      "#8a2b25",
                    fontSize:
                      "12px",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  style={{
                    marginTop:
                      "14px",
                    padding:
                      "12px 14px",
                    borderRadius:
                      "8px",
                    background:
                      "rgba(71,98,70,0.10)",
                    color:
                      "#476246",
                    fontSize:
                      "12px",
                    display:
                      "flex",
                    gap: "8px",
                    alignItems:
                      "center",
                  }}
                >
                  <CheckCircle2
                    size={16}
                  />

                  Your message was sent successfully.
                </div>
              )}

              <button
                type="submit"
                disabled={
                  sending
                }
                className="goldPill"
                style={{
                  marginTop:
                    "18px",
                  border: 0,
                  cursor:
                    sending
                      ? "default"
                      : "pointer",
                  opacity:
                    sending
                      ? 0.7
                      : 1,
                }}
              >
                <Send size={14} />

                {sending
                  ? "Sending..."
                  : "Send message"}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="metricIcon">
              <Mail size={20} />
            </div>

            <div
              className="eyebrow"
              style={{
                marginTop:
                  "16px",
              }}
            >
              BRIEFINGS
            </div>

            <h2>
              Request a briefing
            </h2>

            <p
              style={{
                color:
                  "#6c5a54",
                fontSize:
                  "13px",
                lineHeight:
                  1.7,
              }}
            >
              Use this form for
              Yemen or Red Sea
              briefing requests,
              research inquiries,
              media questions, or
              other Basha Report
              correspondence.
            </p>

            <p
              style={{
                color:
                  "#806e67",
                fontSize:
                  "11px",
                lineHeight:
                  1.6,
                marginBottom: 0,
              }}
            >
              Your message is sent
              directly to Basha
              Report. The destination
              email address is not
              displayed publicly on
              this page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "block",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom:
            "6px",
          color: "#6c5a54",
          fontSize: "11px",
          fontWeight: 700,
          textTransform:
            "uppercase",
          letterSpacing:
            "0.6px",
        }}
      >
        {label}

        {required
          ? " *"
          : ""}
      </span>

      {children}
    </label>
  );
}

const inputStyle:
  React.CSSProperties = {
  width: "100%",
  boxSizing:
    "border-box",
  border:
    "1px solid rgba(50, 3, 3, 0.18)",
  borderRadius: "8px",
  background:
    "rgba(255,255,255,0.55)",
  color: "#3c2522",
  padding:
    "11px 12px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
};
