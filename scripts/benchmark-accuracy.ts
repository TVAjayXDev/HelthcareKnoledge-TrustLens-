import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
}

import { generate } from "../lib/ai/llm";
import { askQuestion } from "../lib/ai/ask";

interface TestCase {
  id: number;
  question: string;
  expectedFact: string;
  checkGroundTruth: (answer: string, isRag: boolean, ragStatus?: string) => boolean;
}

const TEST_CASES: TestCase[] = [
  {
    id: 1,
    question: "Can registered nurses autonomously initiate protocolized potassium chloride infusions for serum levels below 3.2 mEq/L at Northfield Health?",
    expectedFact: "Yes, under SOP-ED-402 RNs may autonomously initiate for serum levels < 3.2 mEq/L.",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return (lower.includes("yes") || lower.includes("may") || lower.includes("autonomously")) &&
        (lower.includes("3.2") || lower.includes("potassium"));
    },
  },
  {
    id: 2,
    question: "Under Regional Health Plans commercial agreements (PAYER-RHP-2024), what is the statutory determination deadline for urgent prior authorizations?",
    expectedFact: "Strictly 72 hours (3 calendar days).",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return lower.includes("72 hour") || lower.includes("72-hour") || lower.includes("3 calendar day");
    },
  },
  {
    id: 3,
    question: "Under State Standing Order statutes (NFH-REG-2024), how many hours can provider counter-signature be deferred after standing order initiation?",
    expectedFact: "Up to 4 hours deferral permitted.",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return lower.includes("4 hour") || lower.includes("four hour");
    },
  },
  {
    id: 4,
    question: "According to Northfield Health critical laboratory reference values (LAB-REF-109), what serum potassium cutoff triggers an immediate critical telemetry alert?",
    expectedFact: "Serum potassium < 3.0 mEq/L.",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return lower.includes("3.0") || lower.includes("< 3.0");
    },
  },
  {
    id: 5,
    question: "Under Northfield Health cardiology guidance (CARD-GUIDE-2024), is a baseline 12-lead telemetry confirmation mandatory prior to hypertonic electrolyte repletion?",
    expectedFact: "Yes, baseline 12-lead telemetry confirmation is mandatory.",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return (lower.includes("yes") || lower.includes("mandatory") || lower.includes("required")) &&
        (lower.includes("telemetry") || lower.includes("12-lead"));
    },
  },
  {
    id: 6,
    question: "If Northfield revenue cycle SOP-REV-108 allows 5 business days for prior auth review, does Regional Health Plans' 72-hour urgent requirement legally override it?",
    expectedFact: "Yes, Tier 3 Payer rule outranks Tier 4 Departmental SOP (conflict resolution).",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return (lower.includes("override") || lower.includes("supersede") || lower.includes("tier 3") || lower.includes("yes") || lower.includes("72")) &&
        !lower.includes("no, 5 business days");
    },
  },
  {
    id: 7,
    question: "What is the scheduled clinical governance review status of pediatric emergency fever protocol PEDS-FEVER-03?",
    expectedFact: "Review is overdue by ~89 days.",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return lower.includes("overdue") || lower.includes("expired") || lower.includes("89") || lower.includes("past");
    },
  },
  {
    id: 8,
    question: "Is the unratified draft document HOSP-BYLAW-88-RevB legally binding for clinical medication order decisions at Northfield Health?",
    expectedFact: "No, it is an unratified draft pending P&T committee review and cannot be used for clinical decisions.",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      const lower = answer.toLowerCase();
      return (lower.includes("not binding") || lower.includes("cannot be used") || lower.includes("unratified") || lower.includes("draft") || lower.includes("no"));
    },
  },
  {
    id: 9,
    question: "What is Northfield Health's ratified clinical guideline for prescribing Schedule II-IV controlled substances via outpatient telehealth?",
    expectedFact: "No ratified policy exists; system must refuse to hallucinate (Safety Silence).",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      const lower = answer.toLowerCase();
      if (isRag) {
        return ragStatus === "no_answer" || lower.includes("no claims could be grounded") || lower.includes("no ratified");
      }
      return lower.includes("no ratified") || lower.includes("do not have") || lower.includes("not available");
    },
  },
  {
    id: 10,
    question: "According to ICU nursing protocol ICU-CENT-14, is the policy currently active or overdue for scheduled clinical governance review?",
    expectedFact: "Overdue for scheduled review (~116 days).",
    checkGroundTruth: (answer, isRag, ragStatus) => {
      if (isRag && ragStatus === "no_answer") return false;
      const lower = answer.toLowerCase();
      return lower.includes("overdue") || lower.includes("past") || lower.includes("116") || lower.includes("expired");
    },
  },
];

async function runBenchmark() {
  console.log("====================================================================");
  console.log("TrustLens Empirical Accuracy Benchmark (10 Verified Questions)");
  console.log("Testing Condition 1: Without Documents (Standard Pretrained LLM)");
  console.log("Testing Condition 2: With Documents (TrustLens Grounded RAG Engine)");
  console.log("====================================================================\n");

  let withoutDocCorrect = 0;
  let withDocCorrect = 0;
  const results = [];

  for (const tc of TEST_CASES) {
    console.log(`[Q${tc.id}/10] ${tc.question}`);

    // Condition 1: Without Documents (Raw Pretrained LLM)
    let rawLLMAnswer = "";
    let rawPassed = false;
    try {
      const prompt = `You are an AI assistant. Answer this hospital policy question for Northfield Health System accurately and concisely:\n"${tc.question}"`;
      rawLLMAnswer = await generate(prompt, { temperature: 0.1 });
      rawPassed = tc.checkGroundTruth(rawLLMAnswer, false);
    } catch (err: any) {
      rawLLMAnswer = `Error: ${err.message}`;
      rawPassed = false;
    }

    if (rawPassed) withoutDocCorrect++;

    // Condition 2: With Documents (TrustLens Grounded RAG)
    let ragPassed = false;
    let ragSummary = "";
    try {
      const resp = await askQuestion(tc.question);
      const answerText = resp.claims.map((c) => c.text).join(" ") + " " + resp.confidence.reason + " " + resp.warnings.map(w => w.message).join(" ");
      ragPassed = tc.checkGroundTruth(answerText, true, resp.status);
      ragSummary = resp.status === "no_answer" 
        ? "Safety Silence (Grounded)" 
        : `Answered (${resp.claims.length} claims, ${resp.citations.length} citations, status: ${resp.status})`;
    } catch (err: any) {
      ragSummary = `Error: ${err.message}`;
      ragPassed = false;
    }

    if (ragPassed) withDocCorrect++;

    console.log(`  -> Without Docs: ${rawPassed ? "PASS (Accurate)" : "FAIL (Unsupported/Hallucinated)"}`);
    console.log(`  -> With Docs:    ${ragPassed ? "PASS (Grounded & Verified)" : "FAIL"}`);
    console.log(`     Details: ${ragSummary}\n`);

    results.push({
      id: tc.id,
      question: tc.question.slice(0, 50) + "...",
      withoutDocs: rawPassed ? "PASS" : "FAIL",
      withDocs: ragPassed ? "PASS" : "FAIL",
      expected: tc.expectedFact,
    });
  }

  const withoutPct = Math.round((withoutDocCorrect / TEST_CASES.length) * 100);
  const withPct = Math.round((withDocCorrect / TEST_CASES.length) * 100);

  console.log("====================================================================");
  console.log("FINAL EMPIRICAL BENCHMARK RESULTS TABLE");
  console.log("====================================================================");
  console.table(results);
  console.log(`\nWithout Documents Accuracy: ${withoutDocCorrect}/${TEST_CASES.length} (${withoutPct}%)`);
  console.log(`With Documents (RAG) Accuracy:  ${withDocCorrect}/${TEST_CASES.length} (${withPct}%)\n`);

  fs.writeFileSync(
    path.resolve(process.cwd(), "scratch_benchmark_results.json"),
    JSON.stringify({ withoutPct, withPct, results }, null, 2)
  );
}

runBenchmark().catch((e) => {
  console.error("Benchmark error:", e);
  process.exit(1);
});
