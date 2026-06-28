type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  name?: string;
};

export function getErrorMessage(error: unknown, fallback = "Unknown error") {
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

export function getSupabaseErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      message: typeof error === "string" ? error : "",
      code: "",
      details: "",
      hint: "",
    };
  }

  const supabaseError = error as SupabaseLikeError;
  return {
    message: supabaseError.message ?? "",
    code: supabaseError.code ?? "",
    details: supabaseError.details ?? "",
    hint: supabaseError.hint ?? "",
  };
}

export function describeError(error: unknown, fallback: string) {
  return getErrorMessage(error, fallback);
}

export function isMissingTableError(error: unknown) {
  const details = getSupabaseErrorDetails(error);
  const combined = [details.message, details.code, details.details, details.hint].join(" ").toLowerCase();
  return combined.includes("pgrst205") || combined.includes("could not find the table") || combined.includes("schema cache");
}

export function missingMigrationMessage(featureName: string, migrationFile: string) {
  return `${featureName} 表还没建立，请先运行 Supabase migration：${migrationFile}`;
}

export function logAppError(label: string, error: unknown) {
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

export const logError = logAppError;
