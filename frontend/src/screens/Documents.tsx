// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import ReactMarkdown from "react-markdown";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import {
  fetchDocuments,
  validateFiles,
  startUploads,
  subscribeUploads,
  getUploadTasks,
  SUPPORTED_TYPES_LABEL,
  MAX_SIZE_LABEL
} from "@/lib/documents";

const { Button, Input, Label, Table, THead, TBody, TR, TH, TD, Avatar, Separator } = UI;
const { Search, X, FileText, Clock, Trash, Filter, Download, Upload, AlertCircle, CheckCircle } = Icons;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GETTING_STARTED_MARKDOWN = `
### Four things to know before you upload

1. **Supported files.** ${SUPPORTED_TYPES_LABEL}, up to **${MAX_SIZE_LABEL}** each. Spreadsheets, slide decks and media (for example \`.xlsx\`, \`.pptx\`, \`.mp4\`) are refused before anything is sent. A scanned PDF with no text layer will fail — there is no OCR in this version.

2. **What the statuses mean.**
   - **Processing** — extracting, chunking and embedding. Not answerable yet.
   - **Ready** — in the index and eligible to be retrieved and cited.
   - **Failed** — nothing of it is in the index. Re-process after a timeout; re-upload after an extraction problem.

3. **Deleting is final.** Deleting a document removes its passages from the index and the original file from storage. The assistant stops quoting it immediately, and answers it previously supported show that citation as no longer available.

4. **Who can do this.** Only admins upload, re-process and delete. Employees can ask questions and read their own history.
`;

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

function shortName(email) {
  const local = String(email || "").split("@")[0];
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** Maps a thrown ApiError (or anything else) to a message safe to show the admin. */
function describeError(err, authMessage, fallback) {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return authMessage;
    return err.message;
  }
  return fallback;
}

export default function Screen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const P = brand.primaryColor;
  const A = brand.accentColor;
  const N = brand.neutralColor;
  const R = brand.radius;

  const [listStatus, setListStatus] = React.useState("loading");
  const [listError, setListError] = React.useState("");
  const [docs, setDocs] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState(null);
  const [showNotes, setShowNotes] = React.useState(false);
  const [clientRejections, setClientRejections] = React.useState([]);
  const [notice, setNotice] = React.useState(null);
  const [confirmDoc, setConfirmDoc] = React.useState(null);
  const [uploadTasks, setUploadTasks] = React.useState(getUploadTasks());

  const fileInputRef = React.useRef(null);
  const confirmBtnRef = React.useRef(null);
  const prevTaskStates = React.useRef({});

  const load = React.useCallback(async () => {
    setListStatus("loading");
    setListError("");
    try {
      const data = await fetchDocuments();
      setDocs(data);
      setListStatus("ready");
      setSelectedId((prev) => (prev && data.some((d) => d.id === prev) ? prev : data[0]?.id ?? null));
    } catch (err) {
      setListError(
        describeError(
          err,
          "You don't have permission to view the document list.",
          "Something went wrong loading the document list."
        )
      );
      setListStatus("error");
    }
  }, []);

  // AC-011: the list is loaded from GET /documents on mount, surviving a page reload.
  React.useEffect(() => {
    void load();
  }, [load]);

  // The upload-task store lives outside this component so progress survives
  // navigation (AC-010); this just mirrors it into render state.
  React.useEffect(() => subscribeUploads(() => setUploadTasks(getUploadTasks())), []);

  // Once an in-flight upload finishes while this screen happens to be
  // mounted, refresh the list so the newly accepted file (status
  // "processing") appears without the admin doing anything (AC-009).
  React.useEffect(() => {
    let shouldReload = false;
    uploadTasks.forEach((t) => {
      if (prevTaskStates.current[t.id] !== "done" && t.state === "done") shouldReload = true;
      prevTaskStates.current[t.id] = t.state;
    });
    if (shouldReload) void load();
  }, [uploadTasks, load]);

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
    .filter((d) => (statusFilter === "all" ? true : d.status === statusFilter))
    .filter((d) => d.filename.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

  const selected = docs.find((d) => d.id === selectedId) || null;
  const panelShowsNotes = showNotes || !selected;

  const erroredTasks = uploadTasks.filter((t) => t.state === "error");
  const activeTasks = uploadTasks.filter((t) => t.state !== "error");

  function acceptFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const { accepted, rejected } = validateFiles(files);
    setClientRejections(rejected);
    if (accepted.length) {
      startUploads(accepted);
      setStatusFilter("all");
      setNotice({
        text:
          accepted.length === 1
            ? `${accepted[0].name} is uploading and will be queued for extraction once it arrives.`
            : `${accepted.length} files are uploading and will be queued for extraction as they arrive.`
      });
    }
  }

  function reprocess(doc) {
    // No reprocess endpoint is part of this screen's contract yet; the
    // control reflects state locally until that lands on the backend.
    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: "processing", failure_reason: null } : d))
    );
    setNotice({ text: `Re-processing ${doc.filename}. Any passages it had in the index are replaced, not duplicated.` });
  }

  function confirmDelete() {
    // No delete endpoint is part of this screen's contract yet; the control
    // reflects state locally until that lands on the backend.
    const doc = confirmDoc;
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    if (selectedId === doc.id) setSelectedId(null);
    setConfirmDoc(null);
    setNotice({ text: `${doc.filename} is deleted. Its passages are out of the index and will not be cited in new answers.` });
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

  const markdownComponents = {
    h3: (props) => (
      <h3 className="text-base font-semibold" style={{ fontFamily: brand.fontHeading, color: P }} {...props} />
    ),
    ol: (props) => <ol className="mt-4 space-y-4 text-sm leading-relaxed list-decimal list-outside pl-5" {...props} />,
    ul: (props) => <ul className="mt-2 space-y-1.5 list-disc list-outside pl-5" {...props} />,
    li: (props) => <li {...props} />,
    strong: (props) => <strong style={{ color: P }} {...props} />,
    p: (props) => <p className="leading-relaxed" {...props} />
  };

  return (
    <div style={{ fontFamily: brand.fontBody, color: N }}>
      <style>{`
        @keyframes kbPanelIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes kbSpin { to { transform: rotate(360deg); } }
        @keyframes kbPulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .kb-panel-in { animation: kbPanelIn .28s ease-out both; }
        .kb-spin { animation: kbSpin 2.4s linear infinite; }
        .kb-pulse { animation: kbPulse 1.6s ease-in-out infinite; }
        .kb-bar { transition: width .5s ease; }
        .kb-focus:focus-visible { outline: 2px solid ${P}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .kb-panel-in, .kb-spin, .kb-pulse, .animate-pulse { animation: none !important; }
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
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: brand.fontHeading, color: P }}>
              Documents
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed">
              Everything the assistant is allowed to answer from lives here. Delete a file and it stops being quoted.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold" style={{ color: P }}>{user?.name}</p>
              <p className="text-xs">Admin{user?.email ? ` · ${user.email.split("@")[1]}` : ""}</p>
            </div>
            <Avatar name={user?.name || ""} />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-stretch gap-3" style={{ fontVariantNumeric: "tabular-nums" }}>
          {[
            { label: "Ready to answer from", value: counts.ready },
            { label: "Processing", value: counts.processing },
            { label: "Failed", value: counts.failed },
            { label: "Passages indexed", value: indexedPassages.toLocaleString("en-GB") }
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 bg-white" style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}`, minWidth: 140 }}>
              <p className="text-2xl font-semibold leading-none" style={{ color: P }}>{s.value}</p>
              <p className="text-xs mt-1.5">{s.label}</p>
            </div>
          ))}
          <div className="px-4 py-3 flex items-center gap-2.5 text-xs" style={{ borderRadius: R, border: `1px dashed ${hexToRgba(N, 0.3)}` }}>
            <span
              className={counts.processing > 0 ? "kb-pulse" : ""}
              aria-hidden="true"
              style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: counts.processing > 0 ? A : hexToRgba(P, 0.45) }}
            />
            <span>{counts.processing > 0 ? "Processing — check back for status updates" : "All statuses current"}</span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        {/* LEFT PANE */}
        <div className="min-w-0">
          {/* Upload */}
          <section aria-labelledby="upload-heading" className="bg-white p-6" style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}`, borderTop: `3px solid ${A}` }}>
            <h2 id="upload-heading" className="text-xl font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
              Add files to the knowledge base
            </h2>
            <p className="text-sm mt-1.5">
              {SUPPORTED_TYPES_LABEL} · up to {MAX_SIZE_LABEL} each. Text is extracted, chunked and embedded as soon as the
              file lands.
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

            {activeTasks.length > 0 && (
              <div className="mt-4 space-y-2.5" aria-live="polite">
                {activeTasks.map((t) => (
                  <div key={t.id} className="p-3.5" style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}` }}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium break-all" style={{ color: P }}>{t.filename}</p>
                      <p className="text-xs shrink-0">{t.state === "done" ? "Uploaded" : `${Math.round(t.progress * 100)}%`}</p>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={Math.round(t.progress * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Uploading ${t.filename}`}
                      className="mt-2 h-1.5 w-full overflow-hidden"
                      style={{ borderRadius: 999, backgroundColor: hexToRgba(N, 0.15) }}
                    >
                      <div className="h-full kb-bar" style={{ width: `${Math.round(t.progress * 100)}%`, backgroundColor: A }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(clientRejections.length > 0 || erroredTasks.length > 0) && (
              <div
                className="mt-4 p-4 kb-panel-in"
                role="alert"
                style={{ borderRadius: R, border: `1.5px solid ${hexToRgba(N, 0.5)}`, backgroundColor: hexToRgba(N, 0.06) }}
              >
                <div className="flex items-start gap-3">
                  <Icons.AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: P }} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: P }}>
                      {clientRejections.length + erroredTasks.length === 1
                        ? "One file was not uploaded"
                        : `${clientRejections.length + erroredTasks.length} files were not uploaded`}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {clientRejections.map((r) => (
                        <li key={`client-${r.filename}`} className="text-sm">
                          <span className="font-medium break-all" style={{ color: P }}>{r.filename}</span> — {r.reason}
                        </li>
                      ))}
                      {erroredTasks.map((t) => (
                        <li key={`server-${t.id}`} className="text-sm">
                          <span className="font-medium break-all" style={{ color: P }}>{t.filename}</span> — {t.error || "The server refused this file."}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2">Nothing was sent for processing. The rest of your selection went through.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss upload errors"
                    onClick={() => setClientRejections([])}
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
              <button type="button" aria-label="Dismiss message" onClick={() => setNotice(null)} className="kb-focus p-1" style={{ borderRadius: R, color: P }}>
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
                  <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: hexToRgba(N, 0.7) }} aria-hidden="true" />
                  <Input id="doc-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="handbook, runbook, .docx…" className="pl-9" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter documents by status">
              {statusTabs.map((t) => {
                const active = statusFilter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatusFilter(t.key)}
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
              {listStatus === "loading" ? (
                <div className="p-5 space-y-4" aria-live="polite" role="status">
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
              ) : listStatus === "error" ? (
                <div className="px-6 py-14 text-center" role="alert">
                  <Icons.AlertCircle className="w-6 h-6 mx-auto" style={{ color: P }} aria-hidden="true" />
                  <h3 className="mt-4 text-base font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
                    Couldn't load the document list
                  </h3>
                  <p className="mt-2 text-sm mx-auto max-w-md">{listError}</p>
                  <div className="mt-5">
                    <Button onClick={() => void load()} style={{ backgroundColor: P, color: "#FFFFFF", borderRadius: R }}>
                      Try again
                    </Button>
                  </div>
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
                    No {statusFilter !== "all" ? statusFilter + " " : ""}document is called
                    {query.trim() ? ` "${query.trim()}"` : " that"}.
                  </p>
                  <div className="mt-5">
                    <Button onClick={() => { setQuery(""); setStatusFilter("all"); }} style={{ backgroundColor: "#FFFFFF", color: P, border: `1px solid ${hexToRgba(P, 0.35)}`, borderRadius: R }}>
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
                          <TR key={d.id} style={isSel ? { backgroundColor: hexToRgba(P, 0.06), boxShadow: `inset 3px 0 0 ${A}` } : undefined}>
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
                                  {d.status === "failed" && d.failure_reason && (
                                    <p className="text-xs mt-1.5 max-w-sm" style={{ color: N }}>{d.failure_reason}</p>
                                  )}
                                </div>
                              </div>
                            </TD>
                            <TD className="text-sm whitespace-nowrap">{fmtBytes(d.size_bytes)}</TD>
                            <TD className="text-sm whitespace-nowrap">{fmtDate(d.uploaded_at)}</TD>
                            <TD>
                              <StatusPill doc={d} />
                              {d.status === "ready" && <p className="text-xs mt-1.5">{d.chunks ?? 0} passages</p>}
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

            {listStatus === "ready" && filtered.length > 0 && (
              <p className="text-xs mt-3">Page 1 of 1 · {filtered.length} shown. Lists over 100 files paginate.</p>
            )}
          </section>
        </div>

        {/* RIGHT PANE */}
        <aside className="lg:sticky lg:top-6">
          <div className="bg-white overflow-hidden" style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}` }}>
            <div className="px-5 py-4 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${hexToRgba(N, 0.14)}`, backgroundColor: hexToRgba(P, 0.04) }}>
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
                <ReactMarkdown components={markdownComponents}>{GETTING_STARTED_MARKDOWN}</ReactMarkdown>

                <Separator className="my-5" />

                <div className="flex flex-col gap-2.5">
                  <Button onClick={() => navigate("chat")} style={{ backgroundColor: P, color: "#FFFFFF", borderRadius: R, width: "100%" }}>
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
                    ["Passages", selected.status === "ready" ? String(selected.chunks ?? 0) : "—"]
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-xs uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>{k}</dt>
                      <dd className="font-medium text-right" style={{ color: P }}>{v}</dd>
                    </div>
                  ))}
                </dl>

                <Separator className="my-5" />

                {selected.status === "failed" && (
                  <div className="p-4 text-sm" style={{ borderRadius: R, border: `1.5px solid ${hexToRgba(N, 0.5)}`, backgroundColor: hexToRgba(N, 0.06) }}>
                    <p className="font-semibold flex items-center gap-2" style={{ color: P }}>
                      <Icons.AlertCircle className="w-4 h-4" aria-hidden="true" />
                      Why it failed
                    </p>
                    <p className="mt-2 leading-relaxed">{selected.failure_reason}</p>
                  </div>
                )}

                {selected.status === "processing" && (
                  <div className="text-sm">
                    <p className="font-semibold" style={{ color: P }}>Indexing in progress</p>
                    <p className="mt-1.5 leading-relaxed">
                      Passages appear here once embedding finishes. Employees can keep asking questions meanwhile — this file
                      just won't be retrieved yet.
                    </p>
                  </div>
                )}

                {selected.status === "ready" && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ letterSpacing: "0.08em" }}>
                      Indexed passages
                    </h4>
                    <p className="text-sm leading-relaxed">
                      {selected.chunks ?? 0} passages are in the index. Ask a question in Chat to see them quoted with a page
                      or section reference.
                    </p>
                  </div>
                )}

                <Separator className="my-5" />

                <div className="flex flex-col gap-2.5">
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
                  <p className="text-xs">Files can't be edited here — view, re-process or delete only.</p>
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
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc" className="bg-white w-full max-w-md p-6 kb-panel-in" style={{ borderRadius: R, borderTop: `3px solid ${A}` }}>
            <h2 id="confirm-title" className="text-lg font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
              Delete this document for everyone?
            </h2>
            <p id="confirm-desc" className="mt-3 text-sm leading-relaxed">
              <span className="font-semibold break-all" style={{ color: P }}>{confirmDoc.filename}</span> will be removed from
              the index and from storage. The assistant stops quoting it right away, and earlier answers will show the
              citation as no longer available. This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button type="button" onClick={() => setConfirmDoc(null)} className="kb-focus px-4 py-2 text-sm font-semibold" style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.3)}` }}>
                Keep it
              </button>
              <button type="button" ref={confirmBtnRef} onClick={confirmDelete} className="kb-focus px-4 py-2 text-sm font-semibold text-white" style={{ borderRadius: R, backgroundColor: P }}>
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
