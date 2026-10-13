import { AskResponse } from "../lib/contract";

const QUESTIONS = [
  {
    tag: "A",
    text: "Can nursing staff initiate IV potassium without attending physician co-signature?",
    expectation:
      "answered, cites SOP-ED-402 / LAB-REF-109 / CARD-GUIDE-2024 / NFH-REG-2024, warning about HOSP-BYLAW-88 overdue + draft, high confidence",
  },
  {
    tag: "B",
    text: "How long can a patient wait for prior authorization approval before urgent escalation?",
    expectation:
      "conflict, PAYER-RHP-2024 72 hours vs SOP-REV-108 5 business days, winner PAYER-RHP-2024",
  },
  {
    tag: "C",
    text: "What is our policy on telehealth prescribing for Schedule II-IV controlled substances?",
    expectation: "no_answer, gap logged",
  },
  {
    tag: "D",
    text: "Can an attending countersign electronically within 2 hours when moving a patient out of critical care?",
    expectation:
      "active HOSP-BYLAW-88 requires written; the draft must be flagged, never used as the answer",
  },
  {
    tag: "E",
    text: "Can a nurse start potassium replacement for a 12-year-old under the standing order?",
    expectation: "no, excluded under 18",
  },
  {
    tag: "F",
    text: "How often should central line dressings be changed?",
    expectation: "ICU-CENT-14 answer with an overdue warning, confidence medium",
  },
  {
    tag: "G",
    text: "When should triage escalate a febrile infant to the attending?",
    expectation: "PEDS-FEVER-03 answer with overdue warning, no invented work-up",
  },
];

async function runVerification() {
  console.log("=================================================");
  console.log("TrustLens Clinical Evaluation: 7 Scenario Verification");
  console.log("=================================================\n");

  const results: Record<string, unknown>[] = [];

  for (const q of QUESTIONS) {
    console.log(`\n-------------------------------------------------`);
    console.log(`Running Scenario [${q.tag}]: "${q.text}"`);
    console.log(`Expectation: ${q.expectation}`);

    try {
      const res = await fetch("http://localhost:3000/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.text }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`HTTP ${res.status} Error:`, errText);
        results.push({
          tag: q.tag,
          status: `ERROR ${res.status}`,
          confidence: "N/A",
          claimsCount: 0,
          warningsCount: 0,
          conflict: "None",
        });
        continue;
      }

      const data: AskResponse = await res.json();
      const citedDocs = data.citations.map((c) => c.documentId).join(", ");
      const warningTypes = data.warnings.map((w) => `${w.kind}(${w.documentId})`).join(", ");
      const conflictSummary = data.conflict
        ? `${data.conflict.documentA} vs ${data.conflict.documentB} (Winner: ${data.conflict.winnerId})`
        : "None";

      console.log(`✓ Status: ${data.status}`);
      console.log(`✓ Confidence: ${data.confidence.level} (${data.confidence.reason})`);
      console.log(`✓ Claims Count: ${data.claims.length}`);
      data.claims.forEach((cl, i) => {
        console.log(`   Claim ${i + 1}: "${cl.text}" [Citations: ${cl.citations.join(", ")}]`);
      });
      console.log(`✓ Citations: ${data.citations.length} (${citedDocs})`);
      console.log(`✓ Warnings: ${data.warnings.length} [${warningTypes}]`);
      if (data.conflict) {
        console.log(`✓ Conflict Detected: ${conflictSummary}`);
        console.log(`   Reason: ${data.conflict.reason}`);
      }
      if (data.status === "no_answer") {
        console.log(`✓ Gap Logged: ${data.gapLogged}`);
      }

      results.push({
        tag: q.tag,
        status: data.status,
        confidence: data.confidence.level,
        claimsCount: data.claims.length,
        warningsCount: data.warnings.length,
        conflict: data.conflict ? "YES" : "No",
        citedDocs,
      });

      // Brief delay between live LLM queries to maintain optimal API throughput
      await new Promise((r) => setTimeout(r, 800));
    } catch (err: unknown) {
      console.error(`Execution error for scenario [${q.tag}]:`, err);
    }
  }

  console.log("\n=================================================");
  console.log("Summary Table of 7 Test Scenarios");
  console.log("=================================================");
  console.table(results);
}

runVerification().catch(console.error);
