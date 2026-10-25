import { NextRequest, NextResponse } from "next/server";
import { obterRankingPaises } from "@/lib/apuracao";
import { turnoValido } from "@/lib/tse/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const paises = await obterRankingPaises(turnoValido(request.nextUrl.searchParams.get("turno")));
    return NextResponse.json(paises, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Falha ao consultar o TSE" },
      { status: 502 },
    );
  }
}
