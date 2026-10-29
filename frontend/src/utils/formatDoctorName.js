/** Prefix "Dr. " only when the name doesn't already include it. */
export function formatDoctorName(name = "") {
  const n = String(name || "").trim()
  if (!n) return "Doctor"
  if (/^dr\.?\s/i.test(n)) return n
  return `Dr. ${n}`
}
