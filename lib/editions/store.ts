import { head, list, put } from "@vercel/blob";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Edition } from "./types";

/**
 * Edition storage. Primary backend is Vercel Blob (`editions/YYYY-MM-DD.json`)
 * when BLOB_READ_WRITE_TOKEN is present. Without it — local dev, or a deploy
 * reading only the GitHub-mirrored archive — the repo's /data/editions folder
 * serves as the store. Past editions are never rewritten.
 */

const LOCAL_DIR = path.join(process.cwd(), "data", "editions");
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function blobPath(date: string): string {
  return `editions/${date}.json`;
}

export async function getEdition(date: string): Promise<Edition | null> {
  if (!DATE_RE.test(date)) return null;
  if (hasBlob()) {
    try {
      const meta = await head(blobPath(date));
      const res = await fetch(meta.url, { next: { revalidate: 300 } });
      if (!res.ok) return null;
      return (await res.json()) as Edition;
    } catch {
      // fall through to the local mirror
    }
  }
  try {
    const raw = await readFile(path.join(LOCAL_DIR, `${date}.json`), "utf8");
    return JSON.parse(raw) as Edition;
  } catch {
    return null;
  }
}

/** All stored edition dates, ascending. */
export async function listEditionDates(): Promise<string[]> {
  const dates = new Set<string>();
  if (hasBlob()) {
    try {
      let cursor: string | undefined;
      do {
        const page = await list({ prefix: "editions/", cursor, limit: 1000 });
        for (const blob of page.blobs) {
          const m = blob.pathname.match(/editions\/(\d{4}-\d{2}-\d{2})\.json$/);
          if (m) dates.add(m[1]);
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    } catch {
      // fall through to the local mirror
    }
  }
  try {
    for (const f of await readdir(LOCAL_DIR)) {
      const m = f.match(/^(\d{4}-\d{2}-\d{2})\.json$/);
      if (m) dates.add(m[1]);
    }
  } catch {
    // no local archive yet
  }
  return [...dates].sort();
}

export async function getLatestEdition(): Promise<Edition | null> {
  const dates = await listEditionDates();
  const last = dates[dates.length - 1];
  return last ? getEdition(last) : null;
}

/**
 * Writes a new edition. Refuses to overwrite an existing date — editions are
 * immutable by construction, not convention.
 */
export async function putEdition(edition: Edition): Promise<{ stored: "blob" | "local" }> {
  const existing = await getEdition(edition.date);
  if (existing) {
    throw new Error(`edition ${edition.date} already exists (Nº ${existing.number}) — editions are immutable`);
  }
  const body = JSON.stringify(edition);
  if (hasBlob()) {
    await put(blobPath(edition.date), body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    return { stored: "blob" };
  }
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, `${edition.date}.json`), body);
  return { stored: "local" };
}
