// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Card, Input, Textarea, Label, Select, Badge, Separator } = UI;
const { Plus, Search, X, ChevronRight, User, FileText, Clock, Trash, Download, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } = Icons;

const KB_STATUS = { ready: 47, processing: 2, updated: "12 min ago" };

const PASSAGES = {
  "hb-42": {
    document_id: "doc_018",
    document_name: "Employee Handbook 2026.pdf",
    file_type: "PDF",
    page_ref: "Page 42 — Family leave",
    uploaded_by: "maya.osei@northgate.co",
    uploaded_at: "4 Aug 2026",
    size: "4.2 MB",
    available: true,
    lines: [
      { t: "8.3 Parental leave", hl: false },
      { t: "Paid parental leave is available to employees on a permanent or fixed-term contract of employment.", hl: true },
      { t: "Agency workers and independent contractors are not covered by this scheme, and the company pays no top-up to any statutory entitlement held through their agency.", hl: true },
      { t: "Eligible employees must have completed 26 weeks of continuous service at the fifteenth week before the expected week of childbirth.", hl: false },
      { t: "Requests are made through People Ops at least eight weeks before the intended start date, using the leave form in the People portal.", hl: false }
    ]
  },
  "con-42": {
    document_id: "doc_031",
    document_name: "Contractor Engagement Policy.docx",
    file_type: "DOCX",
    page_ref: "Section 4.2 — Benefits and entitlements",
    uploaded_by: "daniel.reyes@northgate.co",
    uploaded_at: "12 Sep 2026",
    size: "386 KB",
    available: true,
    lines: [
      { t: "4.2 Benefits and entitlements", hl: false },
      { t: "Contractors engaged through an agency receive no company benefits, including parental leave, private medical cover and the pension top-up.", hl: true },
      { t: "Statutory entitlements, where they apply, remain the responsibility of the engaging agency.", hl: true },
      { t: "Hiring managers must not promise company benefits during negotiation. Queries are routed to People Ops before any offer is made.", hl: false }
    ]
  },
  "con-61": {
    document_id: "doc_031",
    document_name: "Contractor Engagement Policy.docx",
    file_type: "DOCX",
    page_ref: "Section 6.1 — Conversion to permanent employment",
    uploaded_by: "daniel.reyes@northgate.co",
    uploaded_at: "12 Sep 2026",
    size: "386 KB",
    available: true,
    lines: [
      { t: "6.1 Conversion to permanent employment", hl: false },
      { t: "Continuous service begins on the start date of the permanent contract. Time worked under an agency agreement does not count towards continuous service.", hl: true },
      { t: "The hiring manager confirms the conversion date with People Ops within five working days so that entitlements are calculated from the correct date.", hl: true },
      { t: "Notice periods revert to the standard schedule in the Employee Handbook from the conversion date.", hl: false }
    ]
  },
  "exp-12": {
    document_id: "doc_007",
    document_name: "Travel & Expenses Policy v7.pdf",
    file_type: "PDF",
    page_ref: "Page 12 — Client entertainment",
    uploaded_by: "maya.osei@northgate.co",
    uploaded_at: "21 Jul 2026",
    size: "1.8 MB",
    available: true,
    lines: [
      { t: "5. Client entertainment", hl: false },
      { t: "Client meals are capped at £65 per head in the UK and $90 per head in the US, inclusive of service and drinks.", hl: true },
      { t: "Any spend above the cap requires written approval from a director before the meal takes place. Retrospective approval is not granted.", hl: true },
      { t: "Entertainment of public officials is prohibited at any value and must be declined.", hl: false }
    ]
  },
  "exp-13": {
    document_id: "doc_007",
    document_name: "Travel & Expenses Policy v7.pdf",
    file_type: "PDF",
    page_ref: "Page 13 — Receipts and review",
    uploaded_by: "maya.osei@northgate.co",
    uploaded_at: "21 Jul 2026",
    size: "1.8 MB",
    available: true,
    lines: [
      { t: "5.4 Receipts", hl: false },
      { t: "Itemised receipts are required. Card statements alone are rejected at review and the claim is returned unpaid.", hl: true },
      { t: "Claims are submitted within 30 days of the spend date. Finance reviews claims each Tuesday.", hl: false }
    ]
  },
  "rw-3": {
    document_id: "doc_022",
    document_name: "Remote Working Standard.md",
    file_type: "MD",
    page_ref: "Section 3 — Travel access",
    uploaded_by: "priya.nandakumar@northgate.co",
    uploaded_at: "2 Oct 2026",
    size: "24 KB",
    available: true,
    lines: [
      { t: "## 3. Travel access", hl: false },
      { t: "Temporary VPN access from outside the UK must be requested at least 3 working days before departure.", hl: true },
      { t: "Travel access is granted for a maximum of 21 consecutive days per trip and expires automatically.", hl: true },
      { t: "Only company-issued laptops may connect to the corporate VPN from abroad. Personal devices are refused at the gateway.", hl: true },
      { t: "Extensions beyond a single trip are handled case by case by IT Security.", hl: false }
    ]
  },
  "sec-8": {
    document_id: "doc_004",
    document_name: "Information Security Policy.pdf",
    file_type: "PDF",
    page_ref: "Page 8 — Incident reporting",
    uploaded_by: "daniel.reyes@northgate.co",
    uploaded_at: "15 Jun 2026",
    size: "2.6 MB",
    available: true,
    lines: [
      { t: "4.1 Reporting a suspected incident", hl: false },
      { t: "Suspected phishing or any suspected compromise must be reported within 1 hour of discovery.", hl: true },
      { t: "Use the Report Phishing button in Outlook, or forward to security@northgate.co if the button is unavailable. Do not delete the message.", hl: true },
      { t: "Security acknowledges every report and will confirm whether action is needed on your device.", hl: false }
    ]
  },
  "ir-legacy": {
    document_id: "doc_002",
    document_name: "Incident Response Playbook 2023.docx",
    file_type: "DOCX",
    page_ref: "Section 2 — Triage windows",
    uploaded_by: "daniel.reyes@northgate.co",
    uploaded_at: "3 Mar 2026",
    size: "612 KB",
    available: false,
    deleted_on: "9 Oct 2026",
    deleted_by: "maya.osei@northgate.co",
    lines: []
  },
  "it-2": {
    document_id: "doc_040",
    document_name: "IT Equipment Guide.docx",
    file_type: "DOCX",
    page_ref: "Section 2 — Refresh cycle",
    uploaded_by: "priya.nandakumar@northgate.co",
    uploaded_at: "28 Aug 2026",
    size: "740 KB",
    available: true,
    lines: [
      { t: "2. Refresh cycle", hl: false },
      { t: "Standard laptops are refreshed every 36 months from the issue date recorded in the asset register.", hl: true },
      { t: "Engineering and design roles may request a 24-month cycle with line-manager approval.", hl: true },
      { t: "Replaced machines are wiped to the current standard and either redeployed or recycled through the approved vendor.", hl: false }
    ]
  },
  "hb-18": {
    document_id: "doc_018",
    document_name: "Employee Handbook 2026.pdf",
    file_type: "PDF",
    page_ref: "Page 18 — Annual leave",
    uploaded_by: "maya.osei@northgate.co",
    uploaded_at: "4 Aug 2026",
    size: "4.2 MB",
    available: true,
    lines: [
      { t: "3.1 Annual leave", hl: false },
      { t: "Full-time employees receive 25 days of annual leave per year, plus public holidays.", hl: true },
      { t: "Up to 5 unused days may be carried into the following year and must be taken by 31 March.", hl: true },
      { t: "Leave is requested in the People portal and approved by your line manager.", hl: false }
    ]
  },
  "hb-27": {
    document_id: "doc_018",
    document_name: "Employee Handbook 2026.pdf",
    file_type: "PDF",
    page_ref: "Page 27 — Pay dates",
    uploaded_by: "maya.osei@northgate.co",
    uploaded_at: "4 Aug 2026",
    size: "4.2 MB",
    available: true,
    lines: [
      { t: "6.2 Pay dates", hl: false },
      { t: "Salaries are paid on the 25th of each month, or the preceding working day where the 25th falls on a weekend or public holiday.", hl: true },
      { t: "Payslips are published in the People portal two working days before payment.", hl: true },
      { t: "Changes to bank details must be submitted by the 15th to take effect that month.", hl: false }
    ]
  }
};

const ANSWER_BANK = [
  {
    keys: ["contractor", "parental", "maternity", "paternity"],
    text:
      "Contractors engaged through an agency are not covered by the company parental leave scheme. Paid parental leave is limited to employees on a permanent or fixed-term contract of employment, and the company pays no top-up to any statutory entitlement a contractor holds through their agency. A contractor who converts to a permanent contract becomes eligible once they complete 26 weeks of continuous service, counted from the conversion date.",
    citationIds: ["hb-42", "con-42"]
  },
  {
    keys: ["dinner", "expense", "entertain", "meal", "receipt", "claim"],
    text:
      "Client meals are capped at £65 per head in the UK and $90 per head in the US, including service and drinks. Anything above the cap needs written approval from a director before the meal — the policy says retrospective approval is not granted. Itemised receipts are required; a card statement on its own is rejected at review and the claim comes back unpaid.",
    citationIds: ["exp-12", "exp-13"]
  },
  {
    keys: ["vpn", "abroad", "travel access", "remote", "spain", "working from"],
    text:
      "You can connect from abroad, but temporary travel access has to be requested at least 3 working days before you leave, and it is granted for a maximum of 21 consecutive days per trip before expiring automatically. Only a company-issued laptop may connect to the corporate VPN from outside the UK — personal devices are refused at the gateway.",
    citationIds: ["rw-3"]
  },
  {
    keys: ["phishing", "incident", "breach", "security", "report"],
    text:
      "A suspected phishing message or any suspected compromise must be reported within 1 hour of discovery. Use the Report Phishing button in Outlook, or forward the message to security@northgate.co if the button is unavailable, and do not delete it. Security acknowledges every report and confirms whether anything is needed on your device.",
    citationIds: ["sec-8"]
  },
  {
    keys: ["laptop", "hardware", "equipment", "refresh", "macbook"],
    text:
      "Standard laptops are refreshed every 36 months from the issue date recorded in the asset register. Engineering and design roles can request a 24-month cycle with line-manager approval. Replaced machines are wiped to the current standard, then redeployed or recycled through the approved vendor.",
    citationIds: ["it-2"]
  },
  {
    keys: ["holiday", "annual leave", "pto", "days off", "carry"],
    text:
      "Full-time employees get 25 days of annual leave a year plus public holidays. Up to 5 unused days can be carried into the next year, and the carried days have to be used by 31 March. Leave is requested in the People portal and approved by your line manager.",
    citationIds: ["hb-18"]
  },
  {
    keys: ["payroll", "salary", "pay date", "payslip", "paid"],
    text:
      "Salaries are paid on the 25th of each month, or the preceding working day when the 25th falls on a weekend or public holiday. Payslips appear in the People portal two working days before payment, and changes to bank details must be submitted by the 15th to take effect that month.",
    citationIds: ["hb-27"]
  }
];

const REFUSAL_TEXT =
  "I could not find an answer to this in the company documents. The passages I retrieved were not close enough to the question to support an answer, so I am not going to guess. If you think a document covers this, ask an admin to check it has been uploaded and finished processing.";

const PROVIDER_ERROR = {
  title: "The answer could not be generated",
  detail:
    "The model provider timed out after 30 seconds. Your question was kept — retry sends the same wording, nothing was written to your history."
};

const INITIAL_CONVERSATIONS = [
  {
    id: "conv_1047",
    title: "Parental leave for contractors",
    updated_label: "Today 09:12",
    messages: [
      { id: "m1", role: "user", status: "complete", content: "Do contractors get parental leave?", at: "09:10" },
      {
        id: "m2",
        role: "assistant",
        status: "complete",
        content: ANSWER_BANK[0].text,
        citationIds: ["hb-42", "con-42"],
        at: "09:10"
      },
      { id: "m3", role: "user", status: "complete", content: "What about after they convert to permanent?", at: "09:12" },
      {
        id: "m4",
        role: "assistant",
        status: "complete",
        content:
          "Continuous service starts on the date the permanent contract begins — time worked under the agency agreement is not counted towards the 26 weeks. The policy also asks the hiring manager to confirm the conversion date with People Ops within five working days, so entitlements are calculated from the right start date.",
        citationIds: ["con-61"],
        at: "09:12"
      }
    ]
  },
  {
    id: "conv_1042",
    title: "Client dinner expense limits",
    updated_label: "Mon 13 Oct",
    messages: [
      { id: "m1", role: "user", status: "complete", content: "What's the limit on client dinners in New York?", at: "16:48" },
      {
        id: "m2",
        role: "assistant",
        status: "failed",
        content: "",
        question: "What's the limit on client dinners in New York?",
        at: "16:48"
      }
    ]
  },
  {
    id: "conv_1038",
    title: "VPN access while travelling",
    updated_label: "Fri 10 Oct",
    messages: [
      { id: "m1", role: "user", status: "complete", content: "Can I use the VPN from Spain for three weeks?", at: "11:02" },
      { id: "m2", role: "assistant", status: "complete", content: ANSWER_BANK[2].text, citationIds: ["rw-3"], at: "11:02" },
      { id: "m3", role: "user", status: "complete", content: "And if I extend it to a full month?", at: "11:05" },
      {
        id: "m4",
        role: "assistant",
        status: "refused",
        content:
          "The Remote Working Standard caps travel access at 21 consecutive days and says extensions are handled case by case by IT Security, but it does not set out the rule for a month-long trip. Nothing else in the indexed documents covers it, so I cannot answer that from our material.",
        at: "11:05"
      }
    ]
  },
  {
    id: "conv_1031",
    title: "Reporting a phishing email",
    updated_label: "Wed 8 Oct",
    messages: [
      { id: "m1", role: "user", status: "complete", content: "How fast do I need to report a phishing email?", at: "08:24" },
      {
        id: "m2",
        role: "assistant",
        status: "complete",
        content: ANSWER_BANK[3].text,
        citationIds: ["sec-8", "ir-legacy"],
        at: "08:24"
      }
    ]
  },
  {
    id: "conv_1024",
    title: "Laptop refresh cycle",
    updated_label: "29 Sep",
    messages: [
      { id: "m1", role: "user", status: "complete", content: "When does my laptop get replaced?", at: "14:31" },
      { id: "m2", role: "assistant", status: "complete", content: ANSWER_BANK[4].text, citationIds: ["it-2"], at: "14:31" }
    ]
  }
];

const SUGGESTIONS = [
  "Do contractors get parental leave?",
  "What's the cap on a client dinner?",
  "Can I use the VPN while travelling?",
  "How many holiday days can I carry over?"
];

export default function Screen() {
  const navigate = useNavigate();
  const p = brand.primaryColor;
  const a = brand.accentColor;
  const n = brand.neutralColor;
  const line = n + "33";
  const faint = n + "14";
  const rad = brand.radius;

  const [conversations, setConversations] = React.useState(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = React.useState("conv_1047");
  const [query, setQuery] = React.useState("");
  const [input, setInput] = React.useState("");
  const [stream, setStream] = React.useState(null);
  const [activeCite, setActiveCite] = React.useState("hb-42");
  const [confirmId, setConfirmId] = React.useState(null);
  const [pane, setPane] = React.useState("chat");
  const [downloadFor, setDownloadFor] = React.useState(null);
  const uid = React.useRef(500);
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;
  const messages = active ? active.messages : [];

  const filtered = conversations.filter((c) =>
    (c.title || "New conversation").toLowerCase().includes(query.trim().toLowerCase())
  );

  const nextId = (prefix) => {
    uid.current += 1;
    return prefix + uid.current;
  };

  const clock = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  };

  const patch = (convId, fn, extra) =>
    setConversations((cs) =>
      cs.map((c) => (c.id === convId ? Object.assign({}, c, { messages: fn(c.messages) }, extra || {}) : c))
    );

  const resolve = (q, isRetry) => {
    const low = q.toLowerCase();
    if (!isRetry && /payroll|salary|payslip|pay date/.test(low)) return { kind: "error" };
    const hit = ANSWER_BANK.find((entry) => entry.keys.some((k) => low.includes(k)));
    if (hit) return { kind: "answer", text: hit.text, citationIds: hit.citationIds };
    return { kind: "refused", text: REFUSAL_TEXT, citationIds: [] };
  };

  const titleFrom = (q) => (q.length > 42 ? q.slice(0, 42).trim() + "…" : q);

  const send = (raw) => {
    const q = (raw === undefined ? input : raw).trim();
    if (!q || stream) return;
    const convId = activeId;
    const result = resolve(q, false);
    const userMsg = { id: nextId("m"), role: "user", status: "complete", content: q, at: clock() };
    const assistantId = nextId("m");
    const titlePatch = active && active.title ? {} : { title: titleFrom(q) };

    if (result.kind === "error") {
      patch(
        convId,
        (ms) => ms.concat([userMsg, { id: assistantId, role: "assistant", status: "failed", content: "", question: q, at: clock() }]),
        Object.assign({ updated_label: "Today " + clock() }, titlePatch)
      );
      setPane("chat");
      return;
    }

    patch(
      convId,
      (ms) => ms.concat([userMsg, { id: assistantId, role: "assistant", status: "streaming", content: "", at: clock() }]),
      Object.assign({ updated_label: "Today " + clock() }, titlePatch)
    );
    setInput("");
    setActiveCite(null);
    setPane("chat");
    setStream({ convId: convId, id: assistantId, text: result.text, citationIds: result.citationIds, kind: result.kind });
  };

  const retry = (msgId, question) => {
    if (stream) return;
    const convId = activeId;
    const result = resolve(question, true);
    const assistantId = nextId("m");
    patch(convId, (ms) =>
      ms.map((m) => (m.id === msgId ? { id: assistantId, role: "assistant", status: "streaming", content: "", at: clock() } : m))
    );
    setStream({ convId: convId, id: assistantId, text: result.text, citationIds: result.citationIds, kind: result.kind });
  };

  React.useEffect(() => {
    if (!stream) return undefined;
    const words = stream.text.split(" ");
    let i = 0;
    const reduced = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    const step = reduced ? words.length : 3;
    const handle = setInterval(() => {
      i += step;
      const done = i >= words.length;
      const partial = done ? stream.text : words.slice(0, i).join(" ");
      setConversations((cs) =>
        cs.map((c) =>
          c.id === stream.convId
            ? Object.assign({}, c, {
                messages: c.messages.map((m) =>
                  m.id === stream.id
                    ? Object.assign({}, m, {
                        content: partial,
                        status: done ? (stream.kind === "refused" ? "refused" : "complete") : "streaming",
                        citationIds: done ? stream.citationIds : undefined
                      })
                    : m
                )
              })
            : c
        )
      );
      if (done) {
        clearInterval(handle);
        if (stream.citationIds && stream.citationIds.length) setActiveCite(stream.citationIds[0]);
        setStream(null);
      }
    }, reduced ? 10 : 55);
    return () => clearInterval(handle);
  }, [stream]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, stream, activeId]);

  const newConversation = () => {
    const id = nextId("conv_");
    setConversations((cs) => [{ id: id, title: null, updated_label: "Today " + clock(), messages: [] }].concat(cs));
    setActiveId(id);
    setActiveCite(null);
    setInput("");
    setPane("chat");
    if (inputRef.current) inputRef.current.focus();
  };

  const deleteConversation = (id) => {
    setConversations((cs) => {
      const rest = cs.filter((c) => c.id !== id);
      if (id === activeId) {
        setActiveId(rest.length ? rest[0].id : null);
        setActiveCite(null);
      }
      return rest;
    });
    setConfirmId(null);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      if (confirmId) setConfirmId(null);
      else if (pane !== "chat") setPane("chat");
    }
  };

  const cite = activeCite ? PASSAGES[activeCite] : null;
  const canSend = input.trim().length > 0 && !stream;

  const paneCls = (name) =>
    (pane === name ? "flex" : "hidden") + " lg:flex";

  const fileBadge = (type) => (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide"
      style={{ backgroundColor: p + "14", color: p, borderRadius: "4px" }}
    >
      {type}
    </span>
  );

  return (
    <div
      onKeyDown={onKeyDown}
      className="w-full"
      style={{ fontFamily: brand.fontBody, color: p, backgroundColor: brand.backgroundColor }}
    >
      <style>{`
        .kbf:focus-visible { outline: 2px solid ${p}; outline-offset: 2px; border-radius: ${rad}; }
        @keyframes kb-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes kb-pulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        @keyframes kb-shimmer { 0% { opacity: .35; } 50% { opacity: .8; } 100% { opacity: .35; } }
        .kb-rise { animation: kb-rise .28s ease-out both; }
        .kb-dot { animation: kb-pulse 1.1s ease-in-out infinite; }
        .kb-shim { animation: kb-shimmer 1.4s ease-in-out infinite; }
        .kb-caret::after { content: "▍"; margin-left: 2px; animation: kb-pulse .9s steps(2) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .kb-rise, .kb-dot, .kb-shim, .kb-caret::after { animation: none !important; }
        }
      `}</style>

      <div
        className="grid gap-4 p-4 lg:p-5 lg:grid-cols-[268px_minmax(0,1fr)_392px]"
        style={{ height: "calc(100dvh - 4rem)", minHeight: "620px" }}
      >
        {/* ------------------------------ history rail ------------------------------ */}
        <section
          aria-label="Your conversations"
          className={paneCls("history") + " flex-col overflow-hidden bg-white"}
          style={{ borderRadius: rad, border: "1px solid " + line }}
        >
          <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid " + line }}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: n }}>
                History
              </h2>
              <span className="text-[12px] tabular-nums" style={{ color: n }}>
                {conversations.length}
              </span>
            </div>
            <Button
              onClick={newConversation}
              className="kbf mt-3 w-full justify-center text-[14px] font-semibold"
              style={{ backgroundColor: p, color: "#FFFFFF", borderRadius: rad }}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="ml-1.5">New conversation</span>
            </Button>
            <div className="relative mt-3">
              <Label htmlFor="history-search" className="sr-only">
                Search your conversations
              </Label>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: n }}
                aria-hidden="true"
              />
              <Input
                id="history-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles"
                className="kbf w-full pl-8 text-[14px]"
                style={{ borderRadius: rad, borderColor: line }}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filtered.length === 0 && conversations.length > 0 ? (
              <p className="px-3 py-6 text-[13px] leading-relaxed" style={{ color: n }}>
                No conversation title matches “{query.trim()}”. Try a word from the question you asked.
              </p>
            ) : null}

            {conversations.length === 0 ? (
              <p className="px-3 py-6 text-[13px] leading-relaxed" style={{ color: n }}>
                Your history is empty. Conversations appear here as soon as you ask something.
              </p>
            ) : null}

            <ul className="space-y-1">
              {filtered.map((c) => {
                const isActive = c.id === activeId;
                const label = c.title || "New conversation";
                if (confirmId === c.id) {
                  return (
                    <li
                      key={c.id}
                      className="kb-rise px-3 py-3"
                      style={{ borderRadius: rad, backgroundColor: faint, border: "1px solid " + line }}
                    >
                      <p className="text-[13px] font-medium leading-snug">Delete “{label}”?</p>
                      <p className="mt-1 text-[12px] leading-snug" style={{ color: n }}>
                        The questions and answers go with it. This cannot be undone.
                      </p>
                      <div className="mt-2.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => deleteConversation(c.id)}
                          className="kbf px-2.5 py-1 text-[12px] font-semibold text-white"
                          style={{ backgroundColor: p, borderRadius: "6px" }}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="kbf px-2.5 py-1 text-[12px] font-medium"
                          style={{ borderRadius: "6px", border: "1px solid " + line, color: n }}
                        >
                          Keep it
                        </button>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={c.id} className="group relative">
                    <button
                      type="button"
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => {
                        setActiveId(c.id);
                        const firstCited = c.messages.find((m) => m.citationIds && m.citationIds.length);
                        setActiveCite(firstCited ? firstCited.citationIds[0] : null);
                        setPane("chat");
                      }}
                      className="kbf w-full py-2.5 pl-3 pr-9 text-left"
                      style={{
                        borderRadius: rad,
                        backgroundColor: isActive ? p + "0F" : "transparent",
                        boxShadow: isActive ? "inset 3px 0 0 0 " + p : "none"
                      }}
                    >
                      <span className="block truncate text-[13.5px] font-medium leading-snug">{label}</span>
                      <span className="mt-0.5 block text-[12px] tabular-nums" style={{ color: n }}>
                        {c.updated_label} · {c.messages.filter((m) => m.role === "user").length} question
                        {c.messages.filter((m) => m.role === "user").length === 1 ? "" : "s"}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={"Delete conversation " + label}
                      onClick={() => setConfirmId(c.id)}
                      className="kbf absolute right-1.5 top-2.5 rounded p-1.5 opacity-60 hover:opacity-100"
                      style={{ color: n }}
                    >
                      <Trash className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <p
            className="flex items-start gap-2 px-4 py-3 text-[12px] leading-snug"
            style={{ borderTop: "1px solid " + line, color: n }}
          >
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Only you can see this history. Admins cannot read it.
          </p>
        </section>

        {/* ------------------------------ conversation ------------------------------ */}
        <section
          aria-label="Conversation"
          className={paneCls("chat") + " min-w-0 flex-col overflow-hidden bg-white"}
          style={{ borderRadius: rad, border: "1px solid " + line }}
        >
          <header className="px-5 pt-5 pb-4 lg:px-7" style={{ borderBottom: "1px solid " + line }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: n }}>
              Northgate knowledge base
            </p>
            <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
              <h1
                className="text-[26px] font-semibold leading-tight tracking-tight lg:text-[28px]"
                style={{ fontFamily: brand.fontHeading }}
              >
                {active ? active.title || "New conversation" : "No conversation open"}
              </h1>
              <div className="flex gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setPane("history")}
                  className="kbf px-2.5 py-1.5 text-[12px] font-medium"
                  style={{ border: "1px solid " + line, borderRadius: rad, color: p }}
                >
                  History
                </button>
                <button
                  type="button"
                  onClick={() => setPane("source")}
                  className="kbf px-2.5 py-1.5 text-[12px] font-medium"
                  style={{ border: "1px solid " + line, borderRadius: rad, color: p }}
                >
                  Source
                </button>
              </div>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] tabular-nums" style={{ color: n }}>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Index updated {KB_STATUS.updated}</span>
              <span aria-hidden="true">·</span>
              <span>{KB_STATUS.ready} documents ready</span>
              <span aria-hidden="true">·</span>
              <span>{KB_STATUS.processing} still processing, not yet searchable</span>
            </p>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-6 lg:px-7">
            {!active ? (
              <div className="mx-auto max-w-lg py-16 text-center">
                <h2 className="text-[17px] font-semibold">Nothing open</h2>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: n }}>
                  You deleted your last conversation. Start a new one to ask the knowledge base a question.
                </p>
                <button
                  type="button"
                  onClick={newConversation}
                  className="kbf mt-5 px-4 py-2 text-[14px] font-semibold text-white"
                  style={{ backgroundColor: p, borderRadius: rad }}
                >
                  New conversation
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="mx-auto max-w-xl py-6">
                <h2 className="text-[18px] font-semibold tracking-tight">Ask about anything we have uploaded</h2>
                <ul className="mt-4 space-y-2.5 text-[14.5px] leading-relaxed" style={{ color: n }}>
                  <li className="flex gap-2.5">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0" style={{ color: p }} aria-hidden="true" />
                    Answers come only from the company documents in the knowledge base — never from the model's general
                    knowledge.
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: p }} aria-hidden="true" />
                    Every answer carries citations. Select one and the passage opens beside the conversation, quoted lines
                    highlighted.
                  </li>
                  <li className="flex gap-2.5">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: p }} aria-hidden="true" />
                    When nothing relevant is found, it says so rather than guessing.
                  </li>
                </ul>
                <h3 className="mt-7 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: n }}>
                  Try one of these
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => send(s)}
                        className="kbf px-3 py-2 text-left text-[13.5px]"
                        style={{ border: "1px solid " + line, borderRadius: rad, color: p }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <ol className="mx-auto max-w-2xl space-y-6">
                {messages.map((m) => {
                  if (m.role === "user") {
                    return (
                      <li key={m.id} className="kb-rise flex justify-end">
                        <div className="max-w-[88%]">
                          <p className="mb-1 text-right text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: n }}>
                            You <span className="tabular-nums font-normal">{m.at}</span>
                          </p>
                          <p
                            className="px-4 py-3 text-[15px] leading-relaxed"
                            style={{ backgroundColor: p + "0F", borderRadius: rad }}
                          >
                            {m.content}
                          </p>
                        </div>
                      </li>
                    );
                  }

                  if (m.status === "failed") {
                    return (
                      <li key={m.id} className="kb-rise">
                        <div
                          className="px-4 py-4"
                          style={{ border: "1px solid " + line, borderLeft: "3px solid " + p, borderRadius: rad, backgroundColor: faint }}
                        >
                          <p className="flex items-center gap-2 text-[14px] font-semibold">
                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                            {PROVIDER_ERROR.title}
                          </p>
                          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: n }}>
                            {PROVIDER_ERROR.detail}
                          </p>
                          <button
                            type="button"
                            onClick={() => retry(m.id, m.question)}
                            className="kbf mt-3 px-3 py-1.5 text-[13px] font-semibold text-white"
                            style={{ backgroundColor: p, borderRadius: "6px" }}
                          >
                            Retry this question
                          </button>
                        </div>
                      </li>
                    );
                  }

                  const cites = (m.citationIds || []).map((id) => ({ id: id, data: PASSAGES[id] }));
                  return (
                    <li key={m.id} className="kb-rise">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span
                          className="flex h-5 w-5 items-center justify-center text-[10px] font-bold text-white"
                          style={{ backgroundColor: p, borderRadius: "4px" }}
                          aria-hidden="true"
                        >
                          KB
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: n }}>
                          Answer <span className="tabular-nums font-normal">{m.at}</span>
                        </span>
                        {m.status === "refused" ? (
                          <Badge
                            className="text-[10px] font-semibold uppercase tracking-wide"
                            style={{ backgroundColor: faint, color: p, borderRadius: "4px" }}
                          >
                            No answer found
                          </Badge>
                        ) : null}
                      </div>

                      {m.status === "streaming" ? (
                        <p className="mb-2 flex items-center gap-2 text-[12.5px] tabular-nums" style={{ color: n }}>
                          <span
                            className="kb-dot inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: a }}
                            aria-hidden="true"
                          />
                          Retrieved 4 passages from {KB_STATUS.ready} documents · writing answer
                        </p>
                      ) : null}

                      <p
                        aria-live={m.status === "streaming" ? "polite" : undefined}
                        className={"text-[15.5px] leading-[1.75] " + (m.status === "streaming" ? "kb-caret" : "")}
                        style={{ color: m.status === "refused" ? n : p }}
                      >
                        {m.content}
                      </p>

                      {m.status === "refused" ? (
                        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: n }}>
                          Naming the policy, team or year you mean usually helps retrieval find the right passage.
                        </p>
                      ) : null}

                      {cites.length > 0 ? (
                        <div className="mt-3.5">
                          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: n }}>
                            Sources
                          </h3>
                          <ul className="mt-2 flex flex-wrap gap-2">
                            {cites.map((c, idx) => {
                              const isOpen = activeCite === c.id;
                              const gone = !c.data.available;
                              return (
                                <li key={c.id}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveCite(c.id);
                                      setDownloadFor(null);
                                      setPane("source");
                                    }}
                                    aria-pressed={isOpen}
                                    className="kbf flex items-center gap-2 px-2.5 py-1.5 text-left text-[12.5px]"
                                    style={{
                                      border: "1px solid " + (isOpen ? p : line),
                                      backgroundColor: isOpen ? a + "33" : "transparent",
                                      borderRadius: "6px",
                                      color: p
                                    }}
                                  >
                                    <span className="font-bold tabular-nums">{idx + 1}</span>
                                    {gone ? (
                                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                                    ) : (
                                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                                    )}
                                    <span className="font-medium">{c.data.document_name}</span>
                                    <span style={{ color: n }}>{gone ? "no longer available" : c.data.page_ref}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {active ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="px-5 pb-5 pt-4 lg:px-7"
              style={{ borderTop: "1px solid " + line }}
            >
              <div className="mx-auto max-w-2xl">
                <Label htmlFor="question" className="text-[12px] font-semibold" style={{ color: n }}>
                  Your question
                </Label>
                <div
                  className="mt-1.5 flex items-end gap-2 bg-white p-2"
                  style={{ border: "1px solid " + line, borderRadius: rad }}
                >
                  <Textarea
                    id="question"
                    ref={inputRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder="e.g. How much notice do I give before unpaid leave?"
                    className="kbf min-h-[56px] w-full resize-none border-0 text-[15px] leading-relaxed focus:ring-0"
                    style={{ borderRadius: rad, borderColor: "transparent", color: p }}
                  />
                  <Button
                    type="submit"
                    disabled={!canSend}
                    className="kbf shrink-0 px-4 py-2.5 text-[14px] font-semibold"
                    style={{
                      backgroundColor: canSend ? p : n + "33",
                      color: canSend ? "#FFFFFF" : n,
                      borderRadius: rad,
                      cursor: canSend ? "pointer" : "not-allowed"
                    }}
                  >
                    {stream ? "Answering…" : "Ask"}
                    <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-2 text-[12px]" style={{ color: n }}>
                  Enter sends · Shift + Enter adds a line. Follow-ups use this conversation for context.
                </p>
              </div>
            </form>
          ) : null}
        </section>

        {/* ------------------------------ source panel ------------------------------ */}
        <aside
          aria-label="Source passage"
          className={paneCls("source") + " min-w-0 flex-col overflow-hidden bg-white"}
          style={{ borderRadius: rad, border: "1px solid " + line }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid " + line }}>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em]" style={{ color: n }}>
              Source
            </h2>
            <button
              type="button"
              onClick={() => setPane("chat")}
              aria-label="Back to the conversation"
              className="kbf rounded p-1 lg:hidden"
              style={{ color: n }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {stream ? (
              <div>
                <p className="flex items-center gap-2 text-[13px]" style={{ color: n }}>
                  <span className="kb-dot inline-block h-2 w-2 rounded-full" style={{ backgroundColor: a }} aria-hidden="true" />
                  Searching {KB_STATUS.ready} indexed documents…
                </p>
                <div className="mt-4 space-y-3" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="kb-shim h-16" style={{ backgroundColor: faint, borderRadius: rad }} />
                  ))}
                </div>
              </div>
            ) : !cite ? (
              <div className="pt-10 text-center">
                <FileText className="mx-auto h-7 w-7" style={{ color: n }} aria-hidden="true" />
                <h3 className="mt-3 text-[15px] font-semibold">No passage open</h3>
                <p className="mx-auto mt-2 max-w-[28ch] text-[13.5px] leading-relaxed" style={{ color: n }}>
                  Pick a citation in the conversation and the exact page or section lands here, with the quoted lines
                  highlighted. Nothing has to be taken on faith.
                </p>
              </div>
            ) : !cite.available ? (
              <div className="kb-rise">
                <div className="flex items-center gap-2">
                  {fileBadge(cite.file_type)}
                  <span className="text-[12px] tabular-nums" style={{ color: n }}>
                    {cite.page_ref}
                  </span>
                </div>
                <h3 className="mt-2 text-[16px] font-semibold leading-snug">{cite.document_name}</h3>
                <div
                  className="mt-4 px-4 py-4"
                  style={{ border: "1px solid " + line, borderRadius: rad, backgroundColor: faint }}
                >
                  <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    Document no longer available
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: n }}>
                    An admin deleted this document on <span className="tabular-nums">{cite.deleted_on}</span> ({cite.deleted_by}).
                    Its passages were removed from the index, so this citation cannot be opened and the content will not appear
                    in new answers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("documents")}
                  className="kbf mt-4 flex w-full items-center justify-between px-3 py-2.5 text-[13.5px] font-medium"
                  style={{ border: "1px solid " + line, borderRadius: rad, color: p }}
                >
                  Open the document list
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="kb-rise">
                <div className="flex items-center gap-2">
                  {fileBadge(cite.file_type)}
                  <span className="text-[12px] tabular-nums" style={{ color: n }}>
                    {cite.page_ref}
                  </span>
                </div>
                <h3 className="mt-2 text-[16px] font-semibold leading-snug">{cite.document_name}</h3>
                <p className="mt-1 text-[12px] tabular-nums" style={{ color: n }}>
                  {cite.size} · uploaded {cite.uploaded_at} by {cite.uploaded_by}
                </p>

                <Separator className="my-4" style={{ backgroundColor: line }} />

                <div className="space-y-1">
                  {cite.lines.map((ln, i) => (
                    <p
                      key={i}
                      className="border-l-4 py-1.5 pl-3 pr-2 text-[14.5px] leading-7"
                      style={{
                        backgroundColor: ln.hl ? a + "4D" : "transparent",
                        borderLeftColor: ln.hl ? a : "transparent",
                        fontWeight: ln.hl ? 500 : 400,
                        color: ln.hl ? p : n
                      }}
                    >
                      {ln.hl ? <span className="sr-only">Quoted in the answer: </span> : null}
                      {ln.t}
                    </p>
                  ))}
                </div>

                <p className="mt-4 text-[12px] leading-snug" style={{ color: n }}>
                  Highlighted lines are the passage the answer was generated from.
                </p>

                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={() => setDownloadFor(activeCite)}
                    className="kbf flex w-full items-center justify-between px-3 py-2.5 text-[13.5px] font-semibold text-white"
                    style={{ backgroundColor: p, borderRadius: rad }}
                  >
                    Open the original file
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("documents")}
                    className="kbf flex w-full items-center justify-between px-3 py-2.5 text-[13.5px] font-medium"
                    style={{ border: "1px solid " + line, borderRadius: rad, color: p }}
                  >
                    Find it in the document list
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {downloadFor === activeCite ? (
                  <p
                    className="kb-rise mt-3 flex items-start gap-2 px-3 py-2.5 text-[12.5px] leading-snug"
                    style={{ backgroundColor: faint, borderRadius: rad, color: n }}
                    role="status"
                  >
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Fetching {cite.document_name} from secure storage. It opens in a new tab at {cite.page_ref.toLowerCase()}.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
