import { NextRequest, NextResponse } from "next/server";
import { obterDadosMapa } from "@/lib/apuracao";
import { turnoValido } from "@/lib/tse/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await obterDadosMapa(turnoValido(request.nextUrl.searchParams.get("turno"))), {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Falha ao montar o mapa" },
      { status: 502 },
    );
  }
}
