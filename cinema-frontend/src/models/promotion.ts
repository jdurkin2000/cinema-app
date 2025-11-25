/**
 * Promotion model - matches backend Promotion.
 *
 * Dates are stored as Instant (UTC) in backend and sent as ISO-8601 strings.
 * Convert to Date objects on frontend for manipulation/display.
 */
export default interface Promotion {
  id: string;
  code: string;
  startDate: string; // ISO-8601 string from backend
  endDate: string; // ISO-8601 string from backend
  discountPercent: number;
}
