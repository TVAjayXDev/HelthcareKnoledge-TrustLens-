import crypto from "crypto";
import { ExtractedMetadata } from "../contract";

export interface StagedDocument {
  token: string;
  buffer: Buffer;
  filename: string;
  checksum: string;
  pages: { page: number; text: string }[];
  extracted: ExtractedMetadata;
  createdAt: number;
}

// In-memory preview cache with TTL (persisted across Next.js dev route bundles on globalThis)
const globalForPreview = globalThis as unknown as {
  __trustlensPreviewCache?: Map<string, StagedDocument>;
};

const previewCache =
  globalForPreview.__trustlensPreviewCache ?? new Map<string, StagedDocument>();

if (process.env.NODE_ENV !== "production") {
  globalForPreview.__trustlensPreviewCache = previewCache;
}

const PREVIEW_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function stageDocumentPreview(
  buffer: Buffer,
  filename: string,
  checksum: string,
  pages: { page: number; text: string }[],
  extracted: ExtractedMetadata
): string {
  const token = `prev_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  previewCache.set(token, {
    token,
    buffer,
    filename,
    checksum,
    pages,
    extracted,
    createdAt: Date.now(),
  });

  // Evict old entries
  const now = Date.now();
  for (const [k, v] of previewCache.entries()) {
    if (now - v.createdAt > PREVIEW_TTL_MS) {
      previewCache.delete(k);
    }
  }

  return token;
}

export function getStagedDocument(token: string): StagedDocument | null {
  const item = previewCache.get(token);
  if (!item) return null;
  if (Date.now() - item.createdAt > PREVIEW_TTL_MS) {
    previewCache.delete(token);
    return null;
  }
  return item;
}

export function removeStagedDocument(token: string): void {
  previewCache.delete(token);
}
