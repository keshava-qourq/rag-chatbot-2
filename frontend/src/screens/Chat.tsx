// @ts-nocheck -- follows the same generated-screen convention as the sibling screens in this folder.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import ReactMarkdown from "react-markdown";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { createConversation, fetchConversation, streamAnswer } from "@/lib/conversations";

const { Button, Textarea, Avatar } = UI;
const { AlertCircle, ArrowRight } = Icons;

/** sessionStorage key for the conversation this tab is currently on (AC: load via GET when one is active). */
const ACTIVE_CONVERSATION_KEY = "chat.activeConversationId";

function hexToRgba(hex, alpha) {
  const h = String(hex).replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Maps a thrown ApiError (or anything else) to a message safe to show the user. */
function describeError(err, authMessage, fallback) {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return authMessage;
    return err.message;
  }
  return fallback;
}

let uid = 0;
function nextId(prefix) {
  uid += 1;
  return `${prefix}-${Date.now()}-${uid}`;
}

export default function Screen() {
  const { user } = useAuth();
  const P = brand.primaryColor;
  const A = brand.accentColor;
  const N = brand.neutralColor;
  const R = brand.radius;

  // "loading" while an existing conversation is being fetched, "ready" once the
  // screen is usable (whether or not any history came back), "error" if a
  // conversation was active but couldn't be loaded.
  const [loadStatus, setLoadStatus] = React.useState("ready");
  const [loadError, setLoadError] = React.useState("");
  const [conversationId, setConversationId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");

  const logRef = React.useRef(null);

  React.useEffect(() => {
    let activeId = null;
    try {
      activeId = window.sessionStorage.getItem(ACTIVE_CONVERSATION_KEY);
    } catch {
      activeId = null;
    }
    if (!activeId) return;

    let cancelled = false;
    setLoadStatus("loading");
    fetchConversation(activeId)
      .then((conversation) => {
        if (cancelled) return;
        setConversationId(conversation.id);
        setMessages(
          conversation.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            status: "done",
          }))
        );
        setLoadStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        try {
          window.sessionStorage.removeItem(ACTIVE_CONVERSATION_KEY);
        } catch {
          // Nothing to clean up if storage isn't available.
        }
        if (err instanceof ApiError && err.status === 404) {
          // The conversation is gone -- start fresh rather than showing an error.
          setConversationId(null);
          setMessages([]);
          setLoadStatus("ready");
          return;
        }
        setLoadError(
          describeError(
            err,
            "You don't have permission to view this conversation.",
            "Something went wrong loading your last conversation."
          )
        );
        setLoadStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const sending = messages.some((m) => m.status === "pending" || m.status === "streaming");

  async function ensureConversation() {
    if (conversationId) return conversationId;
    const conversation = await createConversation();
    setConversationId(conversation.id);
    try {
      window.sessionStorage.setItem(ACTIVE_CONVERSATION_KEY, conversation.id);
    } catch {
      // A missing sessionStorage just means history won't survive a reload.
    }
    return conversation.id;
  }

  function runAnswer(convoId, question, assistantMessageId) {
    setMessages((prev) =>
      prev.map((m) => (m.id === assistantMessageId ? { ...m, status: "streaming", content: "", error: undefined } : m))
    );
    void streamAnswer(convoId, question, {
      onToken: (full) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessageId ? { ...m, content: full, status: "streaming" } : m))
        );
      },
      onDone: (full) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: full, status: "done" } : m
          )
        );
      },
      onError: (message) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, status: "error", error: message } : m
          )
        );
      },
    });
  }

  async function sendQuestion(question) {
    const trimmed = question.trim();
    // AC-027: whitespace-only or empty never gets sent.
    if (!trimmed) return;

    const userMessageId = nextId("user");
    const assistantMessageId = nextId("assistant");
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, role: "user", content: trimmed, status: "done" },
      { id: assistantMessageId, role: "assistant", content: "", status: "pending", question: trimmed },
    ]);

    try {
      const convoId = await ensureConversation();
      runAnswer(convoId, trimmed, assistantMessageId);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                status: "error",
                error: describeError(
                  err,
                  "You don't have permission to start a conversation.",
                  "Couldn't start a conversation. Check your connection and try again."
                ),
              }
            : m
        )
      );
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const question = input;
    setInput("");
    void sendQuestion(question);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) handleSubmit(e);
    }
  }

  async function retry(assistantMessageId, question) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantMessageId ? { ...m, status: "pending", content: "", error: undefined } : m
      )
    );
    try {
      const convoId = await ensureConversation();
      runAnswer(convoId, question, assistantMessageId);
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                status: "error",
                error: describeError(
                  err,
                  "You don't have permission to start a conversation.",
                  "Couldn't start a conversation. Check your connection and try again."
                ),
              }
            : m
        )
      );
    }
  }

  const trimmedInput = input.trim();
  const canSubmit = trimmedInput.length > 0 && !sending;

  const markdownComponents = {
    p: (props) => <p className="leading-relaxed" {...props} />,
    ul: (props) => <ul className="mt-1.5 space-y-1 list-disc list-outside pl-5" {...props} />,
    ol: (props) => <ol className="mt-1.5 space-y-1 list-decimal list-outside pl-5" {...props} />,
    li: (props) => <li {...props} />,
    strong: (props) => <strong style={{ color: P }} {...props} />,
    code: (props) => (
      <code
        className="rounded px-1 py-0.5 text-[0.85em]"
        style={{ backgroundColor: hexToRgba(N, 0.12) }}
        {...props}
      />
    ),
  };

  function Bubble({ message }) {
    const isUser = message.role === "user";
    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className="max-w-[80ch] px-4 py-3 text-sm"
          style={{
            borderRadius: R,
            backgroundColor: isUser ? P : "#FFFFFF",
            color: isUser ? "#FFFFFF" : N,
            border: isUser ? "none" : `1px solid ${hexToRgba(N, 0.18)}`,
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : message.status === "error" ? (
            <div role="alert">
              <p className="flex items-center gap-2 font-semibold" style={{ color: P }}>
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                Couldn't get an answer
              </p>
              <p className="mt-1.5">{message.error}</p>
              <button
                type="button"
                onClick={() => void retry(message.id, message.question)}
                className="mt-3 px-3 py-1.5 text-xs font-semibold"
                style={{ borderRadius: R, color: P, border: `1px solid ${hexToRgba(P, 0.35)}` }}
              >
                Retry
              </button>
            </div>
          ) : message.status === "pending" ? (
            <p className="flex items-center gap-2" role="status" aria-live="polite">
              <span className="chat-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              Thinking…
            </p>
          ) : (
            <>
              <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
              {message.status === "streaming" && (
                <span className="sr-only" role="status" aria-live="polite">
                  Answer is still streaming in.
                </span>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[70vh] flex-col" style={{ fontFamily: brand.fontBody, color: N }}>
      <style>{`
        @keyframes chatDot { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
        .chat-dots { display: inline-flex; gap: 3px; }
        .chat-dots span { width: 5px; height: 5px; border-radius: 999px; background-color: ${P}; animation: chatDot 1.1s infinite; display: inline-block; }
        .chat-dots span:nth-child(2) { animation-delay: .15s; }
        .chat-dots span:nth-child(3) { animation-delay: .3s; }
        .chat-focus:focus-visible { outline: 2px solid ${P}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .chat-dots span { animation: none; }
        }
      `}</style>

      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{ color: hexToRgba(N, 0.85) }}
          >
            Ask the knowledge base
          </p>
          <h1
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: brand.fontHeading, color: P }}
          >
            Chat
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold" style={{ color: P }}>
              {user?.name}
            </p>
          </div>
          <Avatar name={user?.name || ""} />
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col bg-white"
        style={{ borderRadius: R, border: `1px solid ${hexToRgba(N, 0.18)}` }}
      >
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          {loadStatus === "loading" ? (
            <p className="text-sm" role="status">
              Loading your conversation…
            </p>
          ) : loadStatus === "error" ? (
            <div className="px-2 py-6 text-center" role="alert">
              <AlertCircle className="mx-auto h-6 w-6" style={{ color: P }} aria-hidden="true" />
              <p className="mt-3 text-sm">{loadError}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <h2 className="text-lg font-semibold" style={{ fontFamily: brand.fontHeading, color: P }}>
                Ask anything the knowledge base covers
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm">
                Questions are answered only from documents that have been uploaded and indexed.
              </p>
            </div>
          ) : (
            messages.map((message) => <Bubble key={message.id} message={message} />)
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4" style={{ borderColor: hexToRgba(N, 0.14) }}>
          <div className="flex items-end gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your company's documents…"
              aria-label="Your question"
              className="chat-focus min-h-[52px] flex-1"
              disabled={loadStatus === "loading"}
            />
            <Button type="submit" disabled={!canSubmit} aria-label="Send question">
              Send
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-2 text-xs">Press Enter to send, Shift+Enter for a new line.</p>
        </form>
      </div>
    </div>
  );
}
