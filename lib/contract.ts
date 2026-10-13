// Shared contract. All 3 members code against this file.
export type TierNumber = 1 | 2 | 3 | 4 | 5;
export const TIER_NAMES: Record<TierNumber, string> = {
  1: "Regulatory Statutes", 2: "Clinical Guidelines", 3: "Payer Rules",
  4: "Institutional SOPs", 5: "Department Memos / Bylaws",
};
export type Freshness = "current" | "review_overdue" | "draft" | "superseded";

export interface DocumentRecord {
  id: string;                 // e.g. "SOP-ED-402"
  title: string;
  version: string;
  tier: TierNumber;
  docType: string;
  owner: string;
  approver: string;
  department: string;
  payer?: string;
  effectiveDate: string | null;   // ISO date
  lastReviewed: string | null;
  nextReview: string | null;
  freshness: Freshness;
  daysOverdue: number;            // 0 if not overdue
  newerVersionId?: string;
  fileUrl: string;
  checksum: string;               // SHA-256 of the file
}

export interface Citation {
  n: number;                      // 1-based, matches [n] in claims
  documentId: string;
  section: string;                // e.g. "Section 4.2.1"
  page: number;
  quote: string;
  similarity: number;             // 0..1
}
export interface Claim { text: string; citations: number[]; }

export interface Warning {
  kind: "review_overdue" | "draft_exists" | "superseded" | "low_relevance";
  documentId: string;
  message: string;
}
export interface ConflictInfo {
  documentA: string; documentB: string;
  passageA: string; passageB: string;
  mismatch: string;               // e.g. "72 hours vs 5 business days"
  winnerId: string;
  reason: string;
}

export interface AskResponse {
  id: string;
  question: string;
  status: "answered" | "conflict" | "no_answer";
  claims: Claim[];
  citations: Citation[];
  sources: DocumentRecord[];
  confidence: { level: "high" | "medium" | "low" | "none"; reason: string };
  groundingCheck: { passed: boolean; groundedClaims: number; totalClaims: number };
  warnings: Warning[];
  conflict?: ConflictInfo;
  closestDocuments?: { documentId: string; relevance: number; note: string }[];
  gapLogged: boolean;
  createdAt: string;
}

export interface ExtractedMetadata {
  fields: Partial<Omit<DocumentRecord, "fileUrl" | "checksum" | "freshness" | "daysOverdue">>;
  fieldConfidence: Record<string, number>;
}
export interface DashboardData {
  summary: { unansweredQuestions: number; outdatedDocuments: number; conflictsFound: number; neverReviewed: number };
  unanswered: { question: string; timesAsked: number; department: string; suggestedDocument: string }[];
  gapsByDepartment: { department: string; gaps: number }[];
  staleDocuments: { documentId: string; owner: string; daysOverdue: number }[];
}
