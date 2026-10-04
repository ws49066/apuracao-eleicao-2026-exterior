import { FONTE_PROVISORIO, PROVISORIO, type PaisProvisorio } from "@/data/provisorio";
import { PAISES, paisPorIso } from "./locais";
import type { Apuracao, Candidato } from "./tse/normalize";

const POR_ISO = new Map(PROVISORIO.map((p) => [p.iso, p]));

export const paisProvisorio = (iso: string) => POR_ISO.get(iso);

function somar(partes: PaisProvisorio[]) {
  const votos = new Map<string, number>();
  let naoIdentificados = 0;
  for (const p of partes) {
    naoIdentificados += p.naoIdentificados ?? 0;
    for (const [nome, v] of Object.entries(p.votos)) votos.set(nome, (votos.get(nome) ?? 0) + v);
  }
  return { votos, naoIdentificados };
}

/**
 * Substitui os votos zerados do TSE pelo levantamento provisório. Só age
 * enquanto o TSE ainda não apurou nada no escopo: com dado oficial, ele vence.
 */
export function aplicarProvisorio(base: Apuracao): Apuracao {
  if (base.votos.total > 0 || base.escopo.tipo === "cidade") return base;

  const partes =
    base.escopo.tipo === "pais"
      ? [POR_ISO.get(base.escopo.id)].filter((p): p is PaisProvisorio => !!p)
      : PROVISORIO;
  if (partes.length === 0) return base;

  const { votos, naoIdentificados } = somar(partes);
  const total = [...votos.values()].reduce((a, b) => a + b, 0) + naoIdentificados;
  if (total === 0) return base;

  const candidatos: Candidato[] = base.candidatos
    .map((c) => {
      const v = votos.get(c.nomeUrna) ?? 0;
      return { ...c, votos: v, percentual: (v / total) * 100 };
    })
    .sort((a, b) => b.votos - a.votos || Number(a.numero) - Number(b.numero));

  const avisos: string[] = [];
  if (base.escopo.tipo === "exterior") {
    avisos.push(
      `Levantamento parcial: ${partes.length} de ${PAISES.length} países. Os demais ainda não tiveram boletins divulgados.`,
      `Cobertura apenas de: ${[...new Set(partes.map((p) => paisPorIso(p.iso)?.continente))].join(", ")}. Estados Unidos, Portugal e Europa ainda não entraram, então estes percentuais não representam o exterior inteiro.`,
    );
  }
  for (const p of partes) {
    const nome = paisPorIso(p.iso)?.nome ?? p.iso;
    if (p.parcial) avisos.push(`${nome}: ${p.parcial}.`);
    if (p.ressalva) avisos.push(`${nome}: ${p.ressalva}`);
  }

  return {
    ...base,
    votos: { ...base.votos, total, nominais: total, validos: total, percNominais: 100 },
    candidatos,
    provisorio: {
      fonte: FONTE_PROVISORIO.nome,
      url: FONTE_PROVISORIO.url,
      paisesCobertos: partes.length,
      avisos,
    },
  };
}
