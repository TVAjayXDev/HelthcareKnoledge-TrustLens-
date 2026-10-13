import { NextRequest, NextResponse } from "next/server";
import { getMockAskResponse } from "@/lib/mock/ask";
import { askQuestion } from "@/lib/ai/ask";

export const runtime = "nodejs";
export const maxDuration = 60;

// Simple in-memory rate limiter: 20 requests per minute per IP
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (!record || now > record.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (record.count >= 20) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting by IP
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before querying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question : "";

    if (!question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // 2. Mock mode toggle
    const useMock = process.env.USE_MOCK === "true";
    if (useMock) {
      const response = getMockAskResponse(question);
      return NextResponse.json(response);
    }

    // 3. Live AI grounding pipeline
    const userId = body?.userId;
    const response = await askQuestion(question, userId);
    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("[API Ask Error]:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
