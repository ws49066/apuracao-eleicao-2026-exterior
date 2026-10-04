import { PAISES } from "../locais";
import type { PaisProvisorio } from "@/data/provisorio";

export const semAcento = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function htmlParaTexto(html: string): string {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Chave = nome de urna do TSE. `null` marca nomes que não existem na urna. */
const CANDIDATOS: [RegExp, string | null][] = [
  [/flavio/, "FLAVIO BOLSONARO"],
  [/lula/, "LULA"],
  [/renan/, "RENAN SANTOS"],
  [/cury/, "ESCRITOR AUGUSTO CURY"],
  [/zema/, "ZEMA"],
  [/caiad/, "RONALDO CAIADO"],
  [/samara/, "SAMARA"],
  [/hertz/, "HERTZ DIAS"],
  [/clariana/, "CLARIANA BARAO"],
  [/ed[mi]*lson/, "EDMILSON COSTA"],
  [/rui/, "RUI COSTA PIMENTA"],
  [/grass|wilson/, "VETERINÁRIO WILSON GRASSI"],
  [/avalanche/, null],
];

const FIM_DA_LISTA = ["ate a publicacao desta reportagem", "este texto sera atualizado"];

const TEMPLATE_CABECALHO = (nome: string) =>
  new RegExp(`(?:^|\\s)${nome}(?:\\s*\\(([^)]*)\\))?\\s+(?:na|no|nos|nas|em)\\s`);

const REGEX_ITEM = /([a-z][a-z' .]*?)[\s,:]+(\d[\d.]*)\s*(?:votos?|\()/g;

/**
 * Lê uma matéria no formato "País — Candidato, N votos (x%)". Os números das
 * matérias trazem erros de digitação (ex.: "Edmilson Cost,131"), por isso o
 * casamento de nomes é tolerante e o resultado é conferido contra o percentual
 * do líder que a própria matéria informa.
 */
export function lerMateriaPorPais(html: string): PaisProvisorio[] {
  const texto = semAcento(htmlParaTexto(html));

  const cabecalhos = PAISES.flatMap((pais) => {
    const m = TEMPLATE_CABECALHO(semAcento(pais.nome).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).exec(texto);
    return m ? [{ pais, inicio: m.index, parcial: m[1]?.includes("secoes") ? m[1] : undefined }] : [];
  }).sort((a, b) => a.inicio - b.inicio);

  const fimGeral = FIM_DA_LISTA.map((f) => texto.indexOf(f)).filter((i) => i >= 0);

  const resultado: PaisProvisorio[] = [];
  cabecalhos.forEach((cab, i) => {
    const fimBloco = Math.min(
      cabecalhos[i + 1]?.inicio ?? Infinity,
      ...fimGeral.filter((f) => f > cab.inicio),
      cab.inicio + 2500,
    );
    const bloco = texto.slice(cab.inicio, fimBloco);

    const votos: Record<string, number> = {};
    let naoIdentificados = 0;
    for (const m of bloco.matchAll(REGEX_ITEM)) {
      const quantidade = Number(m[2].replace(/\./g, ""));
      const alvo = CANDIDATOS.find(([regex]) => regex.test(m[1]));
      if (!alvo) continue;
      const [, nome] = alvo;
      if (nome === null) naoIdentificados += quantidade;
      else if (!(nome in votos)) votos[nome] = quantidade;
    }
    if (Object.keys(votos).length < 2) return;

    const ref = /venc\w+ com ([\d,]+)\s*%/.exec(bloco);
    resultado.push({
      iso: cab.pais.iso,
      votos,
      ...(naoIdentificados > 0 && { naoIdentificados }),
      ...(ref && { lideRefPct: Number(ref[1].replace(",", ".")) }),
      ...(cab.parcial && { parcial: cab.parcial.replace(/[()]/g, "").replace("secoes", "seções").trim() }),
    });
  });

  return resultado;
}

export const totalVotos = (p: PaisProvisorio) =>
  Object.values(p.votos).reduce((a, b) => a + b, 0) + (p.naoIdentificados ?? 0);
