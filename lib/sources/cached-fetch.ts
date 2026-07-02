/**
 * The ONLY place an external fetch happens outside the (Phase 2) cron route.
 * Every call is tagged and revalidated every 30 minutes, per the
 * snapshot-first rule in CLAUDE.md.
 */
export async function cachedFetch(
  url: string,
  headers?: Record<string, string>,
): Promise<Response> {
  const res = await fetch(url, {
    headers,
    next: { revalidate: 1800, tags: ["sources"] },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
  }
  return res;
}
