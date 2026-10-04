import { NextResponse } from "next/server";
import { obterRankingPaises } from "@/lib/apuracao";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const paises = await obterRankingPaises();
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
