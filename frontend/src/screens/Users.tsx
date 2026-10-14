import * as React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { apiFetch, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const { Button, Card, Table, THead, TBody, TR, TH, TD } = UI;

type ApiUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

function rgba(hex: string, a: number): string {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

/** Maps a thrown ApiError (or anything else) to a message safe to show the user. */
function describeError(err: unknown, authMessage: string, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return authMessage;
    return err.message;
  }
  return fallback;
}

export default function Screen() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === "admin";

  const [status, setStatus] = React.useState<"loading" | "error" | "ready">("loading");
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const [rowError, setRowError] = React.useState<{ id: number; message: string } | null>(null);

  const primary = brand.primaryColor;
  const accent = brand.accentColor;
  const neutral = brand.neutralColor;
  const radius = brand.radius;

  const load = React.useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const data = await apiFetch<ApiUser[]>("/users");
      setUsers(data);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(
        describeError(
          err,
          "You don't have permission to view the people list.",
          "Something went wrong loading the people list."
        )
      );
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  async function promote(target: ApiUser, nextRole: "admin" | "employee") {
    setPendingId(target.id);
    setRowError(null);
    try {
      const updated = await apiFetch<ApiUser>(`/users/${target.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: nextRole }),
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setRowError({
        id: target.id,
        message: describeError(
          err,
          "You don't have permission to change roles.",
          "The role change failed. Nothing was updated."
        ),
      });
    } finally {
      setPendingId(null);
    }
  }

  const labelStyle: React.CSSProperties = {
    color: neutral,
    letterSpacing: "0.08em",
    fontSize: "0.6875rem",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  // AC-008: an employee session sees a not-authorised state, and the promote
  // control is never rendered -- this screen does its own check rather than
  // trusting only the route guard in App.tsx.
  if (!isAdmin) {
    return (
      <div
        className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-8"
        style={{ fontFamily: brand.fontBody, color: neutral }}
      >
        <Card
          className="bg-white px-6 py-14 text-center"
          style={{ borderRadius: radius, border: `1px solid ${rgba(neutral, 0.22)}` }}
        >
          <Icons.AlertCircle className="w-7 h-7 mx-auto" style={{ color: primary }} aria-hidden="true" />
          <h1 className="mt-3 text-lg font-semibold" style={{ color: primary, fontFamily: brand.fontHeading }}>
            You're not authorised to view this page
          </h1>
          <p className="mt-2 text-sm mx-auto max-w-[24rem]">
            Managing people and roles is limited to admins. Ask an admin if you need access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-8"
      style={{ fontFamily: brand.fontBody, color: neutral }}
    >
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p style={labelStyle}>Admin · Access &amp; roles</p>
          <h1
            className="mt-2 text-[2rem] leading-tight font-semibold"
            style={{ color: primary, fontFamily: brand.fontHeading, letterSpacing: "-0.015em" }}
          >
            People
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed">
            Everyone who has signed in. Promote an employee to admin so they can upload and manage
            documents.
          </p>
        </div>
        <Button
          onClick={() => void load()}
          disabled={status === "loading"}
          style={{
            backgroundColor: "transparent",
            color: primary,
            border: `1px solid ${rgba(primary, 0.35)}`,
            borderRadius: radius,
            fontWeight: 600,
          }}
        >
          Refresh
        </Button>
      </header>

      <div className="mt-7">
        {status === "loading" && (
          <ul className="p-5 space-y-4" aria-label="Loading the people list" role="status">
            {[0, 1, 2].map((i) => (
              <li key={i} className="animate-pulse flex items-center gap-3">
                <span className="w-9 h-9 rounded-full shrink-0" style={{ backgroundColor: rgba(neutral, 0.16) }} />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-40" style={{ backgroundColor: rgba(neutral, 0.16), borderRadius: 4 }} />
                  <span
                    className="block h-2.5 w-56"
                    style={{ backgroundColor: rgba(neutral, 0.1), borderRadius: 4 }}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}

        {status === "error" && (
          <Card
            className="bg-white px-6 py-10 text-center"
            style={{ borderRadius: radius, border: `1px solid ${rgba(primary, 0.4)}` }}
            role="alert"
          >
            <Icons.AlertCircle className="w-6 h-6 mx-auto" style={{ color: primary }} aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold" style={{ color: primary }}>
              Couldn't load the people list
            </h2>
            <p className="mt-2 text-sm mx-auto max-w-[22rem]">{errorMessage}</p>
            <Button
              onClick={() => void load()}
              className="mt-4"
              style={{ backgroundColor: primary, color: brand.backgroundColor, borderRadius: radius, fontWeight: 600 }}
            >
              Try again
            </Button>
          </Card>
        )}

        {status === "ready" && users.length === 0 && (
          <Card
            className="bg-white px-6 py-14 text-center"
            style={{ borderRadius: radius, border: `1px solid ${rgba(neutral, 0.22)}` }}
          >
            <p className="text-sm">No accounts yet.</p>
          </Card>
        )}

        {status === "ready" && users.length > 0 && (
          <Card
            className="bg-white overflow-hidden"
            style={{ borderRadius: radius, border: `1px solid ${rgba(neutral, 0.22)}` }}
          >
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Role</TH>
                  <TH>First signed in</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {users.map((u) => {
                  const isMe = me?.id === u.id;
                  const nextRole: "admin" | "employee" = u.role === "admin" ? "employee" : "admin";
                  return (
                    <React.Fragment key={u.id}>
                      <TR>
                        <TD>
                          <span className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 shrink-0 rounded-full grid place-items-center text-xs font-semibold"
                              style={{
                                backgroundColor: u.role === "admin" ? primary : rgba(neutral, 0.16),
                                color: u.role === "admin" ? brand.backgroundColor : primary,
                              }}
                              aria-hidden="true"
                            >
                              {initials(u.name)}
                            </span>
                            <span style={{ color: primary, fontWeight: 600 }}>{u.name}</span>
                            {isMe && (
                              <span className="text-xs" style={{ color: neutral }}>
                                (you)
                              </span>
                            )}
                          </span>
                        </TD>
                        <TD>{u.email}</TD>
                        <TD>
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
                            style={{
                              borderRadius: "999px",
                              backgroundColor: u.role === "admin" ? rgba(accent, 0.3) : rgba(neutral, 0.12),
                              color: u.role === "admin" ? primary : neutral,
                              border: `1px solid ${u.role === "admin" ? rgba(accent, 0.75) : rgba(neutral, 0.25)}`,
                            }}
                          >
                            {u.role === "admin" ? "Admin" : "Employee"}
                          </span>
                        </TD>
                        <TD>{fmtDate(u.created_at)}</TD>
                        <TD>
                          {isMe ? (
                            <span className="text-xs" style={{ color: neutral }}>
                              Can't change your own role
                            </span>
                          ) : pendingId === u.id ? (
                            <span className="text-xs" style={{ color: primary }}>
                              Updating…
                            </span>
                          ) : (
                            <Button
                              onClick={() => void promote(u, nextRole)}
                              style={{
                                backgroundColor: nextRole === "admin" ? primary : "transparent",
                                color: nextRole === "admin" ? brand.backgroundColor : primary,
                                border: `1px solid ${rgba(primary, 0.4)}`,
                                borderRadius: radius,
                                fontWeight: 600,
                              }}
                            >
                              {nextRole === "admin"
                                ? `Make ${u.name.split(" ")[0]} admin`
                                : "Remove admin rights"}
                            </Button>
                          )}
                        </TD>
                      </TR>
                      {rowError && rowError.id === u.id && (
                        <TR>
                          <TD colSpan={5}>
                            <div role="alert" className="text-xs" style={{ color: primary }}>
                              {rowError.message}
                            </div>
                          </TD>
                        </TR>
                      )}
                    </React.Fragment>
                  );
                })}
              </TBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
