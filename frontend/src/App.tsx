import { NavLink, Navigate, Route, Routes } from "react-router-dom";

import SignIn from "@/screens/SignIn";
import Chat from "@/screens/Chat";
import Documents from "@/screens/Documents";
import Users from "@/screens/Users";
import { AuthProvider, useAuth } from "@/lib/auth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-[var(--brand-radius)] px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-[var(--brand-hover)] text-[var(--brand-fg)]" : "text-[var(--brand-fg-muted)]",
  ].join(" ");

function AppShell() {
  const { status, user, signOut } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <p className="text-sm text-[var(--brand-fg-muted)]">Loading…</p>
      </div>
    );
  }

  // AC-001 / AC-005: unauthenticated on any route (and a session that turned
  // out not to exist) sees only the sign-in screen -- no sidebar, no admin
  // routes, no knowledge-base content.
  if (status === "unauthenticated" || !user) {
    return <SignIn />;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen">
      <aside
        className="flex w-56 shrink-0 flex-col justify-between border-r p-4"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div>
          <p
            className="mb-4 px-3 text-sm font-semibold"
            style={{ fontFamily: "var(--brand-font-heading)" }}
          >
            {"RAG chatbot (2)"}
          </p>
          <nav className="flex flex-col gap-1">
            <NavLink to="/chat" className={navLinkClass}>
              {"Chat"}
            </NavLink>
            {isAdmin && (
              <NavLink to="/documents" className={navLinkClass}>
                {"Documents"}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/users" className={navLinkClass}>
                {"People"}
              </NavLink>
            )}
          </nav>
        </div>
        <div className="border-t pt-3" style={{ borderColor: "var(--brand-border)" }}>
          <p className="truncate px-3 text-xs text-[var(--brand-fg-muted)]">{user.name}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-1 block w-full rounded-[var(--brand-radius)] px-3 py-2 text-left text-sm font-medium text-[var(--brand-fg-muted)] transition-colors hover:bg-[var(--brand-hover)]"
          >
            {"Sign out"}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/documents"
            element={isAdmin ? <Documents /> : <Navigate to="/chat" replace />}
          />
          <Route path="/users" element={isAdmin ? <Users /> : <Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
