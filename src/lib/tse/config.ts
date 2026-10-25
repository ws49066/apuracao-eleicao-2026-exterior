/**
 * Endpoints públicos de divulgação de resultados do TSE.
 *
 * Layout dos arquivos (conforme "Informações técnicas sobre a divulgação de
 * resultados" do TSE):
 *   <base>/<ambiente>/<ciclo>/<cd_eleicao>/dados/<uf>/<uf>-c<cargo>-e<eleicao>-u.json
 *   <base>/<ambiente>/<ciclo>/<cd_eleicao>/dados/<uf>/<uf><municipio>-c<cargo>-e<eleicao>-u.json
 *   <base>/<ambiente>/<ciclo>/<cd_eleicao>/config/mun-e<eleicao>-cm.json
 *   <base>/<ambiente>/<ciclo>/<cd_eleicao>/fotos/<uf>/<sqcand>.jpeg
 *
 * O exterior é tratado pelo TSE como a UF "zz", e cada cidade com seção
 * eleitoral no exterior é um "município" dessa UF.
 */

export type Turno = "1" | "2";

/** Eleição Ordinária Federal 2026: 1º turno em 04/10 (6257) e 2º turno em 25/10 (6258). */
export const ELEICOES: Record<Turno, string> = {
  "1": process.env.TSE_ELEICAO_1 ?? "6257",
  "2": process.env.TSE_ELEICAO_2 ?? "6258",
};

/** Turno exibido quando o visitante não escolhe nenhum. */
export const TURNO_PADRAO: Turno = process.env.TSE_TURNO === "1" ? "1" : "2";

export const turnoValido = (valor?: string | null): Turno =>
  valor === "1" || valor === "2" ? valor : TURNO_PADRAO;

export const TSE = {
  base: process.env.TSE_BASE ?? "https://resultados.tse.jus.br",
  ambiente: process.env.TSE_AMBIENTE ?? "oficial",
  ciclo: process.env.TSE_CICLO ?? "ele2026",
  /** Único cargo votado no exterior. */
  cargo: "0001",
  uf: "zz",
} as const;

/** O código da eleição aparece com 6 dígitos no nome dos arquivos. */
const eleicaoArquivo = (turno: Turno) => ELEICOES[turno].padStart(6, "0");

const raiz = (turno: Turno) =>
  `${TSE.base}/${TSE.ambiente}/${TSE.ciclo}/${ELEICOES[turno]}`;

/** Resultado consolidado de todo o exterior. */
export const urlExterior = (turno: Turno) =>
  `${raiz(turno)}/dados/${TSE.uf}/${TSE.uf}-c${TSE.cargo}-e${eleicaoArquivo(turno)}-u.json`;

/** Resultado de uma cidade do exterior (código de "município" do TSE). */
export const urlLocalidade = (turno: Turno, codigo: string) =>
  `${raiz(turno)}/dados/${TSE.uf}/${TSE.uf}${codigo}-c${TSE.cargo}-e${eleicaoArquivo(turno)}-u.json`;

/** Arquivo de configuração com todas as localidades de cada UF. */
export const urlConfigMunicipios = (turno: Turno) =>
  `${raiz(turno)}/config/mun-e${eleicaoArquivo(turno)}-cm.json`;

/** Foto oficial do candidato. O 1º turno tem os 12 candidatos, então serve para os dois. */
export const urlFoto = (sqcand: string) => `${raiz("1")}/fotos/br/${sqcand}.jpeg`;
