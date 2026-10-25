import { TURNO_PADRAO, urlConfigMunicipios, urlExterior, urlLocalidade, type Turno } from "./config";
import type { TseConfigMunicipios, TseResultadoBruto } from "./types";

/** O CDN do TSE rejeita clientes sem User-Agent de navegador. */
const CABECALHOS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  Accept: "application/json,text/plain,*/*",
};

export const REVALIDACAO_SEGUNDOS = 30;

async function buscarJson<T>(url: string, revalidate = REVALIDACAO_SEGUNDOS): Promise<T> {
  const resposta = await fetch(url, { headers: CABECALHOS, next: { revalidate } });
  if (!resposta.ok) {
    throw new Error(`TSE respondeu ${resposta.status} para ${url}`);
  }
  return (await resposta.json()) as T;
}

/** Turno encerrado muda pouco: cacheia mais para não repetir 186 consultas. */
const revalidacao = (turno: Turno) => (turno === TURNO_PADRAO ? REVALIDACAO_SEGUNDOS : 600);

/** Resultado consolidado de todas as seções do exterior. */
export function buscarResultadoExterior(turno: Turno) {
  return buscarJson<TseResultadoBruto>(urlExterior(turno), revalidacao(turno));
}

/** Resultado de uma cidade do exterior. */
export function buscarResultadoLocalidade(turno: Turno, codigo: string) {
  return buscarJson<TseResultadoBruto>(urlLocalidade(turno, codigo), revalidacao(turno));
}

/**
 * Localidades do exterior direto do TSE. Serve para detectar cidades que
 * entraram no pleito depois do mapa estático em `src/lib/locais.ts`.
 */
export async function buscarLocalidadesTse(turno: Turno = TURNO_PADRAO) {
  const config = await buscarJson<TseConfigMunicipios>(urlConfigMunicipios(turno), 3600);
  const zz = config.abr.find((a) => a.cd === "zz");
  return zz?.mu.map((m) => ({ codigo: m.cd, nome: m.nm })) ?? [];
}
