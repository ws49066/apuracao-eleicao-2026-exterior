import { LOCALIDADES, localidadePorCodigo, paisPorIso, type Localidade } from "./locais";
import type { Turno } from "./tse/config";
import { buscarResultadoExterior, buscarResultadoLocalidade } from "./tse/client";
import { obterLevantamento, type Levantamento } from "./fontes";
import { aplicarProvisorio } from "./provisorio";
import { agregar, normalizar, type Apuracao, type Escopo } from "./tse/normalize";

export type FiltroEscopo =
  | { tipo: "exterior" }
  | { tipo: "pais"; iso: string }
  | { tipo: "cidade"; codigo: string };

/** O CDN do TSE é tolerante, mas 186 requisições simultâneas não são educadas. */
const CONCORRENCIA = 12;

async function emLotes<T, R>(itens: T[], tarefa: (item: T) => Promise<R>): Promise<R[]> {
  const resultados: R[] = [];
  for (let i = 0; i < itens.length; i += CONCORRENCIA) {
    const lote = await Promise.allSettled(itens.slice(i, i + CONCORRENCIA).map(tarefa));
    for (const r of lote) if (r.status === "fulfilled") resultados.push(r.value);
  }
  return resultados;
}

async function apuracaoDaLocalidade(local: Localidade, turno: Turno): Promise<Apuracao> {
  const bruto = await buscarResultadoLocalidade(turno, local.codigo);
  return normalizar(bruto, {
    tipo: "cidade",
    id: local.codigo,
    nome: `${local.cidade} — ${local.pais}`,
    iso: local.iso,
  });
}

/** O levantamento da imprensa só serve enquanto o TSE não tem votos no exterior. */
export async function levantamentoSePreciso(turno: Turno): Promise<Levantamento | null> {
  const exterior = await buscarResultadoExterior(turno);
  return Number(exterior.v.tv.replace(/\./g, "")) > 0 ? null : obterLevantamento(turno);
}

export async function obterApuracao(filtro: FiltroEscopo, turno: Turno): Promise<Apuracao> {
  const [oficial, levantamento] = await Promise.all([
    obterApuracaoOficial(filtro, turno),
    levantamentoSePreciso(turno),
  ]);
  return aplicarProvisorio(oficial, levantamento);
}

async function obterApuracaoOficial(filtro: FiltroEscopo, turno: Turno): Promise<Apuracao> {
  if (filtro.tipo === "exterior") {
    const escopo: Escopo = { tipo: "exterior", id: "zz", nome: "Exterior", iso: null };
    return normalizar(await buscarResultadoExterior(turno), escopo);
  }

  if (filtro.tipo === "cidade") {
    const local = localidadePorCodigo(filtro.codigo);
    if (!local) throw new Error(`Localidade ${filtro.codigo} não encontrada`);
    return apuracaoDaLocalidade(local, turno);
  }

  const pais = paisPorIso(filtro.iso);
  if (!pais) throw new Error(`País ${filtro.iso} não encontrado`);

  const partes = await emLotes(pais.localidades, (local) => apuracaoDaLocalidade(local, turno));
  if (partes.length === 0) throw new Error(`Sem dados do TSE para ${pais.nome}`);

  return agregar(partes, {
    tipo: "pais",
    id: pais.iso,
    nome: pais.nome,
    iso: pais.iso,
  });
}

export interface LinhaPais {
  iso: string;
  nome: string;
  continente: string;
  cidades: number;
  eleitorado: number;
  comparecimento: number;
  votosValidos: number;
  secoesTotalizadas: number;
  secoesTotal: number;
  lider: { nomeUrna: string; partido: string; votos: number; percentual: number } | null;
  provisorio: boolean;
}

/**
 * Consolida as 186 cidades do exterior em um ranking por país. É a chamada mais
 * cara da aplicação, por isso vive atrás de cache no route handler.
 */
async function consolidarPaises(levantamento: Levantamento | null, turno: Turno) {
  const apuracoes = await emLotes(LOCALIDADES, async (local) => ({
    local,
    apuracao: await apuracaoDaLocalidade(local, turno),
  }));

  const porPais = new Map<string, { local: Localidade; apuracao: Apuracao }[]>();
  for (const item of apuracoes) {
    const lista = porPais.get(item.local.iso);
    if (lista) lista.push(item);
    else porPais.set(item.local.iso, [item]);
  }

  const consolidados: { iso: string; cidades: number; total: Apuracao }[] = [];
  for (const [iso, itens] of porPais) {
    const pais = paisPorIso(iso);
    if (!pais) continue;
    const total = aplicarProvisorio(
      agregar(
        itens.map((i) => i.apuracao),
        { tipo: "pais", id: iso, nome: pais.nome, iso },
      ),
      levantamento,
    );
    consolidados.push({ iso, cidades: itens.length, total });
  }
  return consolidados;
}

export async function obterRankingPaises(turno: Turno): Promise<LinhaPais[]> {
  const linhas: LinhaPais[] = [];
  for (const { iso, cidades, total } of await consolidarPaises(await levantamentoSePreciso(turno), turno)) {
    const pais = paisPorIso(iso)!;
    const lider = total.candidatos[0];

    linhas.push({
      iso,
      nome: pais.nome,
      continente: pais.continente,
      cidades,
      eleitorado: total.eleitorado.apto,
      comparecimento: total.eleitorado.comparecimento,
      votosValidos: total.votos.validos,
      secoesTotalizadas: total.secoes.totalizadas,
      secoesTotal: total.secoes.total,
      provisorio: !!total.provisorio,
      lider:
        lider && lider.votos > 0
          ? {
              nomeUrna: lider.nomeUrna,
              partido: lider.partido,
              votos: lider.votos,
              percentual: lider.percentual,
            }
          : null,
    });
  }

  return linhas.sort((a, b) => b.eleitorado - a.eleitorado || a.nome.localeCompare(b.nome, "pt-BR"));
}

export interface PaisMapa {
  iso: string;
  nome: string;
  lula: number;
  flavio: number;
  provisorio: boolean;
}

export interface DadosMapa {
  fonte: "oficial" | "provisorio";
  paises: PaisMapa[];
}

const NOME_LULA = "LULA";
const NOME_FLAVIO = "FLAVIO BOLSONARO";

/**
 * Votos de Lula e Flávio por país. Enquanto o TSE não apurou nada no exterior, sai direto do
 * levantamento da imprensa (barato); depois passa a consolidar as 186 cidades do TSE.
 */
export async function obterDadosMapa(turno: Turno): Promise<DadosMapa> {
  const levantamento = await levantamentoSePreciso(turno);

  if (levantamento) {
    return {
      fonte: "provisorio",
      paises: levantamento.paises.map((p) => ({
        iso: p.iso,
        nome: paisPorIso(p.iso)?.nome ?? p.iso,
        lula: p.votos[NOME_LULA] ?? 0,
        flavio: p.votos[NOME_FLAVIO] ?? 0,
        provisorio: true,
      })),
    };
  }

  const consolidados = await consolidarPaises(null, turno);
  return {
    fonte: "oficial",
    paises: consolidados.map(({ iso, total }) => ({
      iso,
      nome: paisPorIso(iso)?.nome ?? iso,
      lula: total.candidatos.find((c) => c.nomeUrna === NOME_LULA)?.votos ?? 0,
      flavio: total.candidatos.find((c) => c.nomeUrna === NOME_FLAVIO)?.votos ?? 0,
      provisorio: !!total.provisorio,
    })),
  };
}
