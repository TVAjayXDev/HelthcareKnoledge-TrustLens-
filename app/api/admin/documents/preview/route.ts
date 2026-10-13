import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";
import { isValidPdfBuffer, sanitizePdfFilename } from "@/lib/utils/pdf";
import { extractDocumentMetadata, computeChecksum } from "@/lib/ai/ingest";
import { stageDocumentPreview } from "@/lib/ai/previewStore";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided in request." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds 15 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!isValidPdfBuffer(buffer)) {
      return NextResponse.json(
        { error: "Invalid file signature. Uploaded file is not a valid PDF document." },
        { status: 400 }
      );
    }

    const filename = sanitizePdfFilename(file.name || "document_upload.pdf");
    const checksum = computeChecksum(buffer);

    // 1. Extract per-page text using unpdf
    const uint8 = new Uint8Array(buffer);
    const pdf = await extractText(uint8, { mergePages: false });
    const rawPages: string[] = Array.isArray(pdf.text) ? pdf.text : [pdf.text || ""];
    const pages: { page: number; text: string }[] = rawPages.map((text: string, idx: number) => ({
      page: idx + 1,
      text: typeof text === "string" ? text : String(text || ""),
    }));

    if (pages.length === 0 || !pages[0].text.trim()) {
      return NextResponse.json(
        { error: "Could not extract readable text from the uploaded PDF document." },
        { status: 400 }
      );
    }

    // 2. Extract governance metadata with per-field confidence (Regex + LLM fallback)
    const extracted = await extractDocumentMetadata(pages[0].text, filename);

    // 3. Stage the parsed document temporarily (NOT committed to database or storage)
    const token = stageDocumentPreview(buffer, filename, checksum, pages, extracted);

    await logAdminActivity(auth.user.id, "document_preview", filename, {
      token,
      pageCount: pages.length,
      detectedTitle: extracted.fields.title,
      detectedTier: extracted.fields.tier,
    });

    return NextResponse.json(
      {
        token,
        filename,
        checksum,
        pageCount: pages.length,
        extracted,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Admin Preview Error]:", err);
    const message = err instanceof Error ? err.message : "Failed to parse document preview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
