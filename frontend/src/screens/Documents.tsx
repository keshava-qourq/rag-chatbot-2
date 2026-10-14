// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Input, Label, Table, THead, TBody, TR, TH, TD, Avatar, Separator } = UI;
const { Search, X, FileText, Clock, Trash, Filter, Download, Upload, AlertCircle, CheckCircle } = Icons;

const ME = { email: "priya.raman@meridianlogistics.com", name: "Priya Raman", role: "admin" };

const ALLOWED = ["pdf", "docx", "doc", "txt", "md"];
const MAX_BYTES = 50 * 1024 * 1024;

const SEED_DOCS = [
  {
    id: "doc_8841",
    filename: "Employee-Handbook-2026.pdf",
    file_type: "pdf",
    size_bytes: 4_412_880,
    s3_key: "originals/2026/10/doc_8841.pdf",
    status: "ready",
    failure_reason: null,
    uploaded_by: "priya.raman@meridianlogistics.com",
    uploaded_at: "2026-10-13T09:14:00",
    chunks: 312,
    pages: 84,
    passages: [
      { page_ref: "p. 12 — Working hours", snippet: "Core hours are 10:00–16:00 in the employee's local time zone. Teams may agree alternative core hours in writing with their manager." },
      { page_ref: "p. 31 — Annual leave", snippet: "Full-time employees accrue 25 days of annual leave per calendar year, plus public holidays observed in their country of employment." },
      { page_ref: "p. 33 — Carry-over", snippet: "Up to five unused days may be carried into the following year and must be taken before 31 March." }
    ]
  },
  {
    id: "doc_8836",
    filename: "Remote-Work-Policy-v4.docx",
    file_type: "docx",
    size_bytes: 268_430,
    s3_key: "originals/2026/10/doc_8836.docx",
    status: "ready",
    failure_reason: null,
    uploaded_by: "tom.okafor@meridianlogistics.com",
    uploaded_at: "2026-10-12T16:48:00",
    chunks: 48,
    pages: 11,
    passages: [
      { page_ref: "§2.1 — Eligibility", snippet: "Any employee who has completed probation may work remotely up to three days per week with manager approval." },
      { page_ref: "§4 — Equipment", snippet: "Meridian provides a laptop, monitor and headset. Desk and chair purchases up to £350 are reimbursable once every three years." }
    ]
  },
  {
    id: "doc_8849",
    filename: "Expense-Reimbursement-Guidelines.pdf",
    file_type: "pdf",
    size_bytes: 1_904_221,
    s3_key: "originals/2026/10/doc_8849.pdf",
    status: "processing",
    progress: 58,
    failure_reason: null,
    uploaded_by: "priya.raman@meridianlogistics.com",
    uploaded_at: "2026-10-14T08:52:00",
    chunks: null,
    pages: 26,
    passages: []
  },
  {
    id: "doc_8822",
    filename: "Security-Incident-Runbook.md",
    file_type: "md",
    size_bytes: 41_206,
    s3_key: "originals/2026/10/doc_8822.md",
    status: "ready",
    failure_reason: null,
    uploaded_by: "s.lindqvist@meridianlogistics.com",
    uploaded_at: "2026-10-11T11:05:00",
    chunks: 22,
    pages: null,
    passages: [
      { page_ref: "## Severity 1", snippet: "A Sev-1 is declared when customer freight data is exposed or the booking API is unavailable for more than 15 minutes." },
      { page_ref: "## First 30 minutes", snippet: "The on-call engineer opens an incident channel, names an incident lead, and posts a status note every 15 minutes until resolved." }
    ]
  },
  {
    id: "doc_8810",
    filename: "Scanned-Insurance-Certificate-2026.pdf",
    file_type: "pdf",
    size_bytes: 7_712_440,
    s3_key: "originals/2026/10/doc_8810.pdf",
    status: "failed",
    failure_reason: "No text could be extracted. The pages look like scanned images, and this version does not run OCR.",
    uploaded_by: "dana.whitfield@meridianlogistics.com",
    uploaded_at: "2026-10-10T14:22:00",
    chunks: null,
    pages: 3,
    passages: []
  },
  {
    id: "doc_8851",
    filename: "Benefits-Open-Enrolment-2027.pdf",
    file_type: "pdf",
    size_bytes: 3_118_902,
    s3_key: "originals/2026/10/doc_8851.pdf",
    status: "processing",
    progress: 21,
    failure_reason: null,
    uploaded_by: "dana.whitfield@meridianlogistics.com",
    uploaded_at: "2026-10-14T09:31:00",
    chunks: null,
    pages: 40,
    passages: []
  },
  {
    id: "doc_8803",
    filename: "Procurement-Approval-Matrix.docx",
    file_type: "docx",
    size_bytes: 512_900,
    s3_key: "originals/2026/10/doc_8803.docx",
    status: "failed",
    failure_reason: "Embedding call failed after three attempts (provider timed out). Nothing from this file was left in the index.",
    uploaded_by: "tom.okafor@meridianlogistics.com",
    uploaded_at: "2026-10-09T17:40:00",
    chunks: null,
    pages: 9,
    passages: []
  },
  {
    id: "doc_8795",
    filename: "Code-of-Conduct.md",
    file_type: "md",
    size_bytes: 28_740,
    s3_key: "originals/2026/10/doc_8795.md",
    status: "ready",
    failure_reason: null,
    uploaded_by: "priya.raman@meridianlogistics.com",
    uploaded_at: "2026-10-09T10:02:00",
    chunks: 17,
    pages: null,
    passages: [
      { page_ref: "## Gifts and hospitality", snippet: "Gifts valued over £75 must be declared to your manager within five working days and logged in the register." }
    ]
  },
  {
    id: "doc_8788",
    filename: "Onboarding-Checklist-Engineering.md",
    file_type: "md",
    size_bytes: 19_330,
    s3_key: "originals/2026/10/doc_8788.md",
    status: "ready",
    failure_reason: null,
    uploaded_by: "s.lindqvist@meridianlogistics.com",
    uploaded_at: "2026-10-08T13:26:00",
    chunks: 14,
    pages: null,
    passages: [
      { page_ref: "## Day one", snippet: "New engineers are added to the on-call rota only after four weeks and one shadowed incident." }
    ]
  },
  {
    id: "doc_8774",
    filename: "Data-Retention-Standard.pdf",
    file_type: "pdf",
    size_bytes: 988_410,
    s3_key: "originals/2026/10/doc_8774.pdf",
    status: "ready",
    failure_reason: null,
    uploaded_by: "dana.whitfield@meridianlogistics.com",
    uploaded_at: "2026-10-07T09:47:00",
    chunks: 56,
    pages: 18,
    passages: [
      { page_ref: "p. 4 — Retention periods", snippet: "Shipment records are retained for seven years from the date of delivery; recruitment records for twelve months after the decision." }
    ]
  },
  {
    id: "doc_8761",
    filename: "Q3-All-Hands-Notes.txt",
    file_type: "txt",
    size_bytes: 62_118,
    s3_key: "originals/2026/10/doc_8761.txt",
    status: "ready",
    failure_reason: null,
    uploaded_by: "tom.okafor@meridianlogistics.com",
    uploaded_at: "2026-10-06T15:12:00",
    chunks: 25,
    pages: null,
    passages: [
      { page_ref: "Section 3 — Hiring", snippet: "Headcount for Q4 is capped at eleven roles, nine of them in operations in Rotterdam and Felixstowe." }
    ]
  }
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function hexToRgba(hex, alpha) {
  const h = String(hex).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function fmtBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

function clockNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function shortName(email) {
  const local = String(email).split("@")[0];
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export default function Screen() {
  const navigate = useNavigate();
  const P = brand.primaryColor;
  const A = brand.accentColor;
  const N = brand.neutralColor;
  const R = brand.radius;

  const [loading, setLoading] = React.useState(true);
  const [docs, setDocs] = React.useState(SEED_DOCS);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState("doc_8841");
  const [showNotes, setShowNotes] = React.useState(false);
  const [uploadErrors, setUploadErrors] = React.useState([]);
  const [notice, setNotice] = React.useState(null);
  const [confirmDoc, setConfirmDoc] = React.useState(null);
  const [enteringIds, setEnteringIds] = React.useState([]);
  const [syncedAt, setSyncedAt] = React.useState(clockNow());

  const fileInputRef = React.useRef(null);
  const confirmBtnRef = React.useRef(null);

  // First paint: the document list arrives.
  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 520);
    return () => clearTimeout(t);
  }, []);

  const hasProcessing = docs.some((d) => d.status === "processing");

  // Live status: processing documents finish while the page is open.
  React.useEffect(() => {
    if (!hasProcessing) return undefined;
    const t = setInterval(() => {
      setSyncedAt(clockNow());
      setDocs((prev) =>
        prev.map((d) => {
          if (d.status !== "processing") return d;
          const next = (d.progress || 0) + 9 + Math.round(Math.random() * 12);
          if (next < 100) return { ...d, progress: next };
          if (d.willFail) {
            return {
              ...d,
              status: "failed",
              progress: 100,
              failure_reason:
                "No text could be extracted. The pages look like scanned images, and this version does not run OCR."
            };
          }
          return {
            ...d,
            status: "ready",
            progress: 100,
            chunks: d.chunks || Math.max(6, Math.round(d.size_bytes / 14000))
          };
        })
      );
    }, 620);
    return () => clearInterval(t);
  }, [hasProcessing]);

  // Notices clear themselves.
  React.useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  // Confirmation dialog: escape closes, focus lands inside.
  React.useEffect(() => {
    if (!confirmDoc) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setConfirmDoc(null);
    };
    window.addEventListener("keydown", onKey);
    if (confirmBtnRef.current) confirmBtnRef.current.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmDoc]);

  const counts = {
    all: docs.length,
    ready: docs.filter((d) => d.status === "ready").length,
    processing: docs.filter((d) => d.status === "processing").length,
    failed: docs.filter((d) => d.status === "failed").length
  };
  const indexedPassages = docs.reduce((sum, d) => sum + (d.status === "ready" ? d.chunks || 0 : 0), 0);

  const filtered = docs
    .filter((d) => (status === "all" ? true : d.status === status))
    .filter((d) => d.filename.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

  const selected = docs.find((d) => d.id === selectedId) || null;
  const panelShowsNotes = showNotes || !selected;

  function acceptFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const rejected = [];
    const accepted = [];
    files.forEach((f) => {
      const ext = (f.name.split(".").pop() || "").toLowerCase();
      if (!ALLOWED.includes(ext)) {
        rejected.push({
          name: f.name,
          reason: `.${ext || "unknown"} isn't a supported type. Upload PDF, Word (.docx), plain text or Markdown.`
        });
      } else if (f.size > MAX_BYTES) {
        rejected.push({
          name: f.name,
          reason: `${fmtBytes(f.size)} is over the 50 MB limit per file. Split it and upload the parts.`
        });
      } else {
        const id = "doc_" + Math.random().toString(36).slice(2, 8);
        accepted.push({
          id,
          filename: f.name,
          file_type: ext,
          size_bytes: f.size,
          s3_key: `originals/2026/10/${id}.${ext}`,
          status: "processing",
          progress: 3,
          failure_reason: null,
          uploaded_by: ME.email,
          uploaded_at: new Date().toISOString(),
          chunks: null,
          pages: null,
          passages: [],
          willFail: /scan/i.test(f.name)
        });
      }
    });

    setUploadErrors(rejected);
    if (accepted.length) {
      setDocs((prev) => [...accepted, ...prev]);
      setEnteringIds(accepted.map((d) => d.id));
      setSelectedId(accepted[0].id);
      setShowNotes(false);
      setStatus("all");
      setNotice({
        tone: "ok",
        text:
          accepted.length === 1
            ? `${accepted[0].filename} is in S3 and queued for extraction. You can keep working.`
            : `${accepted.length} files are in S3 and queued for extraction. You can keep working.`
      });
    }
  }

  function reprocess(doc) {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? { ...d, status: "processing", progress: 2, failure_reason: null, chunks: null, willFail: /scan/i.test(d.filename) }
          : d
      )
    );
    setNotice({
      tone: "ok",
      text: `Re-processing ${doc.filename}. Any passages it had in the index are replaced, not duplicated.`
    });
  }

  function confirmDelete() {
    const doc = confirmDoc;
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    if (selectedId === doc.id) setSelectedId(null);
    setConfirmDoc(null);
    setNotice({
      tone: "ok",
      text: `${doc.filename} is deleted. Its passages are out of the index and will not be cited in new answers.`
    });
  }

  const statusTabs = [
    { key: "all", label: "All" },
    { key: "ready", label: "Ready" },
    { key: "processing", label: "Processing" },
    { key: "failed", label: "Failed" }
  ];

  function StatusPill({ doc }) {
    if (doc.status === "ready") {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold"
          style={{ borderRadius: R, backgroundColor: hexToRgba(P, 0.1), color: P }}
        >
          <Icons.CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
          Ready
        </span>
      );
    }
    if (doc.status === "processing") {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold"
          style={{ borderRadius: R, backgroundColor: hexToRgba(A, 0.3), color: "#5A4206" }}
        >
          <Icons.Clock className="w-3.5 h-3.5 kb-spin" aria-hidden="true" />
          Processing
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold"
        style={{ borderRadius: R, backgroundColor: "#FFFFFF", color: N, border: `1.5px solid ${hexToRgba(N, 0.55)}` }}
      >
        <Icons.AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
        Failed
      </span>
    );
  }

  return (
    <div style={{ fontFamily: brand.fontBody, color: N }}>
      <style>{`
        @keyframes kbRowIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
        @keyframes kbPanelIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes kbSpin { to { transform: rotate(360deg); } }
        @keyframes kbPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .kb-row-in { animation: kbRowIn .32s ease-out both; }
        .kb-panel-in { animation: kbPanelIn .28s ease-out both; }
        .kb-spin { animation: kbSpin 2.4s linear infinite; }
        .kb-pulse { animation: kbPulse 1.6s ease-in-out infinite; }
        .kb-bar { transition: width .5s ease; }
        .kb-focus:focus-visible { outline: 2px solid ${P}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .kb-row-in, .kb-panel-in, .kb-spin, .kb-pulse, .animate-pulse { animation: none !important; }
          .kb-bar { transition: none; }
        }
      `}</style>

      {/* Heading */}
      <header className="mb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: hexToRgba(N, 0.85) }}>
              Shared knowledge base
            </p>
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{ fontFamily: brand.fontHeading, color: P }}
            >
              Documents
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed">
              Everything the assistant is allowed to answer from lives here. Delete a file and it stops being quoted.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold" style={{ color: P }}>{ME.name}</p>
              <p className="text-xs">Admin · {ME.email.split("@")[1]}</p>
            </div>
            <Avatar name={ME.name} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-stretch gap-3" style={{ fontVariantNumeric: "tabular-nums" }}>
          {[
            { label: "Ready to answer from", value: counts.ready },
            { label: "Processing", value: counts.processing },
            { label: "Failed", value: counts.failed },
            { label: "Passages indexed", value: indexedPassages.toLocaleString("en-GB") }
          ].map((s) => (
            <div
              key={s.label}
              className="px-4 py-3 bg-white"
              style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}`, minWidth: 140 }}
            >
              <p className="text-2xl font-semibold leading-none" style={{ color: P }}>{s.value}</p>
              <p className="text-xs mt-1.5">{s.label}</p>
            </div>
          ))}
          <div
            className="px-4 py-3 flex items-center gap-2.5 text-xs"
            style={{ borderRadius: R, border: `1px dashed ${hexToRgba(N, 0.3)}` }}
          >
            <span
              className={hasProcessing ? "kb-pulse" : ""}
              aria-hidden="true"
              style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: hasProcessing ? A : hexToRgba(P, 0.45) }}
            />
            <span>
              {hasProcessing ? "Live — statuses update here" : `All statuses current · synced ${syncedAt}`}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        {/* LEFT PANE */}
        <div className="min-w-0">
          {/* Upload — the focal point */}
          <section
            aria-labelledby="upload-heading"
            className="bg-white p-6"
            style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}`, borderTop: `3px solid ${A}` }}
          >
            <h2 id="upload-heading" className="text-xl font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
              Add files to the knowledge base
            </h2>
            <p className="text-sm mt-1.5">
              PDF, Word (.docx), plain text and Markdown · up to 50 MB each. Text is extracted, chunked and embedded as soon
              as the file lands.
            </p>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                acceptFiles(e.dataTransfer.files);
              }}
              className="mt-5 p-5"
              style={{ borderRadius: R, border: `1.5px dashed ${hexToRgba(P, 0.35)}`, backgroundColor: hexToRgba(P, 0.035) }}
            >
              <Label htmlFor="file-upload" className="text-sm font-semibold" style={{ color: P }}>
                Choose files to upload
              </Label>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={(e) => {
                  acceptFiles(e.target.files);
                  e.target.value = "";
                }}
                className="kb-focus mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer"
                style={{ color: N }}
              />
              <p className="text-xs mt-2.5">Or drop them here. Scanned PDFs without a text layer will fail — there is no OCR.</p>
            </div>

            {uploadErrors.length > 0 && (
              <div
                className="mt-4 p-4 kb-panel-in"
                role="alert"
                style={{ borderRadius: R, border: `1.5px solid ${hexToRgba(N, 0.5)}`, backgroundColor: hexToRgba(N, 0.06) }}
              >
                <div className="flex items-start gap-3">
                  <Icons.AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: P }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: P }}>
                      {uploadErrors.length === 1 ? "One file was not uploaded" : `${uploadErrors.length} files were not uploaded`}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {uploadErrors.map((e) => (
                        <li key={e.name} className="text-sm">
                          <span className="font-medium break-all" style={{ color: P }}>{e.name}</span> — {e.reason}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2">Nothing was sent for processing. The rest of your selection went through.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss upload errors"
                    onClick={() => setUploadErrors([])}
                    className="kb-focus p-1 shrink-0"
                    style={{ borderRadius: R, color: N }}
                  >
                    <Icons.X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {notice && (
            <div
              role="status"
              className="mt-4 flex items-start gap-3 px-4 py-3 kb-panel-in"
              style={{ borderRadius: R, backgroundColor: hexToRgba(P, 0.08), border: `1px solid ${hexToRgba(P, 0.2)}` }}
            >
              <Icons.CheckCircle className="w-4.5 h-4.5 mt-0.5 shrink-0" style={{ color: P, width: 18, height: 18 }} aria-hidden="true" />
              <p className="text-sm flex-1" style={{ color: P }}>{notice.text}</p>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setNotice(null)}
                className="kb-focus p-1"
                style={{ borderRadius: R, color: P }}
              >
                <Icons.X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* List */}
          <section aria-labelledby="list-heading" className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
              <div>
                <h2 id="list-heading" className="text-xl font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
                  Indexed files
                </h2>
                <p className="text-sm mt-1">
                  Showing {filtered.length} of {docs.length} · newest upload first
                </p>
              </div>
              <div className="w-full sm:w-72">
                <Label htmlFor="doc-search" className="text-xs font-semibold">Search by filename</Label>
                <div className="relative mt-1.5">
                  <Icons.Search
                    className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: hexToRgba(N, 0.7) }}
                    aria-hidden="true"
                  />
                  <Input
                    id="doc-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="handbook, runbook, .docx…"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter documents by status">
              {statusTabs.map((t) => {
                const active = status === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatus(t.key)}
                    className="kb-focus px-3.5 py-2 text-sm font-medium transition-colors"
                    style={{
                      borderRadius: R,
                      backgroundColor: active ? P : "#FFFFFF",
                      color: active ? "#FFFFFF" : N,
                      border: `1px solid ${active ? P : hexToRgba(N, 0.22)}`,
                      fontVariantNumeric: "tabular-nums"
                    }}
                  >
                    {t.label}
                    <span className="ml-1.5 opacity-80">{counts[t.key]}</span>
                  </button>
                );
              })}
            </div>

            <div className="bg-white overflow-hidden" style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}` }}>
              {loading ? (
                <div className="p-5 space-y-4" aria-live="polite">
                  <p className="text-sm">Reading the document index…</p>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="h-9 w-9" style={{ borderRadius: R, backgroundColor: hexToRgba(N, 0.12) }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2" style={{ borderRadius: 4, backgroundColor: hexToRgba(N, 0.14) }} />
                        <div className="h-2.5 w-1/4" style={{ borderRadius: 4, backgroundColor: hexToRgba(N, 0.09) }} />
                      </div>
                      <div className="h-6 w-20" style={{ borderRadius: R, backgroundColor: hexToRgba(N, 0.1) }} />
                    </div>
                  ))}
                </div>
              ) : docs.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <Icons.Upload className="w-7 h-7 mx-auto" style={{ color: hexToRgba(P, 0.55) }} aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
                    The knowledge base is empty
                  </h3>
                  <p className="mt-2 text-sm max-w-md mx-auto">
                    Until a file is indexed, every question gets the same reply: the documents don't cover it. Upload a policy
                    or handbook above to give the assistant something to quote.
                  </p>
                  <div className="mt-5">
                    <Button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ backgroundColor: P, color: "#FFFFFF", borderRadius: R }}>
                      Choose the first file
                    </Button>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <Icons.Search className="w-6 h-6 mx-auto" style={{ color: hexToRgba(N, 0.6) }} aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
                    Nothing matches that
                  </h3>
                  <p className="mt-2 text-sm">
                    No {status !== "all" ? status + " " : ""}document is called
                    {query.trim() ? ` “${query.trim()}”` : " that"}.
                  </p>
                  <div className="mt-5">
                    <Button
                      onClick={() => { setQuery(""); setStatus("all"); }}
                      style={{ backgroundColor: "#FFFFFF", color: P, border: `1px solid ${hexToRgba(P, 0.35)}`, borderRadius: R }}
                    >
                      Clear search and filter
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full" style={{ fontVariantNumeric: "tabular-nums" }}>
                    <THead>
                      <TR>
                        <TH>Document</TH>
                        <TH>Size</TH>
                        <TH>Uploaded</TH>
                        <TH>Status</TH>
                        <TH><span className="sr-only">Actions</span></TH>
                      </TR>
                    </THead>
                    <TBody>
                      {filtered.map((d) => {
                        const isSel = d.id === selectedId;
                        return (
                          <TR
                            key={d.id}
                            className={enteringIds.includes(d.id) ? "kb-row-in" : ""}
                            style={isSel ? { backgroundColor: hexToRgba(P, 0.06), boxShadow: `inset 3px 0 0 ${A}` } : undefined}
                          >
                            <TD>
                              <div className="flex items-start gap-3 min-w-0">
                                <Icons.FileText className="w-4 h-4 mt-1 shrink-0" style={{ color: hexToRgba(P, 0.7) }} aria-hidden="true" />
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={() => { setSelectedId(d.id); setShowNotes(false); }}
                                    aria-pressed={isSel}
                                    className="kb-focus text-left text-sm font-semibold hover:underline break-all"
                                    style={{ color: P, borderRadius: 4 }}
                                  >
                                    {d.filename}
                                  </button>
                                  <p className="text-xs mt-1">
                                    <span className="uppercase font-semibold">{d.file_type}</span>
                                    <span aria-hidden="true"> · </span>
                                    {shortName(d.uploaded_by)}
                                  </p>
                                  {d.status === "failed" && (
                                    <p className="text-xs mt-1.5 max-w-sm" style={{ color: N }}>
                                      {d.failure_reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TD>
                            <TD className="text-sm whitespace-nowrap">{fmtBytes(d.size_bytes)}</TD>
                            <TD className="text-sm whitespace-nowrap">{fmtDate(d.uploaded_at)}</TD>
                            <TD>
                              <StatusPill doc={d} />
                              {d.status === "processing" && (
                                <div className="mt-2 w-32">
                                  <div
                                    role="progressbar"
                                    aria-valuenow={Math.min(100, d.progress || 0)}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-label={`Processing ${d.filename}`}
                                    className="h-1.5 w-full overflow-hidden"
                                    style={{ borderRadius: 999, backgroundColor: hexToRgba(N, 0.15) }}
                                  >
                                    <div
                                      className="h-full kb-bar"
                                      style={{ width: `${Math.min(100, d.progress || 0)}%`, backgroundColor: A }}
                                    />
                                  </div>
                                  <p className="text-xs mt-1">{Math.min(100, d.progress || 0)}% · embedding</p>
                                </div>
                              )}
                              {d.status === "ready" && (
                                <p className="text-xs mt-1.5">{d.chunks} passages</p>
                              )}
                            </TD>
                            <TD>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => reprocess(d)}
                                  disabled={d.status === "processing"}
                                  className="kb-focus px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.3)}`, backgroundColor: "#FFFFFF" }}
                                >
                                  Re-process
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Delete ${d.filename}`}
                                  onClick={() => setConfirmDoc(d)}
                                  className="kb-focus p-2 transition-colors"
                                  style={{ borderRadius: R, color: N, border: `1px solid ${hexToRgba(N, 0.22)}` }}
                                >
                                  <Icons.Trash className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </div>
                            </TD>
                          </TR>
                        );
                      })}
                    </TBody>
                  </Table>
                </div>
              )}
            </div>

            {!loading && filtered.length > 0 && (
              <p className="text-xs mt-3">
                Page 1 of 1 · {filtered.length} shown. Lists over 100 files paginate.
              </p>
            )}
          </section>
        </div>

        {/* RIGHT PANE — permanent evidence / guidance panel */}
        <aside className="lg:sticky lg:top-6">
          <div
            className="bg-white overflow-hidden"
            style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}` }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between gap-3"
              style={{ borderBottom: `1px solid ${hexToRgba(N, 0.14)}`, backgroundColor: hexToRgba(P, 0.04) }}
            >
              <h2 className="text-sm font-semibold tracking-wide uppercase" style={{ fontFamily: brand.fontHeading, color: P, letterSpacing: "0.08em" }}>
                {panelShowsNotes ? "Getting started" : "Document detail"}
              </h2>
              {selected && (
                <button
                  type="button"
                  onClick={() => setShowNotes((v) => !v)}
                  className="kb-focus text-xs font-semibold underline underline-offset-2"
                  style={{ color: P, borderRadius: 4 }}
                >
                  {panelShowsNotes ? "Back to file" : "Getting started"}
                </button>
              )}
            </div>

            {panelShowsNotes ? (
              <div className="p-5 kb-panel-in">
                <h3 className="text-base font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
                  Four things to know before you upload
                </h3>
                <ol className="mt-4 space-y-4 text-sm leading-relaxed">
                  <li>
                    <span className="font-semibold" style={{ color: P }}>1. Supported files.</span> PDF, Word (.docx), plain
                    text and Markdown, up to 50 MB each. Spreadsheets, slide decks and media are refused on selection. A
                    scanned PDF with no text layer will fail — there is no OCR in this version.
                  </li>
                  <li>
                    <span className="font-semibold" style={{ color: P }}>2. What the statuses mean.</span>
                    <ul className="mt-2 space-y-1.5">
                      <li className="flex gap-2">
                        <Icons.Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#5A4206" }} aria-hidden="true" />
                        <span><strong style={{ color: P }}>Processing</strong> — extracting, chunking and embedding. Not answerable yet.</span>
                      </li>
                      <li className="flex gap-2">
                        <Icons.CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: P }} aria-hidden="true" />
                        <span><strong style={{ color: P }}>Ready</strong> — in the index and eligible to be retrieved and cited.</span>
                      </li>
                      <li className="flex gap-2">
                        <Icons.AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: N }} aria-hidden="true" />
                        <span><strong style={{ color: P }}>Failed</strong> — nothing of it is in the index. Re-process after a timeout; re-upload after an extraction problem.</span>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold" style={{ color: P }}>3. Deleting is final.</span> Delete removes the
                    passages from the index and the original from S3. Answers stop quoting it immediately, and older answers
                    show the citation as no longer available.
                  </li>
                  <li>
                    <span className="font-semibold" style={{ color: P }}>4. Who can do this.</span> Only admins upload,
                    re-process and delete. Employees can ask questions and read their own history.
                  </li>
                </ol>

                <Separator className="my-5" />

                <div className="flex flex-col gap-2.5">
                  <Button
                    onClick={() => navigate("chat")}
                    style={{ backgroundColor: P, color: "#FFFFFF", borderRadius: R, width: "100%" }}
                  >
                    Ask a question to test the index
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate("users")}
                    className="kb-focus px-4 py-2 text-sm font-semibold"
                    style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.3)}` }}
                  >
                    Make a colleague an admin
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 kb-panel-in">
                <h3 className="text-base font-semibold break-all" style={{ fontFamily: brand.fontHeading, color: P }}>
                  {selected.filename}
                </h3>
                <div className="mt-1.5">
                  <StatusPill doc={selected} />
                </div>

                <dl className="mt-5 space-y-3 text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {[
                    ["Type", selected.file_type.toUpperCase()],
                    ["Size", fmtBytes(selected.size_bytes)],
                    ["Uploaded by", shortName(selected.uploaded_by)],
                    ["Uploaded at", fmtDate(selected.uploaded_at)],
                    ["Passages", selected.status === "ready" ? String(selected.chunks) : "—"]
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-xs uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>{k}</dt>
                      <dd className="font-medium text-right" style={{ color: P }}>{v}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-4">
                    <dt className="text-xs uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>S3 key</dt>
                    <dd className="font-mono text-xs break-all text-right">{selected.s3_key}</dd>
                  </div>
                </dl>

                <Separator className="my-5" />

                {selected.status === "failed" && (
                  <div
                    className="p-4 text-sm"
                    style={{ borderRadius: R, border: `1.5px solid ${hexToRgba(N, 0.5)}`, backgroundColor: hexToRgba(N, 0.06) }}
                  >
                    <p className="font-semibold flex items-center gap-2" style={{ color: P }}>
                      <Icons.AlertCircle className="w-4 h-4" aria-hidden="true" />
                      Why it failed
                    </p>
                    <p className="mt-2 leading-relaxed">{selected.failure_reason}</p>
                    <p className="mt-2 text-xs">The original is still in S3, so re-processing runs from the stored file.</p>
                  </div>
                )}

                {selected.status === "processing" && (
                  <div className="text-sm">
                    <p className="font-semibold" style={{ color: P }}>Indexing in progress</p>
                    <p className="mt-1.5 leading-relaxed">
                      Passages appear here once embedding finishes. Employees can keep asking questions meanwhile — this file
                      just won't be retrieved yet.
                    </p>
                    <div
                      className="mt-3 h-1.5 w-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={Math.min(100, selected.progress || 0)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Processing ${selected.filename}`}
                      style={{ borderRadius: 999, backgroundColor: hexToRgba(N, 0.15) }}
                    >
                      <div className="h-full kb-bar" style={{ width: `${Math.min(100, selected.progress || 0)}%`, backgroundColor: A }} />
                    </div>
                  </div>
                )}

                {selected.status === "ready" && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ letterSpacing: "0.08em" }}>
                      Indexed passages
                    </h4>
                    {selected.passages && selected.passages.length > 0 ? (
                      <ul className="space-y-3">
                        {selected.passages.map((p, i) => (
                          <li
                            key={p.page_ref}
                            className="p-3.5 text-sm leading-relaxed"
                            style={{
                              borderRadius: R,
                              backgroundColor: i === 0 ? hexToRgba(A, 0.22) : hexToRgba(P, 0.04),
                              borderLeft: `3px solid ${i === 0 ? A : hexToRgba(P, 0.25)}`
                            }}
                          >
                            <p className="text-xs font-semibold mb-1.5" style={{ color: P }}>{p.page_ref}</p>
                            <p>“{p.snippet}”</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm leading-relaxed">
                        {selected.chunks} passages are in the index. Ask a question in Chat to see them quoted with a page or
                        section reference.
                      </p>
                    )}
                  </div>
                )}

                <Separator className="my-5" />

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNotice({ tone: "ok", text: `Preparing a signed download link for ${selected.filename}.` })}
                    className="kb-focus inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold"
                    style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.3)}` }}
                  >
                    <Icons.Download className="w-4 h-4" aria-hidden="true" />
                    Download original
                  </button>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => reprocess(selected)}
                      disabled={selected.status === "processing"}
                      className="kb-focus flex-1 px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.3)}` }}
                    >
                      Re-process
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDoc(selected)}
                      className="kb-focus flex-1 px-4 py-2 text-sm font-semibold"
                      style={{ borderRadius: R, color: N, border: `1px solid ${hexToRgba(N, 0.4)}` }}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs">
                    Files can't be edited here — view, re-process or delete only.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Delete confirmation */}
      {confirmDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: hexToRgba(P, 0.45) }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDoc(null); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            className="bg-white w-full max-w-md p-6 kb-panel-in"
            style={{ borderRadius: R, borderTop: `3px solid ${A}` }}
          >
            <h2 id="confirm-title" className="text-lg font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
              Delete this document for everyone?
            </h2>
            <p id="confirm-desc" className="mt-3 text-sm leading-relaxed">
              <span className="font-semibold break-all" style={{ color: P }}>{confirmDoc.filename}</span> will be removed from
              the index and from S3. The assistant stops quoting it right away, and earlier answers will show the citation as
              no longer available. This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDoc(null)}
                className="kb-focus px-4 py-2 text-sm font-semibold"
                style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.3)}` }}
              >
                Keep it
              </button>
              <button
                type="button"
                ref={confirmBtnRef}
                onClick={confirmDelete}
                className="kb-focus px-4 py-2 text-sm font-semibold text-white"
                style={{ borderRadius: R, backgroundColor: P }}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
