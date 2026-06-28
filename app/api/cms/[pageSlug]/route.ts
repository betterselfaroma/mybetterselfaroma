import { NextResponse } from "next/server";
import { getPublicCmsPayload } from "@/lib/cms";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { pageSlug: string } },
) {
  const payload = await getPublicCmsPayload(params.pageSlug);
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
