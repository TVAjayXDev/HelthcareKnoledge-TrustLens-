import { DocumentRecord, ExtractedMetadata } from "../contract";

export function getMockUploadResult(filename: string): {
  document: DocumentRecord;
  extracted: ExtractedMetadata;
} {
  const docId = "SOP-NEW-" + Math.floor(100 + Math.random() * 900);

  const document: DocumentRecord = {
    id: docId,
    title: filename ? filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") : "Clinical Policy Upload",
    version: "v1.0",
    tier: 4,
    docType: "Institutional SOP",
    owner: "Clinical Governance Directorate",
    approver: "Hospital Operations Committee",
    department: "Clinical Operations",
    effectiveDate: new Date().toISOString(),
    lastReviewed: new Date().toISOString(),
    nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    freshness: "current",
    daysOverdue: 0,
    fileUrl: `/seed-docs/${filename || "document.pdf"}`,
    checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  };

  const extracted: ExtractedMetadata = {
    fields: {
      id: docId,
      title: document.title,
      version: document.version,
      tier: 4,
      docType: "Institutional SOP",
      owner: document.owner,
      approver: document.approver,
      department: document.department,
      effectiveDate: document.effectiveDate,
      lastReviewed: document.lastReviewed,
      nextReview: document.nextReview,
    },
    fieldConfidence: {
      id: 0.98,
      title: 0.95,
      version: 0.92,
      tier: 0.94,
      docType: 0.91,
      owner: 0.88,
      approver: 0.86,
      department: 0.93,
      effectiveDate: 0.89,
    },
  };

  return { document, extracted };
}
