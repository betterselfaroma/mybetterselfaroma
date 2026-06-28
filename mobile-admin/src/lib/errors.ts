type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  name?: string;
};

export function describeError(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (error instanceof Error) return `${fallback}: ${error.message}`;

  if (typeof error === "object") {
    const supabaseError = error as SupabaseLikeError;
    const parts = [
      supabaseError.message,
      supabaseError.code ? `code: ${supabaseError.code}` : "",
      supabaseError.details ? `details: ${supabaseError.details}` : "",
      supabaseError.hint ? `hint: ${supabaseError.hint}` : "",
    ].filter(Boolean);
    if (parts.length > 0) return `${fallback}: ${parts.join(" | ")}`;
  }

  return `${fallback}: ${String(error)}`;
}

export function logError(label: string, error: unknown) {
  if (error && typeof error === "object") {
    const supabaseError = error as SupabaseLikeError;
    console.error(label, {
      message: supabaseError.message,
      code: supabaseError.code,
      details: supabaseError.details,
      hint: supabaseError.hint,
      name: supabaseError.name,
      raw: error,
    });
    return;
  }

  console.error(label, error);
}
