/**
 * Client for the chat contract this screen is wired against:
 *
 *   POST /conversations                      -- start a new conversation
 *   GET  /conversations/{id}                 -- load an existing one (history)
 *   POST /conversations/{id}/messages        -- ask a question, answer streams back
 *
 * The last one streams over Server-Sent Events, but it is a POST (the
 * question is in the body), so the browser's `EventSource` -- which only
 * does GET -- cannot be used. This reads the response body as a stream
 * instead and parses SSE frames by hand.
 */
import { apiFetch, API_BASE_URL, ApiError } from "@/lib/api";

export type Role = "user" | "assistant";

export type ApiMessage = {
  id: string;
  role: Role;
  content: string;
  created_at: string;
};

export type ApiConversation = {
  id: string;
  title?: string | null;
  created_at?: string;
  messages: ApiMessage[];
};

export async function createConversation(): Promise<ApiConversation> {
  return apiFetch<ApiConversation>("/conversations", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function fetchConversation(id: string): Promise<ApiConversation> {
  return apiFetch<ApiConversation>(`/conversations/${encodeURIComponent(id)}`);
}

export type StreamHandlers = {
  /** Called every time more of the answer has arrived; `full` is the text so far. */
  onToken: (full: string) => void;
  /** Called once the stream ends normally; `full` is the complete answer. */
  onDone: (full: string) => void;
  /** Called on a provider error, a malformed stream, or a timeout. Terminal. */
  onError: (message: string) => void;
};

/** How long to wait for the stream to produce anything before giving up (AC-028). */
const STREAM_TIMEOUT_MS = 45_000;

const GENERIC_STREAM_ERROR =
  "The assistant couldn't answer that just now. Try again.";

/**
 * POSTs the question and feeds every token back through `handlers` as it
 * streams in. Resolves once the stream has ended, however it ended --
 * callers rely on `onError`/`onDone` rather than a rejected promise.
 */
export async function streamAnswer(
  conversationId: string,
  content: string,
  handlers: StreamHandlers
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
  let accumulated = "";
  let settled = false;

  const fail = (message: string) => {
    if (settled) return;
    settled = true;
    handlers.onError(message);
  };
  const finish = () => {
    if (settled) return;
    settled = true;
    handlers.onDone(accumulated);
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      }
    );

    if (!response.ok || !response.body) {
      let detail = `${GENERIC_STREAM_ERROR} (${response.status})`;
      try {
        const body = await response.json();
        if (body && typeof body.detail === "string") detail = body.detail;
      } catch {
        // No JSON body on this error response -- keep the generic detail.
      }
      fail(detail);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separatorIndex;
      while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
        const rawFrame = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex + 2);
        const frame = parseSseFrame(rawFrame);
        if (!frame) continue;

        if (frame.event === "error") {
          fail(frame.data || GENERIC_STREAM_ERROR);
          return;
        }
        if (frame.event === "done") {
          finish();
          return;
        }
        const delta = extractTokenText(frame.data);
        if (delta) {
          accumulated += delta;
          handlers.onToken(accumulated);
        }
      }
    }
    finish();
  } catch (err) {
    if (controller.signal.aborted) {
      fail("The assistant timed out answering. Try again.");
    } else if (err instanceof ApiError) {
      fail(err.message);
    } else {
      fail(err instanceof Error ? err.message : GENERIC_STREAM_ERROR);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

type SseFrame = { event: string; data: string };

function parseSseFrame(raw: string): SseFrame | null {
  const lines = raw.split("\n");
  let event = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0 && event === "message") return null;
  return { event, data: dataLines.join("\n") };
}

/** A token frame's `data` may be plain text, `"[DONE]"`, or a small JSON envelope. */
function extractTokenText(data: string): string {
  if (!data || data === "[DONE]") return "";
  try {
    const parsed = JSON.parse(data);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed.content === "string") return parsed.content;
    if (parsed && typeof parsed.token === "string") return parsed.token;
    if (parsed && typeof parsed.delta === "string") return parsed.delta;
    return "";
  } catch {
    return data;
  }
}
