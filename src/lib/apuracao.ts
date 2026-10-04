import { LOCALIDADES, localidadePorCodigo, paisPorIso, type Localidade } from "./locais";
import { buscarResultadoExterior, buscarResultadoLocalidade } from "./tse/client";
import { obterLevantamento } from "./fontes";
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

async function apuracaoDaLocalidade(local: Localidade): Promise<Apuracao> {
  const bruto = await buscarResultadoLocalidade(local.codigo);
  return normalizar(bruto, {
    tipo: "cidade",
    id: local.codigo,
    nome: `${local.cidade} — ${local.pais}`,
    iso: local.iso,
  });
}

export async function obterApuracao(filtro: FiltroEscopo): Promise<Apuracao> {
  const [oficial, levantamento] = await Promise.all([obterApuracaoOficial(filtro), obterLevantamento()]);
  return aplicarProvisorio(oficial, levantamento);
}

async function obterApuracaoOficial(filtro: FiltroEscopo): Promise<Apuracao> {
  if (filtro.tipo === "exterior") {
    const escopo: Escopo = { tipo: "exterior", id: "zz", nome: "Exterior", iso: null };
    return normalizar(await buscarResultadoExterior(), escopo);
  }

  if (filtro.tipo === "cidade") {
    const local = localidadePorCodigo(filtro.codigo);
    if (!local) throw new Error(`Localidade ${filtro.codigo} não encontrada`);
    return apuracaoDaLocalidade(local);
  }

  const pais = paisPorIso(filtro.iso);
  if (!pais) throw new Error(`País ${filtro.iso} não encontrado`);

  const partes = await emLotes(pais.localidades, apuracaoDaLocalidade);
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
export async function obterRankingPaises(): Promise<LinhaPais[]> {
  const levantamento = await obterLevantamento();
  const apuracoes = await emLotes(LOCALIDADES, async (local) => ({
    local,
    apuracao: await apuracaoDaLocalidade(local),
  }));

  const porPais = new Map<string, { local: Localidade; apuracao: Apuracao }[]>();
  for (const item of apuracoes) {
    const lista = porPais.get(item.local.iso);
    if (lista) lista.push(item);
    else porPais.set(item.local.iso, [item]);
  }

  const linhas: LinhaPais[] = [];
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
    const lider = total.candidatos[0];

    linhas.push({
      iso,
      nome: pais.nome,
      continente: pais.continente,
      cidades: itens.length,
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
