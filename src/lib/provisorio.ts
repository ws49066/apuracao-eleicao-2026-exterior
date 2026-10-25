import type { Levantamento, PaisLevantado } from "./fontes";
import { PAISES, paisPorIso } from "./locais";
import type { Apuracao, Candidato } from "./tse/normalize";

function semCobertura(partes: PaisLevantado[]): string {
  const cobertos = new Set(partes.map((p) => p.iso));
  const continentes = [...new Set(partes.map((p) => paisPorIso(p.iso)?.continente))].join(", ");
  const faltam = ["US", "PT"].filter((iso) => !cobertos.has(iso)).map((iso) => paisPorIso(iso)?.nome);
  const europa = partes.some((p) => paisPorIso(p.iso)?.continente === "Europa");
  const ausentes = [...faltam, ...(europa ? [] : ["Europa"])];
  return `Cobertura de: ${continentes}.${
    ausentes.length ? ` Ainda sem ${ausentes.join(", ")}, então estes percentuais não representam o exterior inteiro.` : ""
  }`;
}

function somar(partes: PaisLevantado[]) {
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
export function aplicarProvisorio(base: Apuracao, lev: Levantamento): Apuracao {
  if (base.votos.total > 0 || base.escopo.tipo === "cidade") return base;

  const partes =
    base.escopo.tipo === "pais"
      ? lev.paises.filter((p) => p.iso === base.escopo.id)
      : lev.paises;
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
      semCobertura(partes),
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
      versao: lev.versao,
      paisesCobertos: partes.length,
      avisos,
    },
  };
}
