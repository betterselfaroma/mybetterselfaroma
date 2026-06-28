"use client";

import { useEffect } from "react";

type AdminError = Error & {
  digest?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function errorDetails(error: AdminError) {
  const parts = [
    error.message ? error.message : "",
    error.digest ? `digest: ${error.digest}` : "",
    error.code ? `code: ${error.code}` : "",
    error.details ? `details: ${error.details}` : "",
    error.hint ? `hint: ${error.hint}` : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Unknown admin dashboard error";
}

export default function Error({ error, reset }: { error: AdminError; reset: () => void }) {
  const details = errorDetails(error);

  useEffect(() => {
    console.error("Admin dashboard route failed:", {
      message: error.message,
      digest: error.digest,
      code: error.code,
      details: error.details,
      hint: error.hint,
      raw: error,
    });
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center">
      <div className="max-w-xl rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-left text-sm leading-relaxed text-red-700">
        <p className="font-semibold text-red-800">Dashboard failed:</p>
        <p className="mt-2 break-words font-mono text-xs">{details}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-sage-800"
        >
          重试 · Try again
        </button>
        <a
          href="https://wa.me/60124761919"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-sage-300 bg-cream-50 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:border-sage-500"
        >
          WhatsApp 联系我们
        </a>
      </div>
    </div>
  );
}
