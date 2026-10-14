// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Input, Label, Select, Badge, Separator } = UI;
const { Plus, Check, X, ChevronRight, ChevronDown, FileText, Clock, ArrowRight, AlertCircle, CheckCircle } = Icons;

const WORKSPACE_DOMAIN = "northwind.co";

const ACCOUNTS = [
  {
    id: "u-1041",
    name: "Priya Raman",
    email: "priya.raman@northwind.co",
    initials: "PR",
    detail: "Admin · People Ops",
    role: "admin",
    kind: "corporate",
    lastSeen: "Signed in yesterday, 17:22",
  },
  {
    id: "u-1188",
    name: "Daniel Osei",
    email: "d.osei@northwind.co",
    initials: "DO",
    detail: "Employee · Finance",
    role: "employee",
    kind: "corporate",
    lastSeen: "Signed in Mon 12 Oct, 09:04",
  },
  {
    id: "u-1203",
    name: "Benjamin Ortiz",
    email: "b.ortiz@northwind.co",
    initials: "BO",
    detail: "Employee · Platform",
    role: "employee",
    kind: "flaky",
    lastSeen: "Session expired 3 days ago",
  },
  {
    id: "u-ext",
    name: "Marta Kovač",
    email: "marta.kovac@gmail.com",
    initials: "MK",
    detail: "Personal account",
    role: "employee",
    kind: "external",
    lastSeen: "Not a Northwind account",
  },
];

const PREVIEW_SOURCES = [
  {
    id: "c1",
    n: 1,
    document_name: "Travel & Expense Policy 2026.pdf",
    page_ref: "Page 7 · §4.2 Meal allowances",
    lines: [
      { t: "4.2  Meal allowances", hl: false, h: true },
      { t: "Employees travelling on company business may claim", hl: true },
      { t: "meals up to £45 per day in the UK and €55 per day", hl: true },
      { t: "elsewhere in the EU. A receipt is required for any", hl: true },
      { t: "single item above £25.", hl: true },
      { t: "", hl: false },
      { t: "4.3  Alcohol", hl: false, h: true },
      { t: "Alcohol is not reimbursable except at a client dinner", hl: false },
      { t: "approved in advance by a cost-centre owner.", hl: false },
    ],
  },
  {
    id: "c2",
    n: 2,
    document_name: "Travel Addendum — DACH.md",
    page_ref: "Section 2 · Berlin office",
    lines: [
      { t: "## 2. Berlin office", hl: false, h: true },
      { t: "Visits to the Berlin office are booked through Egencia", hl: false },
      { t: "under cost centre FIN-212.", hl: false },
      { t: "", hl: false },
      { t: "The standard EU meal allowance applies, but breakfast", hl: true },
      { t: "is already covered by the negotiated hotel rate and", hl: true },
      { t: "may not be claimed separately.", hl: true },
    ],
  },
];

const ASSURANCES = [
  "Answers are drawn only from documents your admins uploaded.",
  "If nothing relevant is indexed, the answer is “I don’t know”.",
  "Your conversation history stays private to your account.",
];

export default function Screen() {
  const navigate = useNavigate();
  const { Button, Input, Label, Badge, Separator } = UI;

  const [stage, setStage] = React.useState("idle"); // idle | chooser | signing | denied | error | success
  const [account, setAccount] = React.useState(null);
  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualEmail, setManualEmail] = React.useState("");
  const [attempts, setAttempts] = React.useState({});
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [online, setOnline] = React.useState(true);
  const [activeCite, setActiveCite] = React.useState("c1");
  const [fileNote, setFileNote] = React.useState(false);

  const startRef = React.useRef(null);
  const firstAccountRef = React.useRef(null);
  const manualRef = React.useRef(null);
  const statusRef = React.useRef(null);

  React.useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    if (typeof navigator !== "undefined" && navigator.onLine === false) setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  React.useEffect(() => {
    if (stage !== "signing" || !account) return undefined;
    const t = setTimeout(() => {
      if (account.kind === "external") {
        setStage("denied");
      } else if (account.kind === "flaky" && !attempts[account.email]) {
        setAttempts((prev) => ({ ...prev, [account.email]: 1 }));
        setStage("error");
      } else {
        setStage("success");
      }
    }, 1700);
    return () => clearTimeout(t);
  }, [stage, account, attempts]);

  React.useEffect(() => {
    if (stage === "chooser" && !manualOpen && firstAccountRef.current) firstAccountRef.current.focus();
    if (stage === "chooser" && manualOpen && manualRef.current) manualRef.current.focus();
    if (stage === "idle" && startRef.current) startRef.current.focus();
  }, [stage, manualOpen]);

  const active = PREVIEW_SOURCES.find((s) => s.id === activeCite) || PREVIEW_SOURCES[0];

  const choose = (a) => {
    setAccount(a);
    setStage("signing");
  };

  const submitManual = (e) => {
    e.preventDefault();
    const email = manualEmail.trim().toLowerCase();
    if (!email) return;
    const local = email.split("@")[0] || "";
    choose({
      id: "u-manual",
      name: local
        .split(/[._-]/)
        .filter(Boolean)
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ") || email,
      email,
      initials: (local.slice(0, 2) || "??").toUpperCase(),
      detail: "Employee",
      role: "employee",
      kind: email.endsWith("@" + WORKSPACE_DOMAIN) ? "corporate" : "external",
      lastSeen: "First sign-in",
    });
  };

  const backToChooser = () => setStage("chooser");

  const focusRing = "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  const smallLabel = {
    fontSize: "0.6875rem",
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  const cardStyle = {
    borderRadius: brand.radius,
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(94,107,125,0.18)",
    boxShadow: "0 1px 2px rgba(43,76,126,0.06), 0 12px 28px -22px rgba(43,76,126,0.45)",
  };

  return (
    <div
      className="min-h-full w-full"
      style={{ backgroundColor: brand.backgroundColor, fontFamily: brand.fontBody, color: "#1B2430" }}
    >
      <style>{`
        @keyframes corpusRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes corpusBar { from { width: 6%; } to { width: 93%; } }
        @keyframes corpusPulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
        .corpus-rise { animation: corpusRise 220ms ease-out both; }
        .corpus-bar { animation: corpusBar 1.7s cubic-bezier(.2,.7,.3,1) forwards; }
        .corpus-pulse { animation: corpusPulse 1.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .corpus-rise, .corpus-bar, .corpus-pulse { animation: none !important; }
          .corpus-bar { width: 93%; }
        }
      `}</style>

      <div className="flex min-h-full flex-col lg:flex-row">
        {/* ── Sign-in pane ───────────────────────────────────────── */}
        <section className="flex w-full flex-col justify-between px-6 py-10 sm:px-10 lg:w-[30rem] lg:shrink-0 lg:px-12 lg:py-14">
          <div className="mx-auto w-full max-w-[25rem]">
            <p style={{ ...smallLabel, color: brand.neutralColor }}>Northwind company knowledge base</p>
            <h1
              className="mt-3 text-[2rem] leading-[1.15] font-semibold tracking-tight"
              style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
            >
              Sign in to Corpus
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: brand.neutralColor }}>
              Ask a question in plain English and read the answer with the source page open beside it. Access is
              limited to <span className="font-medium" style={{ color: "#1B2430" }}>@{WORKSPACE_DOMAIN}</span> Google
              Workspace accounts.
            </p>

            {!online && (
              <div
                className="corpus-rise mt-6 flex gap-3 px-4 py-3"
                style={{
                  borderRadius: brand.radius,
                  backgroundColor: "rgba(244,201,93,0.18)",
                  border: "1px solid rgba(244,201,93,0.7)",
                }}
              >
                <Icons.AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" style={{ color: "#8A6A12" }} />
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: "#6B5310" }}>
                  <span className="font-semibold">You’re offline.</span> Sign-in needs a connection to Google. We’ll
                  re-enable the button the moment you’re back.
                </p>
              </div>
            )}

            <div className="mt-8" style={cardStyle}>
              <div className="p-7" aria-live="polite" ref={statusRef}>
                {/* IDLE */}
                {stage === "idle" && (
                  <div className="corpus-rise">
                    <Button
                      ref={startRef}
                      onClick={() => setStage("chooser")}
                      disabled={!online}
                      className={"flex w-full items-center justify-center gap-3 px-4 py-3.5 text-[0.9375rem] font-semibold transition-transform duration-150 hover:-translate-y-px disabled:translate-y-0 disabled:opacity-55 " + focusRing}
                      style={{
                        backgroundColor: brand.primaryColor,
                        color: "#FFFFFF",
                        borderRadius: brand.radius,
                        outlineColor: brand.primaryColor,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 items-center justify-center text-[0.8125rem] font-bold"
                        style={{ backgroundColor: "#FFFFFF", color: brand.primaryColor, borderRadius: "999px" }}
                      >
                        G
                      </span>
                      Continue with Google Workspace
                    </Button>
                    <p className="mt-4 text-[0.8125rem] leading-relaxed" style={{ color: brand.neutralColor }}>
                      There is no password and no public sign-up — Corpus only knows the accounts in your company
                      directory.
                    </p>
                  </div>
                )}

                {/* ACCOUNT CHOOSER */}
                {stage === "chooser" && (
                  <div
                    className="corpus-rise"
                    role="group"
                    aria-label="Choose a Google account"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.stopPropagation();
                        setManualOpen(false);
                        setStage("idle");
                      }
                    }}
                  >
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-[0.9375rem] font-semibold" style={{ color: "#1B2430" }}>
                        Choose an account
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setManualOpen(false);
                          setStage("idle");
                        }}
                        className={"text-[0.8125rem] font-medium underline underline-offset-2 " + focusRing}
                        style={{ color: brand.neutralColor, outlineColor: brand.primaryColor, borderRadius: "4px" }}
                      >
                        Cancel
                      </button>
                    </div>

                    {!manualOpen && (
                      <ul className="mt-4 space-y-1.5">
                        {ACCOUNTS.map((a, i) => (
                          <li key={a.id}>
                            <button
                              type="button"
                              ref={i === 0 ? firstAccountRef : null}
                              onClick={() => choose(a)}
                              className={"group flex w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-150 " + focusRing}
                              style={{
                                borderRadius: brand.radius,
                                border: "1px solid rgba(94,107,125,0.16)",
                                backgroundColor: "#FFFFFF",
                                outlineColor: brand.primaryColor,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(43,76,126,0.045)")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
                            >
                              <span
                                aria-hidden="true"
                                className="flex h-9 w-9 shrink-0 items-center justify-center text-[0.75rem] font-semibold"
                                style={{
                                  borderRadius: "999px",
                                  backgroundColor: a.kind === "external" ? "rgba(94,107,125,0.14)" : "rgba(43,76,126,0.1)",
                                  color: a.kind === "external" ? brand.neutralColor : brand.primaryColor,
                                }}
                              >
                                {a.initials}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[0.875rem] font-medium" style={{ color: "#1B2430" }}>
                                  {a.name}
                                </span>
                                <span className="block truncate text-[0.8125rem]" style={{ color: brand.neutralColor }}>
                                  {a.email}
                                </span>
                              </span>
                              <Icons.ChevronRight
                                className="h-4 w-4 shrink-0"
                                aria-hidden="true"
                                style={{ color: brand.neutralColor }}
                              />
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            type="button"
                            onClick={() => setManualOpen(true)}
                            className={"flex w-full items-center gap-3 px-3 py-3 text-left " + focusRing}
                            style={{
                              borderRadius: brand.radius,
                              border: "1px dashed rgba(94,107,125,0.4)",
                              outlineColor: brand.primaryColor,
                            }}
                          >
                            <span
                              aria-hidden="true"
                              className="flex h-9 w-9 shrink-0 items-center justify-center"
                              style={{ borderRadius: "999px", border: "1px solid rgba(94,107,125,0.3)" }}
                            >
                              <Icons.Plus className="h-4 w-4" aria-hidden="true" style={{ color: brand.neutralColor }} />
                            </span>
                            <span className="text-[0.875rem] font-medium" style={{ color: brand.primaryColor }}>
                              Use another account
                            </span>
                          </button>
                        </li>
                      </ul>
                    )}

                    {manualOpen && (
                      <form className="corpus-rise mt-5" onSubmit={submitManual}>
                        <Label htmlFor="work-email" className="text-[0.8125rem] font-medium" style={{ color: "#1B2430" }}>
                          Work email address
                        </Label>
                        <Input
                          id="work-email"
                          ref={manualRef}
                          type="email"
                          autoComplete="email"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          placeholder={"name@" + WORKSPACE_DOMAIN}
                          className="mt-2 w-full"
                          style={{ borderRadius: brand.radius }}
                        />
                        <p className="mt-2 text-[0.75rem]" style={{ color: brand.neutralColor }}>
                          You’ll still confirm with Google — Corpus never takes a password.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                          <Button
                            type="submit"
                            disabled={!manualEmail.trim() || !online}
                            className={"px-4 py-2.5 text-[0.875rem] font-semibold disabled:opacity-45 " + focusRing}
                            style={{
                              backgroundColor: brand.primaryColor,
                              color: "#FFFFFF",
                              borderRadius: brand.radius,
                              outlineColor: brand.primaryColor,
                            }}
                          >
                            Continue
                          </Button>
                          <button
                            type="button"
                            onClick={() => setManualOpen(false)}
                            className={"px-3 py-2.5 text-[0.875rem] font-medium " + focusRing}
                            style={{ color: brand.neutralColor, borderRadius: brand.radius, outlineColor: brand.primaryColor }}
                          >
                            Back to accounts
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* SIGNING */}
                {stage === "signing" && account && (
                  <div className="corpus-rise">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 shrink-0 items-center justify-center text-[0.75rem] font-semibold"
                        style={{ borderRadius: "999px", backgroundColor: "rgba(43,76,126,0.1)", color: brand.primaryColor }}
                      >
                        {account.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[0.875rem] font-medium">{account.name}</p>
                        <p className="truncate text-[0.8125rem]" style={{ color: brand.neutralColor }}>
                          {account.email}
                        </p>
                      </div>
                    </div>
                    <div
                      className="mt-5 h-1.5 w-full overflow-hidden"
                      style={{ backgroundColor: "rgba(94,107,125,0.16)", borderRadius: "999px" }}
                      role="progressbar"
                      aria-label="Signing in"
                    >
                      <div className="corpus-bar h-full" style={{ backgroundColor: brand.accentColor, borderRadius: "999px" }} />
                    </div>
                    <p className="corpus-pulse mt-4 text-[0.8125rem]" style={{ color: brand.neutralColor }}>
                      Confirming with Google, then checking the {WORKSPACE_DOMAIN} allow-list…
                    </p>
                  </div>
                )}

                {/* DENIED */}
                {stage === "denied" && account && (
                  <div className="corpus-rise">
                    <span
                      className="flex h-10 w-10 items-center justify-center"
                      style={{ borderRadius: "999px", backgroundColor: "rgba(94,107,125,0.14)" }}
                    >
                      <Icons.X className="h-5 w-5" aria-hidden="true" style={{ color: brand.primaryColor }} />
                    </span>
                    <h2 className="mt-4 text-[1.0625rem] font-semibold" style={{ color: brand.primaryColor }}>
                      That account isn’t on the company domain
                    </h2>
                    <p className="mt-2 text-[0.875rem] leading-relaxed" style={{ color: brand.neutralColor }}>
                      <span className="font-medium" style={{ color: "#1B2430" }}>{account.email}</span> isn’t a
                      Northwind Workspace account, so no account was created and nothing from the knowledge base was
                      returned. Sign in with your <span className="font-medium">@{WORKSPACE_DOMAIN}</span> address.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={backToChooser}
                        className={"px-4 py-2.5 text-[0.875rem] font-semibold " + focusRing}
                        style={{
                          backgroundColor: brand.primaryColor,
                          color: "#FFFFFF",
                          borderRadius: brand.radius,
                          outlineColor: brand.primaryColor,
                        }}
                      >
                        Try a different account
                      </Button>
                      <button
                        type="button"
                        onClick={() => setHelpOpen(true)}
                        className={"px-3 py-2.5 text-[0.875rem] font-medium underline underline-offset-2 " + focusRing}
                        style={{ color: brand.neutralColor, borderRadius: brand.radius, outlineColor: brand.primaryColor }}
                      >
                        Who can grant me access?
                      </button>
                    </div>
                  </div>
                )}

                {/* PROVIDER ERROR */}
                {stage === "error" && account && (
                  <div className="corpus-rise">
                    <span
                      className="flex h-10 w-10 items-center justify-center"
                      style={{ borderRadius: "999px", backgroundColor: "rgba(244,201,93,0.25)" }}
                    >
                      <Icons.AlertCircle className="h-5 w-5" aria-hidden="true" style={{ color: "#8A6A12" }} />
                    </span>
                    <h2 className="mt-4 text-[1.0625rem] font-semibold" style={{ color: brand.primaryColor }}>
                      Google didn’t finish the handshake
                    </h2>
                    <p className="mt-2 text-[0.875rem] leading-relaxed" style={{ color: brand.neutralColor }}>
                      The callback for{" "}
                      <span className="font-medium" style={{ color: "#1B2430" }}>{account.email}</span> timed out after{" "}
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>10s</span>. Nothing was changed and no
                      session was issued — your account is still waiting where you left it.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => setStage("signing")}
                        className={"px-4 py-2.5 text-[0.875rem] font-semibold " + focusRing}
                        style={{
                          backgroundColor: brand.primaryColor,
                          color: "#FFFFFF",
                          borderRadius: brand.radius,
                          outlineColor: brand.primaryColor,
                        }}
                      >
                        Retry with this account
                      </Button>
                      <button
                        type="button"
                        onClick={backToChooser}
                        className={"px-3 py-2.5 text-[0.875rem] font-medium underline underline-offset-2 " + focusRing}
                        style={{ color: brand.neutralColor, borderRadius: brand.radius, outlineColor: brand.primaryColor }}
                      >
                        Choose a different account
                      </button>
                    </div>
                  </div>
                )}

                {/* SUCCESS */}
                {stage === "success" && account && (
                  <div className="corpus-rise">
                    <span
                      className="flex h-10 w-10 items-center justify-center"
                      style={{ borderRadius: "999px", backgroundColor: "rgba(43,76,126,0.1)" }}
                    >
                      <Icons.CheckCircle className="h-5 w-5" aria-hidden="true" style={{ color: brand.primaryColor }} />
                    </span>
                    <h2 className="mt-4 text-[1.0625rem] font-semibold" style={{ color: brand.primaryColor }}>
                      Signed in as {account.name}
                    </h2>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.875rem]" style={{ color: brand.neutralColor }}>
                      <span>{account.email}</span>
                      <Badge style={{ backgroundColor: "rgba(43,76,126,0.1)", color: brand.primaryColor, borderRadius: "999px" }}>
                        {account.role === "admin" ? "Admin" : "Employee"}
                      </Badge>
                    </p>
                    <Button
                      onClick={() => navigate("chat")}
                      className={"mt-5 flex w-full items-center justify-center gap-2 px-4 py-3 text-[0.9375rem] font-semibold " + focusRing}
                      style={{
                        backgroundColor: brand.primaryColor,
                        color: "#FFFFFF",
                        borderRadius: brand.radius,
                        outlineColor: brand.primaryColor,
                      }}
                    >
                      Open chat
                      <Icons.ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    {account.role === "admin" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("documents")}
                          className={"px-3 py-2 text-[0.8125rem] font-medium " + focusRing}
                          style={{
                            color: brand.primaryColor,
                            border: "1px solid rgba(43,76,126,0.25)",
                            borderRadius: brand.radius,
                            outlineColor: brand.primaryColor,
                          }}
                        >
                          Documents
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("users")}
                          className={"px-3 py-2 text-[0.8125rem] font-medium " + focusRing}
                          style={{
                            color: brand.primaryColor,
                            border: "1px solid rgba(43,76,126,0.25)",
                            borderRadius: brand.radius,
                            outlineColor: brand.primaryColor,
                          }}
                        >
                          People
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="px-7 py-4">
                <button
                  type="button"
                  onClick={() => setHelpOpen((v) => !v)}
                  aria-expanded={helpOpen}
                  aria-controls="signin-help"
                  className={"flex w-full items-center justify-between text-[0.8125rem] font-medium " + focusRing}
                  style={{ color: brand.primaryColor, borderRadius: "4px", outlineColor: brand.primaryColor }}
                >
                  Trouble signing in?
                  {helpOpen ? (
                    <Icons.ChevronDown className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Icons.ChevronRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                {helpOpen && (
                  <div id="signin-help" className="corpus-rise mt-3 space-y-2 text-[0.8125rem] leading-relaxed" style={{ color: brand.neutralColor }}>
                    <p>
                      The allow-list is set by IT at deployment and can’t be changed in the app. If your address is on
                      the domain but sign-in is refused, ask a Corpus admin — currently{" "}
                      <span className="font-medium" style={{ color: "#1B2430" }}>Priya Raman (People Ops)</span> — to
                      confirm you’re in the <span className="font-medium">corpus-pilot</span> Workspace group.
                    </p>
                    <p>Contractors and personal Gmail accounts can’t be added in this version.</p>
                  </div>
                )}
              </div>
            </div>

            <p
              className="mt-6 flex items-center gap-2 text-[0.75rem]"
              style={{ color: brand.neutralColor, fontVariantNumeric: "tabular-nums" }}
            >
              <Icons.Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Allow-list {WORKSPACE_DOMAIN} · synced by IT at 08:15 today
            </p>
          </div>

          <p className="mx-auto mt-10 w-full max-w-[25rem] text-[0.75rem]" style={{ color: brand.neutralColor }}>
            Corpus · Northwind Health Group internal tool. Documents stay inside the company account.
          </p>
        </section>

        {/* ── Evidence pane ──────────────────────────────────────── */}
        <section
          aria-labelledby="preview-heading"
          className="flex-1 px-6 py-10 sm:px-10 lg:px-12 lg:py-14"
          style={{ backgroundColor: brand.primaryColor, color: "#FFFFFF" }}
        >
          <div className="mx-auto w-full max-w-[56rem]">
            <p style={{ ...smallLabel, color: brand.accentColor }}>What you get on the other side</p>
            <h2
              id="preview-heading"
              className="mt-3 max-w-xl text-[1.625rem] leading-snug font-semibold tracking-tight"
              style={{ fontFamily: brand.fontHeading }}
            >
              Every answer, with the page it came from open beside it
            </h2>
            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.74)" }}>
              Select a citation below to see the exact lines Corpus answered from. Nobody has to take a policy answer on
              faith.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {/* conversation */}
              <div
                className="p-5"
                style={{
                  borderRadius: brand.radius,
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.16)",
                }}
              >
                <h3 style={{ ...smallLabel, color: "rgba(255,255,255,0.6)" }}>Conversation</h3>
                <div className="mt-4 flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-[0.6875rem] font-semibold"
                    style={{ borderRadius: "999px", backgroundColor: "rgba(255,255,255,0.18)" }}
                  >
                    DO
                  </span>
                  <p className="text-[0.9375rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
                    What can I claim for meals when I’m at the Berlin office next week?
                  </p>
                </div>

                <div
                  className="mt-5 pt-5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.14)" }}
                >
                  <p className="text-[0.9375rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
                    Meals are reimbursable up to <span style={{ fontVariantNumeric: "tabular-nums" }}>€55</span> per day
                    in the EU, and you need a receipt for any single item over{" "}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>£25</span>.{" "}
                    <CiteChip source={PREVIEW_SOURCES[0]} active={activeCite} onSelect={setActiveCite} />
                  </p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.92)" }}>
                    Berlin has one exception: breakfast is already in the hotel rate, so it can’t be claimed separately.{" "}
                    <CiteChip source={PREVIEW_SOURCES[1]} active={activeCite} onSelect={setActiveCite} />
                  </p>
                  <p
                    className="mt-4 text-[0.75rem]"
                    style={{ color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}
                  >
                    Grounded in 2 passages · answered in 1.8s
                  </p>
                </div>
              </div>

              {/* source viewer */}
              <div
                className="flex flex-col overflow-hidden"
                style={{ borderRadius: brand.radius, backgroundColor: "#FFFFFF", color: "#1B2430" }}
              >
                <div
                  className="flex items-start justify-between gap-3 px-5 py-4"
                  style={{ borderBottom: "1px solid rgba(94,107,125,0.18)" }}
                >
                  <div className="flex min-w-0 gap-3">
                    <Icons.FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" style={{ color: brand.primaryColor }} />
                    <div className="min-w-0">
                      <p className="truncate text-[0.875rem] font-semibold">{active.document_name}</p>
                      <p
                        className="mt-0.5 truncate text-[0.75rem]"
                        style={{ color: brand.neutralColor, fontVariantNumeric: "tabular-nums" }}
                      >
                        {active.page_ref}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFileNote(true)}
                    className={"shrink-0 px-2.5 py-1.5 text-[0.75rem] font-medium " + focusRing}
                    style={{
                      color: brand.primaryColor,
                      border: "1px solid rgba(43,76,126,0.25)",
                      borderRadius: brand.radius,
                      outlineColor: brand.primaryColor,
                    }}
                  >
                    Open original
                  </button>
                </div>

                <div className="flex-1 px-5 py-5">
                  <ol className="space-y-1">
                    {active.lines.map((line, i) => (
                      <li
                        key={active.id + "-" + i}
                        className="px-2 py-0.5 text-[0.8125rem] leading-6"
                        style={{
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          backgroundColor: line.hl ? "rgba(244,201,93,0.42)" : "transparent",
                          borderLeft: line.hl ? "3px solid " + brand.accentColor : "3px solid transparent",
                          fontWeight: line.h ? 600 : 400,
                          color: line.t ? "#1B2430" : "transparent",
                          transition: "background-color 180ms ease",
                        }}
                      >
                        {line.t || "·"}
                      </li>
                    ))}
                  </ol>
                  {fileNote && (
                    <p
                      className="corpus-rise mt-4 px-3 py-2 text-[0.75rem]"
                      style={{
                        borderRadius: brand.radius,
                        backgroundColor: "rgba(43,76,126,0.07)",
                        color: brand.neutralColor,
                      }}
                    >
                      Originals are stored in the company S3 bucket and open once you’re signed in.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {ASSURANCES.map((a) => (
                <li key={a} className="flex gap-2.5 text-[0.8125rem] leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                  <Icons.Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" style={{ color: brand.accentColor }} />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function CiteChip({ source, active, onSelect }) {
  const isActive = active === source.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(source.id)}
      aria-pressed={isActive}
      className="inline-flex translate-y-[-1px] items-center gap-1 px-1.5 py-0.5 align-middle text-[0.6875rem] font-semibold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        borderRadius: "999px",
        backgroundColor: isActive ? brand.accentColor : "rgba(255,255,255,0.16)",
        color: isActive ? "#2B2104" : "#FFFFFF",
        border: isActive ? "1px solid " + brand.accentColor : "1px solid rgba(255,255,255,0.3)",
        outlineColor: brand.accentColor,
        fontVariantNumeric: "tabular-nums",
        transition: "background-color 160ms ease, color 160ms ease",
      }}
      title={source.document_name + " — " + source.page_ref}
    >
      {source.n} · {source.document_name.replace(/\.(pdf|md|docx|txt)$/i, "")}
    </button>
  );
}
