import crypto from "crypto";
import { extractText } from "unpdf";
import { DocumentRecord, ExtractedMetadata, Freshness, TierNumber } from "../contract";
import { generate, embed } from "./llm";
import { getAdminSupabase } from "../db/supabase-server";

export interface ChunkRecord {
  documentId: string;
  chunkIndex: number;
  section: string;
  page: number;
  content: string;
  embedding?: number[];
}

/**
 * Compute SHA-256 hash of a file buffer.
 */
export function computeChecksum(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Standardize dates into ISO strings.
 */
export function parseDateToISO(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  // Clean "(OVERDUE)" or other annotations
  const cleaned = dateStr.replace(/\(.*?\)/g, "").trim();
  const timestamp = Date.parse(cleaned);
  if (isNaN(timestamp)) return null;
  return new Date(timestamp).toISOString();
}

/**
 * Dynamically recompute freshness and daysOverdue from nextReview date and status.
 * Per specification: Always recomputed at read/ingest time so numbers never go stale.
 */
export function computeFreshness(
  nextReview: string | null,
  statusRaw: string = ""
): { freshness: Freshness; daysOverdue: number } {
  const upperStatus = (statusRaw || "").toUpperCase();

  // 1. Any status that starts with DRAFT or is explicitly marked as draft revision
  if (upperStatus.startsWith("DRAFT") || upperStatus.includes("DRAFT -") || upperStatus.includes("STATUS: DRAFT")) {
    return { freshness: "draft", daysOverdue: 0 };
  }

  // 2. Compute against current date
  if (nextReview) {
    const reviewDate = new Date(nextReview);
    if (!isNaN(reviewDate.getTime())) {
      const now = new Date();
      const diffMs = now.getTime() - reviewDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (days > 0) {
        return { freshness: "review_overdue", daysOverdue: days };
      }
      return { freshness: "current", daysOverdue: 0 };
    }
  }

  // 3. Fallback to explicit status indicators
  if (upperStatus.includes("OVERDUE")) {
    return { freshness: "review_overdue", daysOverdue: 30 };
  }

  return { freshness: "current", daysOverdue: 0 };
}

/**
 * Regex-first metadata extraction with LLM fallback.
 */
export async function extractDocumentMetadata(
  firstPageText: string,
  filename: string
): Promise<ExtractedMetadata> {
  const idMatch = firstPageText.match(/Document ID:\s*([^\r\n]+)/i);
  const versionMatch = firstPageText.match(/Version:\s*([^\r\n]+)/i);
  const tierMatch = firstPageText.match(/Authority Tier:\s*Tier\s*([1-5])/i);
  const docTypeMatch = firstPageText.match(/Document Type:\s*([^\r\n]+)/i);
  const ownerMatch = firstPageText.match(/Owner:\s*([^\r\n]+)/i);
  const approverMatch = firstPageText.match(/Approver:\s*([^\r\n]+)/i);
  const deptMatch = firstPageText.match(/Department:\s*([^\r\n]+)/i);
  const payerMatch = firstPageText.match(/Payer(?:\/Program)?:\s*([^\r\n]+)/i);
  const effDateMatch = firstPageText.match(/Effective Date:\s*([^\r\n]+)/i);
  const lastRevMatch = firstPageText.match(/Last Reviewed:\s*([^\r\n]+)/i);
  const nextRevMatch = firstPageText.match(/Next Review:\s*([^\r\n]+)/i);
  const draftRevisionMatch = firstPageText.match(/\(([A-Z0-9_-]+-RevB)\)/i);

  // Derive title from top lines or filename
  let title = "";
  const lines = firstPageText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const northfieldIdx = lines.findIndex((l) => l.toUpperCase().includes("NORTHFIELD HEALTH"));
  if (northfieldIdx >= 0 && lines[northfieldIdx + 1] && !lines[northfieldIdx + 1].startsWith("Document ID")) {
    const candidateLines: string[] = [];
    for (let i = northfieldIdx + 1; i < Math.min(lines.length, northfieldIdx + 4); i++) {
      if (lines[i].startsWith("Document ID")) break;
      candidateLines.push(lines[i]);
    }
    title = candidateLines.join(" ");
  }
  if (!title) {
    title = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  }

  const tierNum = tierMatch ? (parseInt(tierMatch[1], 10) as TierNumber) : 4;
  const docId = idMatch ? idMatch[1].trim() : filename.replace(/\.[^/.]+$/, "");

  const fields: ExtractedMetadata["fields"] = {
    id: docId,
    title,
    version: versionMatch ? versionMatch[1].trim() : "v1.0",
    tier: tierNum,
    docType: docTypeMatch ? docTypeMatch[1].trim() : "Institutional SOP",
    owner: ownerMatch ? ownerMatch[1].trim() : "Clinical Governance",
    approver: approverMatch ? approverMatch[1].trim() : "Medical Executive Committee",
    department: deptMatch ? deptMatch[1].trim() : "General Hospital Operations",
    payer: payerMatch ? payerMatch[1].trim() : undefined,
    effectiveDate: parseDateToISO(effDateMatch ? effDateMatch[1] : null),
    lastReviewed: parseDateToISO(lastRevMatch ? lastRevMatch[1] : null),
    nextReview: parseDateToISO(nextRevMatch ? nextRevMatch[1] : null),
    newerVersionId: draftRevisionMatch ? draftRevisionMatch[1] : undefined,
  };

  const fieldConfidence: Record<string, number> = {
    id: idMatch ? 0.99 : 0.6,
    version: versionMatch ? 0.95 : 0.5,
    tier: tierMatch ? 0.98 : 0.6,
    docType: docTypeMatch ? 0.95 : 0.6,
    owner: ownerMatch ? 0.94 : 0.5,
    approver: approverMatch ? 0.94 : 0.5,
    department: deptMatch ? 0.95 : 0.5,
    effectiveDate: effDateMatch ? 0.92 : 0.4,
    lastReviewed: lastRevMatch ? 0.92 : 0.4,
    nextReview: nextRevMatch ? 0.92 : 0.4,
  };

  // If critical fields are missing, invoke LLM fallback in JSON mode
  if (!idMatch || !tierMatch || !deptMatch) {
    try {
      const prompt = `Extract clinical document metadata from this text into a JSON object with keys:
id, title, version, tier (number 1-5), docType, owner, approver, department, payer, effectiveDate, lastReviewed, nextReview.
Text:
${firstPageText.slice(0, 1500)}`;

      const llmResult = await generate(prompt, { json: true });
      const parsed = JSON.parse(llmResult);
      if (parsed.id && !idMatch) {
        fields.id = parsed.id;
        fieldConfidence.id = 0.85;
      }
      if (parsed.tier && !tierMatch) {
        fields.tier = parsed.tier;
        fieldConfidence.tier = 0.85;
      }
      if (parsed.department && !deptMatch) {
        fields.department = parsed.department;
        fieldConfidence.department = 0.85;
      }
    } catch {
      // Keep regex results if LLM fallback fails
    }
  }

  return { fields, fieldConfidence };
}

/**
 * Split document pages into section-anchored chunks.
 */
export function chunkDocumentPages(
  pagesText: string[],
  docId: string
): Omit<ChunkRecord, "embedding">[] {
  const chunks: Omit<ChunkRecord, "embedding">[] = [];
  let chunkIdx = 0;

  for (let pageNum = 1; pageNum <= pagesText.length; pageNum++) {
    const pageText = pagesText[pageNum - 1] || "";
    // Match section headers like "Section 4.1 ...", "Section 14-8 ..."
    const sectionSplitRegex = /(?:^|\r?\n)(Section\s+[A-Za-z0-9.-]+[^\r\n]*)/gi;
    const matches: { index: number; heading: string }[] = [];

    let match;
    while ((match = sectionSplitRegex.exec(pageText)) !== null) {
      matches.push({
        index: match.index,
        heading: match[1].trim(),
      });
    }

    if (matches.length === 0) {
      // Whole page is a single chunk if no section headers exist
      if (pageText.trim()) {
        chunks.push({
          documentId: docId,
          chunkIndex: chunkIdx++,
          section: `Page ${pageNum} Content`,
          page: pageNum,
          content: pageText.trim(),
        });
      }
      continue;
    }

    // Capture preamble before first section (metadata/overview)
    if (matches[0].index > 50) {
      const preamble = pageText.slice(0, matches[0].index).trim();
      if (preamble.length > 30) {
        chunks.push({
          documentId: docId,
          chunkIndex: chunkIdx++,
          section: `Section 0 (Document Overview & Administrative Header)`,
          page: pageNum,
          content: preamble,
        });
      }
    }

    // Split between consecutive section markers
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : pageText.length;
      const sectionContent = pageText.slice(start, end).trim();

      if (sectionContent.length > 0) {
        chunks.push({
          documentId: docId,
          chunkIndex: chunkIdx++,
          section: matches[i].heading,
          page: pageNum,
          content: sectionContent,
        });
      }
    }
  }

  return chunks;
}

/**
 * Ingest a single PDF file end-to-end:
 * 1. Extract text per page with unpdf
 * 2. Parse metadata
 * 3. Store PDF in Supabase Storage bucket 'documents'
 * 4. Save document record
 * 5. Chunk and embed sections
 * 6. Save chunks in public.chunks
 */
export async function ingestPdfBuffer(
  pdfBuffer: Buffer,
  filename: string,
  options: { force?: boolean } = {}
): Promise<{ document: DocumentRecord; extracted: ExtractedMetadata; chunkCount: number }> {
  const supabase = getAdminSupabase();
  const checksum = computeChecksum(pdfBuffer);

  // 1. Extract text per page
  const extractedPages = await extractText(new Uint8Array(pdfBuffer), { mergePages: false });
  const pages = extractedPages.text || [];
  const firstPage = pages[0] || "";

  // 2. Extract metadata
  const extracted = await extractDocumentMetadata(firstPage, filename);
  const fields = extracted.fields;
  const docId = fields.id || filename.replace(/\.[^/.]+$/, "");

  // Check idempotency: if checksum already exists in DB and !force, reuse
  if (!options.force) {
    const { data: existing } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .maybeSingle();

    if (existing && existing.checksum === checksum) {
      const { freshness, daysOverdue } = computeFreshness(
        existing.next_review,
        firstPage
      );
      const docRecord: DocumentRecord = {
        id: existing.id,
        title: existing.title,
        version: existing.version,
        tier: existing.tier,
        docType: existing.doc_type,
        owner: existing.owner,
        approver: existing.approver,
        department: existing.department,
        payer: existing.payer || undefined,
        effectiveDate: existing.effective_date,
        lastReviewed: existing.last_reviewed,
        nextReview: existing.next_review,
        freshness,
        daysOverdue,
        newerVersionId: existing.newer_version_id || undefined,
        fileUrl: existing.file_url,
        checksum: existing.checksum,
      };

      const { count } = await supabase
        .from("chunks")
        .select("*", { count: "exact", head: true })
        .eq("document_id", docId);

      return { document: docRecord, extracted, chunkCount: count || 0 };
    }
  }

  // 3. Upload PDF to private Supabase Storage bucket 'documents'
  const storagePath = `${docId}.pdf`;
  try {
    await supabase.storage.from("documents").upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  } catch (err) {
    console.warn(`[Ingest] Storage upload warning for ${storagePath}:`, err);
  }

  // 4. Calculate freshness and daysOverdue
  const statusLineMatch = firstPage.match(/Status:\s*([^\r\n]+)/i);
  const statusRaw = statusLineMatch ? statusLineMatch[1] : "";
  const { freshness, daysOverdue } = computeFreshness(fields.nextReview || null, statusRaw);

  const documentRecord: DocumentRecord = {
    id: docId,
    title: fields.title || "Clinical Document",
    version: fields.version || "1.0",
    tier: (fields.tier || 4) as TierNumber,
    docType: fields.docType || "Institutional SOP",
    owner: fields.owner || "Clinical Operations",
    approver: fields.approver || "Medical Executive Committee",
    department: fields.department || "General Hospital",
    payer: fields.payer || undefined,
    effectiveDate: fields.effectiveDate || null,
    lastReviewed: fields.lastReviewed || null,
    nextReview: fields.nextReview || null,
    freshness,
    daysOverdue,
    newerVersionId: fields.newerVersionId,
    fileUrl: `documents/${storagePath}`,
    checksum,
  };

  // 5. Upsert document in public.documents
  const { error: docError } = await supabase.from("documents").upsert({
    id: documentRecord.id,
    title: documentRecord.title,
    version: documentRecord.version,
    tier: documentRecord.tier,
    doc_type: documentRecord.docType,
    owner: documentRecord.owner,
    approver: documentRecord.approver,
    department: documentRecord.department,
    payer: documentRecord.payer,
    effective_date: documentRecord.effectiveDate,
    last_reviewed: documentRecord.lastReviewed,
    next_review: documentRecord.nextReview,
    freshness: documentRecord.freshness,
    days_overdue: documentRecord.daysOverdue,
    newer_version_id: documentRecord.newerVersionId,
    file_url: documentRecord.fileUrl,
    checksum: documentRecord.checksum,
  });

  if (docError) {
    throw new Error(`Failed to save document record: ${docError.message}`);
  }

  // 6. Split into section chunks
  const unmappedChunks = chunkDocumentPages(pages, docId);

  // 7. Generate vector embeddings for all chunks in batch
  const chunkTexts = unmappedChunks.map(
    (c) => `${c.section}\n[From ${docId} - ${documentRecord.title}]: ${c.content}`
  );
  const embeddings = await embed(chunkTexts, "RETRIEVAL_DOCUMENT");

  // 8. Delete any old chunks for this document and insert new chunks
  await supabase.from("chunks").delete().eq("document_id", docId);

  const chunkRows = unmappedChunks.map((c, idx) => ({
    document_id: docId,
    chunk_index: c.chunkIndex,
    section: c.section,
    page: c.page,
    content: c.content,
    embedding: embeddings[idx],
  }));

  if (chunkRows.length > 0) {
    const { error: chunkError } = await supabase.from("chunks").insert(chunkRows);
    if (chunkError) {
      throw new Error(`Failed to store chunks: ${chunkError.message}`);
    }
  }

  return {
    document: documentRecord,
    extracted,
    chunkCount: chunkRows.length,
  };
}
