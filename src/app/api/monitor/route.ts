import { NextResponse } from "next/server";
import { obterLevantamento } from "@/lib/fontes";

export const dynamic = "force-dynamic";

export async function GET() {
  const { versao, coletadoEm, resumo, fontes } = await obterLevantamento();
  return NextResponse.json(
    { versao, coletadoEm, resumo, fontes },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
