import { DashboardData } from "../contract";

export const MOCK_DASHBOARD: DashboardData = {
  summary: {
    unansweredQuestions: 42,
    outdatedDocuments: 5,
    conflictsFound: 1,
    neverReviewed: 2,
  },
  unanswered: [
    {
      question: "What is our policy on telehealth prescribing for Schedule II-IV controlled substances?",
      timesAsked: 28,
      department: "Ambulatory & Telehealth",
      suggestedDocument: "POL-AMB-104 (Draft addendum required)",
    },
    {
      question: "Can ICU staff adjust norepinephrine titration increments without attending bedside presence?",
      timesAsked: 19,
      department: "Intensive Care Unit",
      suggestedDocument: "ICU-CENT-14 (Review overdue)",
    },
    {
      question: "What is the pediatric febrile neutropenia empiric antibiotic escalation window?",
      timesAsked: 14,
      department: "Pediatric Emergency",
      suggestedDocument: "PEDS-FEVER-03 (Review overdue)",
    },
    {
      question: "Who is authorized to sign off on subcutaneous insulin self-management exemptions?",
      timesAsked: 9,
      department: "Endocrinology",
      suggestedDocument: "HOSP-BYLAW-88 (RevB draft pending)",
    },
  ],
  gapsByDepartment: [
    { department: "Emergency Medicine", gaps: 14 },
    { department: "Ambulatory & Telehealth", gaps: 12 },
    { department: "Intensive Care Unit", gaps: 9 },
    { department: "Pediatric Emergency", gaps: 7 },
  ],
  staleDocuments: [
    { documentId: "HOSP-BYLAW-88", owner: "Hospital Operations / Dr. A. Cho", daysOverdue: 342 },
    { documentId: "SOP-REV-108", owner: "Patient Financial Services", daysOverdue: 260 },
    { documentId: "ICU-CENT-14", owner: "Critical Care Quality Council", daysOverdue: 115 },
    { documentId: "PEDS-FEVER-03", owner: "Pediatric Emergency Directorate", daysOverdue: 88 },
  ],
};
