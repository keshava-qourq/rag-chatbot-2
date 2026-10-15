/**
 * Client for GET /documents and POST /documents (multipart, per-file
 * result) -- the two endpoints the Documents screen is wired against.
 *
 * Upload goes through XMLHttpRequest rather than `fetch`: fetch exposes no
 * upload-progress event, and the screen's per-file progress bar depends on
 * `xhr.upload.onprogress` (AC-010).
 */
import { apiFetch, API_BASE_URL } from "@/lib/api";

export type DocumentStatus = "processing" | "ready" | "failed";

export type ApiDocument = {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number;
  status: DocumentStatus;
  failure_reason?: string | null;
  uploaded_by: string;
  uploaded_at: string;
  chunks?: number | null;
};

export type UploadOutcome = {
  filename: string;
  accepted: boolean;
  reason?: string;
  document?: ApiDocument;
};

/** What POST /documents accepts and refuses on the client before any request is sent. */
export const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "txt", "md"];
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const SUPPORTED_TYPES_LABEL = "PDF, Word (.docx), plain text or Markdown";
export const MAX_SIZE_LABEL = "50 MB";

export function fileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export type ClientRejection = { filename: string; reason: string };
export type ClientValidation = { accepted: File[]; rejected: ClientRejection[] };

/** AC-012 / AC-013: refuse unsupported types and oversize files before any request is sent. */
export function validateFiles(files: File[]): ClientValidation {
  const accepted: File[] = [];
  const rejected: ClientRejection[] = [];
  for (const file of files) {
    const ext = fileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      rejected.push({
        filename: file.name,
        reason: `.${ext || "unknown"} isn't a supported type. Upload ${SUPPORTED_TYPES_LABEL}.`,
      });
    } else if (file.size > MAX_UPLOAD_BYTES) {
      rejected.push({
        filename: file.name,
        reason: `File is larger than the ${MAX_SIZE_LABEL} limit per file.`,
      });
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
}

export async function fetchDocuments(): Promise<ApiDocument[]> {
  return apiFetch<ApiDocument[]>("/documents");
}

function uploadFile(file: File, onProgress: (fraction: number) => void): Promise<UploadOutcome> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/documents`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onerror = () => reject(new Error("Network error while uploading. Nothing was sent."));
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        const outcomes: UploadOutcome[] = Array.isArray(body)
          ? (body as UploadOutcome[])
          : body
            ? [body as UploadOutcome]
            : [];
        const match = outcomes.find((o) => o.filename === file.name);
        resolve(match ?? { filename: file.name, accepted: true, document: outcomes[0]?.document });
      } else {
        let detail = `Upload failed: ${xhr.status}`;
        const maybeDetail = (body as { detail?: unknown } | null)?.detail;
        if (typeof maybeDetail === "string") detail = maybeDetail;
        resolve({ filename: file.name, accepted: false, reason: detail });
      }
    };
    const form = new FormData();
    form.append("files", file, file.name);
    xhr.send(form);
  });
}

export type UploadTask = {
  id: string;
  filename: string;
  size: number;
  progress: number;
  state: "uploading" | "done" | "error";
  error?: string;
};

type Listener = () => void;

let tasks: UploadTask[] = [];
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

/** Subscribes to upload-task changes. Returns an unsubscribe function. */
export function subscribeUploads(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUploadTasks(): UploadTask[] {
  return tasks;
}

/**
 * Starts one upload per file against POST /documents. Lives at module scope
 * rather than in component state: an XHR started here keeps running, and
 * this list keeps updating, even if the Documents screen that called it
 * unmounts because the admin navigated to Chat or People (AC-010).
 */
export function startUploads(files: File[]): void {
  const started: UploadTask[] = files.map((file) => ({
    id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    filename: file.name,
    size: file.size,
    progress: 0,
    state: "uploading",
  }));
  tasks = [...started, ...tasks];
  notify();

  files.forEach((file, index) => {
    const task = started[index];
    uploadFile(file, (fraction) => {
      tasks = tasks.map((t) => (t.id === task.id ? { ...t, progress: fraction } : t));
      notify();
    })
      .then((outcome) => {
        tasks = tasks.map((t) =>
          t.id === task.id
            ? {
                ...t,
                progress: 1,
                state: outcome.accepted ? "done" : "error",
                error: outcome.reason,
              }
            : t
        );
        notify();
        setTimeout(() => {
          tasks = tasks.filter((t) => t.id !== task.id);
          notify();
        }, 6000);
      })
      .catch((err: Error) => {
        tasks = tasks.map((t) => (t.id === task.id ? { ...t, state: "error", error: err.message } : t));
        notify();
        setTimeout(() => {
          tasks = tasks.filter((t) => t.id !== task.id);
          notify();
        }, 6000);
      });
  });
}
