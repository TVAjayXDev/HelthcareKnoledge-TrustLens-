import { NextRequest, NextResponse } from "next/server";
import { getMockUploadResult } from "@/lib/mock/upload";
import { ingestPdfBuffer } from "@/lib/ai/ingest";
import { requireAdmin, logAdminActivity } from "@/lib/auth/requireAdmin";
import { isValidPdfBuffer, sanitizePdfFilename } from "@/lib/utils/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Authorization Guard
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return auth.response;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided in request." }, { status: 400 });
    }

    // 2. File size validation (Max 15 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the 15 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Magic Bytes Validation (Checks file signature, not just extension)
    if (!isValidPdfBuffer(buffer)) {
      return NextResponse.json(
        { error: "Invalid file format. Uploaded file is not a valid PDF document (missing %PDF- signature)." },
        { status: 400 }
      );
    }

    // 4. Filename sanitization
    const sanitizedFilename = sanitizePdfFilename(file.name || "policy_upload.pdf");

    // 5. Mock mode toggle
    const useMock = process.env.USE_MOCK === "true";
    if (useMock) {
      const result = getMockUploadResult(sanitizedFilename);
      await logAdminActivity(auth.user.id, "document_upload_mock", result.document.id, {
        filename: sanitizedFilename,
        size: buffer.length,
      });
      return NextResponse.json(result, { status: 200 });
    }

    // 6. Live document ingestion pipeline
    const result = await ingestPdfBuffer(buffer, sanitizedFilename, { force: true });

    // 7. Write to admin audit log
    await logAdminActivity(auth.user.id, "document_upload", result.document.id, {
      filename: sanitizedFilename,
      title: result.document.title,
      tier: result.document.tier,
      sizeBytes: buffer.length,
      chunkCount: result.chunkCount,
    });

    return NextResponse.json(
      { document: result.document, extracted: result.extracted, chunkCount: result.chunkCount },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[API Upload Error]:", err);
    const message = err instanceof Error ? err.message : "Failed to ingest document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
