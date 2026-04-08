import { NextResponse } from "next/server";

export async function GET() {
  const key = (process["env"] as Record<string, string>)["KAKAO_JS_KEY"] ?? "";
  return NextResponse.json({ kakaoJsKey: key });
}
