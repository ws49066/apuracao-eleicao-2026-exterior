import { NextRequest, NextResponse } from "next/server";
import { obterLevantamento } from "@/lib/fontes";
import { turnoValido } from "@/lib/tse/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { versao, coletadoEm, resumo, fontes } = await obterLevantamento(
    turnoValido(request.nextUrl.searchParams.get("turno")),
  );
  return NextResponse.json(
    { versao, coletadoEm, resumo, fontes },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
