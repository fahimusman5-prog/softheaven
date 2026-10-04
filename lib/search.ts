/** Search is local catalogue filtering, never SQL or HTML. Bound URL and input work alike. */
export const MAX_SEARCH_LENGTH = 120;
export function normalizeSearch(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] ?? '' : value ?? '').slice(0, MAX_SEARCH_LENGTH);
}
