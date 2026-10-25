import { PAISES } from "../locais";
import type { PaisProvisorio } from "@/data/provisorio";

export const semAcento = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const ACENTOS: Record<string, string> = {
  acute: "\u0301",
  grave: "\u0300",
  circ: "\u0302",
  tilde: "\u0303",
  uml: "\u0308",
  cedil: "\u0327",
};

export function htmlParaTexto(html: string): string {
  return html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&([a-z])(acute|grave|circ|tilde|uml|cedil);/gi, (_, letra: string, acento: string) =>
      (letra + ACENTOS[acento.toLowerCase()]).normalize("NFC"),
    )
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

const ALIAS_PAISES: Record<string, string> = { "hong kong": "HK" };

function resolverPais(trecho: string): string | undefined {
  const t = semAcento(trecho).trim();
  let melhor: { iso: string; tamanho: number } | undefined;
  const candidatos = [
    ...PAISES.map((p) => [semAcento(p.nome), p.iso] as const),
    ...Object.entries(ALIAS_PAISES),
  ];
  for (const [nome, iso] of candidatos) {
    if (t.endsWith(nome) && (!melhor || nome.length > melhor.tamanho)) melhor = { iso, tamanho: nome.length };
  }
  return melhor?.iso;
}

const REGEX_CNN =
  /([a-z][a-z' .]*?)\s*\((\d[\d,]*)%\)\s*,?\s*com\s+([\d.]+)\s+votos?\s+contra\s+([\d.]+)\s+de\s+(lula|flavio)/g;

/**
 * Lê listas do tipo "Japão (80,08%), com 28.538 votos contra 7.098 de Lula",
 * próprias de disputa com dois candidatos. O líder é o oposto do nome citado
 * depois de "de". Linhas em que o "líder" não tem mais votos que o outro
 * (erro da matéria) são descartadas.
 */
export function lerListaDuelo(html: string): PaisProvisorio[] {
  const texto = semAcento(htmlParaTexto(html));
  const resultado = new Map<string, PaisProvisorio>();
  for (const m of texto.matchAll(REGEX_CNN)) {
    const iso = resolverPais(m[1]);
    const lider = Number(m[3].replace(/\./g, ""));
    const outro = Number(m[4].replace(/\./g, ""));
    if (!iso || lider <= outro || resultado.has(iso)) continue;
    const [nomeLider, nomeOutro] =
      m[5] === "lula" ? ["FLAVIO BOLSONARO", "LULA"] : ["LULA", "FLAVIO BOLSONARO"];
    resultado.set(iso, {
      iso,
      votos: { [nomeLider]: lider, [nomeOutro]: outro },
      lideRefPct: Number(m[2].replace(",", ".")),
    });
  }
  return [...resultado.values()];
}

const NOMES_DUELO: [RegExp, string][] = [
  [/^(lula|petista|candidato do pt)$/, "LULA"],
  [/^(flavio|candidato do pl|senador do pl)$/, "FLAVIO BOLSONARO"],
];
const GRUPO_NOMES = "lula|petista|candidato do pt|flavio|candidato do pl|senador do pl";
const P_NUMERO_ANTES = new RegExp(`(\\d[\\d.]*)\\s+(?:votos?\\s+)?(?:para|de)\\s+(${GRUPO_NOMES})`, "g");
const P_NOME_ANTES = new RegExp(
  `(${GRUPO_NOMES})(?:\\s+bolsonaro)?[^.\\d]{0,40}?\\b(?:recebeu|somou|teve|obteve|conquistou|registrou|alcancou|fez)\\s+(\\d[\\d.]*)`,
  "g",
);

const numero = (t: string) => Number(t.replace(/\.$/, "").replace(/\./g, ""));

/**
 * Lê matérias em frases ("Na China, Lula somou 502 votos, enquanto Flávio
 * recebeu 267"). Como cada veículo escreve de um jeito, só aceita o trecho
 * logo após o nome do país e só quando acha os dois candidatos com líder
 * à frente; o primeiro número de cada candidato vale.
 */
export function lerProsaDuelo(html: string): PaisProvisorio[] {
  const texto = semAcento(htmlParaTexto(html));

  const cabecalhos = PAISES.flatMap((pais) => {
    const nome = semAcento(pais.nome).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [...texto.matchAll(new RegExp(`(?:^|\\s)(?:na|no|nos|nas|em)\\s+${nome}(?=[\\s,.:;])`, "g"))].map(
      (m) => ({ iso: pais.iso, inicio: m.index ?? 0 }),
    );
  }).sort((a, b) => a.inicio - b.inicio);

  const resultado = new Map<string, PaisProvisorio>();
  cabecalhos.forEach((cab, i) => {
    if (resultado.has(cab.iso)) return;
    const fim = Math.min(cab.inicio + 260, cabecalhos.slice(i + 1).find((c) => c.iso !== cab.iso)?.inicio ?? Infinity);
    const bloco = texto.slice(cab.inicio, fim);

    const achados: { pos: number; nome: string; votos: number }[] = [];
    for (const m of bloco.matchAll(P_NUMERO_ANTES)) {
      const nome = NOMES_DUELO.find(([r]) => r.test(m[2]))?.[1];
      if (nome) achados.push({ pos: m.index ?? 0, nome, votos: numero(m[1]) });
    }
    for (const m of bloco.matchAll(P_NOME_ANTES)) {
      const nome = NOMES_DUELO.find(([r]) => r.test(m[1]))?.[1];
      if (nome) achados.push({ pos: m.index ?? 0, nome, votos: numero(m[2]) });
    }
    achados.sort((a, b) => a.pos - b.pos);

    const votos: Record<string, number> = {};
    for (const a of achados) if (!(a.nome in votos)) votos[a.nome] = a.votos;
    if (Object.keys(votos).length === 2) resultado.set(cab.iso, { iso: cab.iso, votos });
  });
  return [...resultado.values()];
}

const REGEX_SECOES =
  /([a-z][a-z' .-]*?)\s+2\S?\s*turno\s*:\s*(lula|flavio)(?:\s+bolsonaro)?\s*,\s*([\d.]+)\s+votos?\s*(?:\([\d,]+%\))?\s*2\S?\s*turno\s*:\s*(lula|flavio)(?:\s+bolsonaro)?\s*,\s*([\d.]+)\s+votos?/g;

/**
 * Lê blocos "País / 2º turno: Lula, N votos (x%) / 2º turno: Flávio, M votos (y%) / 1º turno: ...".
 * Países sem dados dizem "ainda não há dados" e não casam com o padrão.
 */
export function lerSecoesDuelo(html: string): PaisProvisorio[] {
  const texto = semAcento(htmlParaTexto(html));
  const resultado = new Map<string, PaisProvisorio>();
  for (const m of texto.matchAll(REGEX_SECOES)) {
    const iso = resolverPais(m[1]);
    if (!iso || m[2] === m[4] || resultado.has(iso)) continue;
    const nome = (c: string) => (c === "lula" ? "LULA" : "FLAVIO BOLSONARO");
    const votos = {
      [nome(m[2])]: Number(m[3].replace(/\./g, "")),
      [nome(m[4])]: Number(m[5].replace(/\./g, "")),
    };
    if (Object.values(votos).reduce((a, b) => a + b, 0) === 0) continue;
    resultado.set(iso, { iso, votos });
  }
  return [...resultado.values()];
}
