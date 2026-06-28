export function todayInMalaysia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function malaysiaDayRange(dateText = todayInMalaysia()) {
  const dayStart = new Date(`${dateText}T00:00:00+08:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  return { dayStart, dayEnd };
}

export function formatDateTime(date?: string | null, time?: string | null) {
  return [date, time].filter(Boolean).join(" · ") || "未填写时间";
}
