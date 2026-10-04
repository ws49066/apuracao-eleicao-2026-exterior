import { NextRequest, NextResponse } from "next/server";
import { obterApuracao, type FiltroEscopo } from "@/lib/apuracao";

export const revalidate = 30;

function lerFiltro(params: URLSearchParams): FiltroEscopo {
  const tipo = params.get("tipo") ?? "exterior";
  const id = params.get("id") ?? "";
  if (tipo === "pais" && id) return { tipo: "pais", iso: id };
  if (tipo === "cidade" && id) return { tipo: "cidade", codigo: id };
  return { tipo: "exterior" };
}

export async function GET(request: NextRequest) {
  try {
    const apuracao = await obterApuracao(lerFiltro(request.nextUrl.searchParams));
    return NextResponse.json(apuracao, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
    });
  } catch (erro) {
    return NextResponse.json(
      { erro: erro instanceof Error ? erro.message : "Falha ao consultar o TSE" },
      { status: 502 },
    );
  }
}
