export function getErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const anyError = error as {
      message?: unknown;
      error_description?: unknown;
      details?: unknown;
      hint?: unknown;
    };
    const message =
      anyError.message ||
      anyError.error_description ||
      anyError.details ||
      anyError.hint;

    if (typeof message === "string" && message.trim()) return message;

    try {
      const json = JSON.stringify(error);
      return json && json !== "{}" ? json : "Unknown error (empty error object)";
    } catch {
      return "Unknown error (unserializable error object)";
    }
  }
  return String(error);
}
