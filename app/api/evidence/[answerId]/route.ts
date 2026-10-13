import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ answerId: string }> }
) {
  const { answerId } = await params;
  return NextResponse.json(
    {
      error: "Evidence export not implemented yet",
      answerId,
      status: "Not Implemented",
    },
    { status: 501 }
  );
}
