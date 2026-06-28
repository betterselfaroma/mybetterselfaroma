type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  name?: string;
  error_description?: string;
};

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
    message: supabaseError.message ?? supabaseError.error_description ?? "",
    code: supabaseError.code ?? "",
    details: supabaseError.details ?? "",
    hint: supabaseError.hint ?? "",
  };
}

export function getErrorMessage(error: unknown, fallback = "Unknown error") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  const details = getSupabaseErrorDetails(error);
  const parts = [
    details.message || fallback,
    details.code ? `code: ${details.code}` : "",
    details.details ? `details: ${details.details}` : "",
    details.hint ? `hint: ${details.hint}` : "",
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(" | ");

  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

export function logAppError(scope: string, error: unknown) {
  if (error && typeof error === "object") {
    const details = getSupabaseErrorDetails(error);
    console.error(scope, {
      message: details.message,
      code: details.code,
      details: details.details,
      hint: details.hint,
      raw: error,
    });
    return;
  }

  console.error(scope, error);
}

export function isMissingTableError(error: unknown) {
  const details = getSupabaseErrorDetails(error);
  const combined = [details.message, details.code, details.details, details.hint].join(" ").toLowerCase();
  return combined.includes("pgrst205") || combined.includes("could not find the table") || combined.includes("schema cache");
}

export function missingMigrationMessage(featureName: string, migrationFile: string) {
  return `${featureName}表还没建立，请先运行 Supabase migration：${migrationFile}`;
}
