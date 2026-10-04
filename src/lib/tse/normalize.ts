import { urlFoto } from "./config";
import type { TseResultadoBruto } from "./types";

export interface Candidato {
  sqcand: string;
  numero: string;
  nome: string;
  nomeUrna: string;
  partido: string;
  partidoNome: string;
  vice: string | null;
  votos: number;
  percentual: number;
  eleito: boolean;
  foto: string;
}

export interface Escopo {
  tipo: "exterior" | "pais" | "cidade";
  id: string;
  nome: string;
  iso: string | null;
}

export interface Apuracao {
  escopo: Escopo;
  turno: string;
  atualizadoEm: string;
  secoes: { total: number; totalizadas: number; percentual: number };
  eleitorado: {
    apto: number;
    aptoTotalizadas: number;
    comparecimento: number;
    abstencao: number;
    percComparecimento: number;
    percAbstencao: number;
  };
  votos: {
    total: number;
    nominais: number;
    validos: number;
    anulados: number;
    anuladosSubJudice: number;
    brancos: number;
    nulos: number;
    percNominais: number;
    percBrancos: number;
    percNulos: number;
  };
  candidatos: Candidato[];
}

/** Os números do TSE vêm em pt-BR: "1.234" é inteiro e "12,34" é decimal. */
function num(valor: string | undefined): number {
  if (!valor) return 0;
  const n = Number(valor.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function pct(parte: number, total: number): number {
  return total > 0 ? (parte / total) * 100 : 0;
}

export function normalizar(bruto: TseResultadoBruto, escopo: Escopo): Apuracao {
  const cargo = bruto.carg[0];
  const votosValidos = num(bruto.v.vv);

  const candidatos: Candidato[] = [];
  for (const agremiacao of cargo?.agr ?? []) {
    for (const partido of agremiacao.par) {
      for (const c of partido.cand) {
        const votos = num(c.vap);
        candidatos.push({
          sqcand: c.sqcand,
          numero: c.n,
          nome: c.nm,
          nomeUrna: c.nmu || c.nm,
          partido: partido.sg,
          partidoNome: partido.nm,
          vice: c.vs?.find((v) => v.tp === "v")?.nmu ?? null,
          votos,
          percentual: pct(votos, votosValidos),
          eleito: c.e === "s",
          foto: urlFoto(c.sqcand),
        });
      }
    }
  }
  candidatos.sort((a, b) => b.votos - a.votos || Number(a.numero) - Number(b.numero));

  const totalVotos = num(bruto.v.tv);
  const aptoTotalizadas = num(bruto.e.est);
  const comparecimento = num(bruto.e.c);

  return {
    escopo,
    turno: bruto.t,
    atualizadoEm: `${bruto.dg} ${bruto.hg}`,
    secoes: {
      total: num(bruto.s.ts),
      totalizadas: num(bruto.s.st),
      percentual: pct(num(bruto.s.st), num(bruto.s.ts)),
    },
    eleitorado: {
      apto: num(bruto.e.te),
      aptoTotalizadas,
      comparecimento,
      abstencao: num(bruto.e.a),
      percComparecimento: pct(comparecimento, aptoTotalizadas),
      percAbstencao: pct(num(bruto.e.a), aptoTotalizadas),
    },
    votos: {
      total: totalVotos,
      nominais: num(bruto.v.vnom),
      validos: votosValidos,
      anulados: num(bruto.v.van),
      anuladosSubJudice: num(bruto.v.vansj),
      brancos: num(bruto.v.vb),
      nulos: num(bruto.v.vn),
      percNominais: pct(num(bruto.v.vnom), totalVotos),
      percBrancos: pct(num(bruto.v.vb), totalVotos),
      percNulos: pct(num(bruto.v.vn), totalVotos),
    },
    candidatos,
  };
}

/** Soma várias apurações — usado para consolidar as cidades de um país. */
export function agregar(partes: Apuracao[], escopo: Escopo): Apuracao {
  if (partes.length === 1) return { ...partes[0], escopo };

  const soma = (ler: (a: Apuracao) => number) => partes.reduce((t, a) => t + ler(a), 0);

  const totalVotos = soma((a) => a.votos.total);
  const validos = soma((a) => a.votos.validos);
  const nominais = soma((a) => a.votos.nominais);
  const brancos = soma((a) => a.votos.brancos);
  const nulos = soma((a) => a.votos.nulos);
  const secoesTotal = soma((a) => a.secoes.total);
  const secoesTotalizadas = soma((a) => a.secoes.totalizadas);
  const aptoTotalizadas = soma((a) => a.eleitorado.aptoTotalizadas);
  const comparecimento = soma((a) => a.eleitorado.comparecimento);
  const abstencao = soma((a) => a.eleitorado.abstencao);

  const porCandidato = new Map<string, Candidato>();
  for (const parte of partes) {
    for (const c of parte.candidatos) {
      const atual = porCandidato.get(c.sqcand);
      if (atual) atual.votos += c.votos;
      else porCandidato.set(c.sqcand, { ...c });
    }
  }

  const candidatos = [...porCandidato.values()]
    .map((c) => ({ ...c, percentual: pct(c.votos, validos) }))
    .sort((a, b) => b.votos - a.votos || Number(a.numero) - Number(b.numero));

  return {
    escopo,
    turno: partes[0]?.turno ?? "1",
    atualizadoEm: partes[0]?.atualizadoEm ?? "",
    secoes: {
      total: secoesTotal,
      totalizadas: secoesTotalizadas,
      percentual: pct(secoesTotalizadas, secoesTotal),
    },
    eleitorado: {
      apto: soma((a) => a.eleitorado.apto),
      aptoTotalizadas,
      comparecimento,
      abstencao,
      percComparecimento: pct(comparecimento, aptoTotalizadas),
      percAbstencao: pct(abstencao, aptoTotalizadas),
    },
    votos: {
      total: totalVotos,
      nominais,
      validos,
      anulados: soma((a) => a.votos.anulados),
      anuladosSubJudice: soma((a) => a.votos.anuladosSubJudice),
      brancos,
      nulos,
      percNominais: pct(nominais, totalVotos),
      percBrancos: pct(brancos, totalVotos),
      percNulos: pct(nulos, totalVotos),
    },
    candidatos,
  };
}
