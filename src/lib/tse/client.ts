import { urlConfigMunicipios, urlExterior, urlLocalidade } from "./config";
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

/** Resultado consolidado de todas as seções do exterior. */
export function buscarResultadoExterior() {
  return buscarJson<TseResultadoBruto>(urlExterior());
}

/** Resultado de uma cidade do exterior. */
export function buscarResultadoLocalidade(codigo: string) {
  return buscarJson<TseResultadoBruto>(urlLocalidade(codigo));
}

/**
 * Localidades do exterior direto do TSE. Serve para detectar cidades que
 * entraram no pleito depois do mapa estático em `src/lib/locais.ts`.
 */
export async function buscarLocalidadesTse() {
  const config = await buscarJson<TseConfigMunicipios>(urlConfigMunicipios(), 3600);
  const zz = config.abr.find((a) => a.cd === "zz");
  return zz?.mu.map((m) => ({ codigo: m.cd, nome: m.nm })) ?? [];
}
