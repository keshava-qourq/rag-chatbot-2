import * as React from "react";
import { useSearchParams } from "react-router-dom";

import { brand } from "@/lib/brand";
import { startGoogleSignIn } from "@/lib/auth";

/** Matches `auth_module.ACCESS_LIMITED_DETAIL` on the backend, verbatim (AC-004). */
const ACCESS_LIMITED_MESSAGE = "access is limited to company accounts";

export default function SignIn() {
  const [params] = useSearchParams();
  const errorParam = params.get("error");
  const deniedMessage = errorParam ? ACCESS_LIMITED_MESSAGE : null;

  const smallLabel: React.CSSProperties = {
    fontSize: "0.6875rem",
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{ backgroundColor: brand.backgroundColor, fontFamily: brand.fontBody, color: "#1B2430" }}
    >
      <div
        className="w-full max-w-[25rem] p-8"
        style={{
          borderRadius: brand.radius,
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(94,107,125,0.18)",
          boxShadow: "0 1px 2px rgba(43,76,126,0.06), 0 12px 28px -22px rgba(43,76,126,0.45)",
        }}
      >
        <p style={{ ...smallLabel, color: brand.neutralColor }}>Company knowledge base</p>
        <h1
          className="mt-3 text-[1.75rem] leading-[1.15] font-semibold tracking-tight"
          style={{ fontFamily: brand.fontHeading, color: brand.primaryColor }}
        >
          Sign in to Corpus
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed" style={{ color: brand.neutralColor }}>
          There is no password and no sign-up. Access is limited to your company's Google Workspace
          account.
        </p>

        {deniedMessage && (
          <div
            role="alert"
            className="mt-5 px-4 py-3 text-[0.8125rem] leading-relaxed"
            style={{
              borderRadius: brand.radius,
              border: "1px solid rgba(220,38,38,0.4)",
              backgroundColor: "rgba(220,38,38,0.08)",
              color: "#7f1d1d",
            }}
          >
            {deniedMessage}
          </div>
        )}

        <button
          type="button"
          onClick={startGoogleSignIn}
          className="mt-6 flex w-full items-center justify-center gap-3 px-4 py-3.5 text-[0.9375rem] font-semibold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
