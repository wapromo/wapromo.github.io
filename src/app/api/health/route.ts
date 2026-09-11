import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "wapromo-api", time: new Date().toISOString() });
}
