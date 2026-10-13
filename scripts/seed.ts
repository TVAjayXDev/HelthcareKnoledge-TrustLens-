import fs from "fs";
import path from "path";
import { ingestPdfBuffer } from "../lib/ai/ingest";

async function main() {
  console.log("=================================================");
  console.log("TrustLens Knowledge Base Ingestion & Seeding");
  console.log("=================================================\n");

  const seedDir = path.resolve(process.cwd(), "seed-docs");
  if (!fs.existsSync(seedDir)) {
    console.error(`Error: Seed directory not found at ${seedDir}`);
    process.exit(1);
  }

  // Read files and strictly exclude any file starting with '00_'
  const allFiles = fs.readdirSync(seedDir);
  const pdfFiles = allFiles
    .filter((f) => f.toLowerCase().endsWith(".pdf") && !f.startsWith("00_"))
    .sort();

  console.log(`Found ${pdfFiles.length} candidate PDFs to ingest from ./seed-docs/\n`);

  const results: {
    id: string;
    tier: number;
    freshness: string;
    daysOverdue: number;
    chunkCount: number;
  }[] = [];

  for (let i = 0; i < pdfFiles.length; i++) {
    const filename = pdfFiles[i];
    const filePath = path.join(seedDir, filename);
    const buffer = fs.readFileSync(filePath);

    process.stdout.write(`[${i + 1}/${pdfFiles.length}] Processing ${filename}... `);

    try {
      const { document, chunkCount } = await ingestPdfBuffer(buffer, filename);
      console.log(`✓ Ingested (${document.id}, ${chunkCount} chunks)`);

      results.push({
        id: document.id,
        tier: document.tier,
        freshness: document.freshness,
        daysOverdue: document.daysOverdue,
        chunkCount,
      });
    } catch (err: unknown) {
      console.log(`✗ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n=================================================");
  console.log("Ingestion Complete: Table of Seeded Documents");
  console.log("=================================================");
  console.table(results);
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
