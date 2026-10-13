import { AskResponse } from "../contract";
import { MOCK_DOCUMENTS } from "./documents";

export function getMockAskResponse(question: string): AskResponse {
  const q = question.toLowerCase();

  // Case 1: Potassium (Answered with 4 citations & warnings for HOSP-BYLAW-88)
  if (q.includes("potassium")) {
    const sources = MOCK_DOCUMENTS.filter((d) =>
      ["SOP-ED-402", "LAB-REF-109", "CARD-GUIDE-2024", "NFH-REG-2024"].includes(d.id)
    );

    return {
      id: "ans-potassium-" + Date.now(),
      question,
      status: "answered",
      claims: [
        {
          text: "Registered nurses with emergency credentials may autonomously initiate protocolized potassium chloride infusions for serum levels below 3.2 mEq/L.",
          citations: [1],
        },
        {
          text: "Baseline serum potassium and continuous 12-lead telemetry confirmation are mandatory prior to initiating intravenous electrolyte repletion.",
          citations: [2, 3],
        },
        {
          text: "Under State Standing Order Delegation statutes, physician counter-signature may be deferred for up to 4 hours following initial infusion initiation.",
          citations: [4],
        },
      ],
      citations: [
        {
          n: 1,
          documentId: "SOP-ED-402",
          section: "Section 3.2 (Nursing Initiation Criteria)",
          page: 4,
          quote: "Registered nurses with emergency credentials may autonomously initiate protocolized potassium chloride infusions for serum levels < 3.2 mEq/L.",
          similarity: 0.96,
        },
        {
          n: 2,
          documentId: "LAB-REF-109",
          section: "Section 1.4 (Critical Electrolyte Cutoffs)",
          page: 2,
          quote: "Serum potassium < 3.0 mEq/L constitutes a critical alert requiring immediate telemetry and physician notification.",
          similarity: 0.94,
        },
        {
          n: 3,
          documentId: "CARD-GUIDE-2024",
          section: "Section 4.1 (Cardiac Monitoring Mandate)",
          page: 11,
          quote: "Acute inpatient repletion guidelines require verified baseline 12-lead telemetry confirmation prior to hypertonic electrolyte infusion.",
          similarity: 0.92,
        },
        {
          n: 4,
          documentId: "NFH-REG-2024",
          section: "Section 14-8 (Standing Order Delegation)",
          page: 7,
          quote: "Hospital standing orders provide legally compliant coverage deferring immediate provider counter-signature up to 4 hours.",
          similarity: 0.89,
        },
      ],
      sources,
      confidence: {
        level: "high",
        reason: "Fully grounded across Tier 1 statute, Tier 2 clinical guideline, and Tier 4 institutional protocol.",
      },
      groundingCheck: {
        passed: true,
        groundedClaims: 3,
        totalClaims: 3,
      },
      warnings: [
        {
          kind: "review_overdue",
          documentId: "HOSP-BYLAW-88",
          message: "Department bylaw HOSP-BYLAW-88 is 342 days overdue for scheduled clinical governance review.",
        },
        {
          kind: "draft_exists",
          documentId: "HOSP-BYLAW-88",
          message: "A newer unratified draft (HOSP-BYLAW-88-RevB) is currently under review by the Medical Executive Committee.",
        },
      ],
      gapLogged: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Case 2: Prior Authorization (Conflict resolution between PAYER-RHP-2024 and SOP-REV-108)
  if (q.includes("prior auth") || q.includes("authorization")) {
    const sources = MOCK_DOCUMENTS.filter((d) =>
      ["PAYER-RHP-2024", "SOP-REV-108"].includes(d.id)
    );

    return {
      id: "ans-conflict-" + Date.now(),
      question,
      status: "conflict",
      claims: [
        {
          text: "Regional Health Plans Council requires urgent prior authorization review within 72 hours, which legally supersedes Northfield Health's internal 5 business day workflow.",
          citations: [1, 2],
        },
        {
          text: "Precedence arbitration enforces Tier 3 Payer Rules over Tier 4 Departmental SOPs; care coordination staff must follow the 72-hour window.",
          citations: [1],
        },
      ],
      citations: [
        {
          n: 1,
          documentId: "PAYER-RHP-2024",
          section: "Section 7.1 (Expedited Determination Mandate)",
          page: 5,
          quote: "For urgent or life-affecting prior authorization requests, statutory determination deadline is strictly 72 hours (3 calendar days) from initial electronic submission.",
          similarity: 0.95,
        },
        {
          n: 2,
          documentId: "SOP-REV-108",
          section: "Section 6.4 (Departmental Turnaround)",
          page: 8,
          quote: "Departmental coordinators are permitted an administrative review window of up to 5 business days before notifying the ordering physician.",
          similarity: 0.91,
        },
      ],
      sources,
      confidence: {
        level: "medium",
        reason: "Hierarchical conflict detected: Tier 3 Payer Rule outranks Tier 4 Internal SOP.",
      },
      groundingCheck: {
        passed: true,
        groundedClaims: 2,
        totalClaims: 2,
      },
      warnings: [
        {
          kind: "superseded",
          documentId: "SOP-REV-108",
          message: "Internal SOP-REV-108 clause is superseded by binding external Tier 3 payer contract.",
        },
        {
          kind: "review_overdue",
          documentId: "SOP-REV-108",
          message: "SOP-REV-108 review is overdue by 260 days.",
        },
      ],
      conflict: {
        documentA: "PAYER-RHP-2024",
        documentB: "SOP-REV-108",
        passageA: "Section 7.1: Statutory determination deadline is strictly 72 hours (3 calendar days).",
        passageB: "Section 6.4: Departmental coordinators are permitted an administrative review window of up to 5 business days.",
        mismatch: "72 hours vs 5 business days",
        winnerId: "PAYER-RHP-2024",
        reason: "Precedence rule applied: Tier 3 Payer Rules outrank Tier 4 Institutional SOPs.",
      },
      gapLogged: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Case 3: Default Silence / No Answer (Gap logged true)
  return {
    id: "ans-gap-" + Date.now(),
    question,
    status: "no_answer",
    claims: [],
    citations: [],
    sources: [],
    confidence: {
      level: "none",
      reason: "No ratified Northfield Health institutional documents meet the grounding threshold for this clinical inquiry.",
    },
    groundingCheck: {
      passed: false,
      groundedClaims: 0,
      totalClaims: 0,
    },
    warnings: [
      {
        kind: "low_relevance",
        documentId: "POL-AMB-104",
        message: "Consulted documents lack explicit policy authorization; system refuses probabilistic generation.",
      },
    ],
    closestDocuments: [
      {
        documentId: "POL-AMB-104",
        relevance: 0.42,
        note: "General Outpatient Telehealth Modalities covers billing codes but contains no ratified clinical prescription protocol.",
      },
      {
        documentId: "PHARM-CS-12",
        relevance: 0.38,
        note: "Inpatient Controlled Substance protocol governs bedside dispensing inside hospital premises only.",
      },
    ],
    gapLogged: true,
    createdAt: new Date().toISOString(),
  };
}
