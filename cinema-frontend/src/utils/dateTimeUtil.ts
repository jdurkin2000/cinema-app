/**
 * Date/Time utility functions for the cinema frontend.
 *
 * This module provides consistent date/time handling that matches the backend's
 * DateTimeUtil class. All dates from the backend are in UTC (as ISO-8601 strings)
 * and should be converted to local time for display.
 *
 * Key principles:
 * - Backend stores everything as Instant (UTC)
 * - Frontend receives ISO-8601 strings from API
 * - Convert to Date objects for manipulation
 * - Format for display in user's timezone
 * - Send back to backend as ISO-8601 strings
 */

/**
 * Format a Date object for display as date only (e.g., "1/15/2024")
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/**
 * Format a Date object for display as date and time (e.g., "1/15/2024, 2:30 PM")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a Date object as ISO date string for backend (yyyy-MM-dd)
 */
export function toISODate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Format a Date object as full ISO string for backend
 */
export function toISOString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Parse an ISO date string (yyyy-MM-dd) to Date object
 */
export function parseISODate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00.000Z");
}

/**
 * Parse an ISO datetime string to Date object
 */
export function parseISODateTime(dateTimeStr: string): Date {
  return new Date(dateTimeStr);
}

/**
 * Check if a date is in the past
 */
export function isInPast(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isInFuture(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Check if a date is today (ignoring time)
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Get the start of today (midnight local time)
 */
export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get the end of today (23:59:59.999 local time)
 */
export function endOfToday(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = new Date(typeof date === "string" ? new Date(date) : date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date | string, hours: number): Date {
  const d = new Date(typeof date === "string" ? new Date(date) : date);
  d.setHours(d.getHours() + hours);
  return d;
}

/**
 * Format a date for HTML datetime-local input
 */
export function toDateTimeLocalString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format a date for HTML date input (yyyy-MM-dd)
 */
export function toDateInputString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse datetime-local input value to Date
 */
export function fromDateTimeLocalString(value: string): Date {
  return new Date(value);
}

/**
 * Parse date input value to Date (at start of day)
 */
export function fromDateInputString(value: string): Date {
  return new Date(value + "T00:00:00");
}

/**
 * Reviver function for JSON.parse to automatically convert ISO date strings to Date objects
 */
export function dateReviver(key: string, value: unknown): unknown {
  if (typeof value === "string") {
    // ISO 8601 date/time pattern
    const isoPattern =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
    if (isoPattern.test(value)) {
      return new Date(value);
    }
  }
  return value;
}

/**
 * Convert any date-like value to Date object safely
 */
export function ensureDate(
  value: Date | string | number | null | undefined
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Compare two dates (ignoring time component)
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareDates(a: Date | string, b: Date | string): number {
  const dateA = toISODate(typeof a === "string" ? new Date(a) : a);
  const dateB = toISODate(typeof b === "string" ? new Date(b) : b);
  if (dateA < dateB) return -1;
  if (dateA > dateB) return 1;
  return 0;
}

/**
 * Check if two dates represent the same day (ignoring time)
 */
export function isSameDay(a: Date | string, b: Date | string): boolean {
  return compareDates(a, b) === 0;
}

/**
 * Get a human-readable relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTimeString(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSec = Math.abs(Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const isPast = diffMs < 0;
  const suffix = isPast ? "ago" : "from now";

  if (diffSec < 60) return isPast ? "just now" : "in a moment";
  if (diffMin < 60)
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ${suffix}`;
  if (diffHour < 24)
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ${suffix}`;
  if (diffDay < 30)
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ${suffix}`;

  return formatDate(d);
}
