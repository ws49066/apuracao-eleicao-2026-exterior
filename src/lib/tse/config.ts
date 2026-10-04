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

export const TSE = {
  base: process.env.TSE_BASE ?? "https://resultados.tse.jus.br",
  ambiente: process.env.TSE_AMBIENTE ?? "oficial",
  ciclo: process.env.TSE_CICLO ?? "ele2026",
  /**
   * Eleição Ordinária Federal 2026 — 1º turno (04/10/2026).
   * Para o 2º turno basta publicar com TSE_ELEICAO=6258 e TSE_TURNO=2.
   */
  eleicao: process.env.TSE_ELEICAO ?? "6257",
  turno: process.env.TSE_TURNO ?? "1",
  /** Único cargo votado no exterior. */
  cargo: "0001",
  uf: "zz",
} as const;

/** O código da eleição aparece com 6 dígitos no nome dos arquivos. */
const eleicaoArquivo = () => TSE.eleicao.padStart(6, "0");

const raiz = () =>
  `${TSE.base}/${TSE.ambiente}/${TSE.ciclo}/${TSE.eleicao}`;

/** Resultado consolidado de todo o exterior. */
export const urlExterior = () =>
  `${raiz()}/dados/${TSE.uf}/${TSE.uf}-c${TSE.cargo}-e${eleicaoArquivo()}-u.json`;

/** Resultado de uma cidade do exterior (código de "município" do TSE). */
export const urlLocalidade = (codigo: string) =>
  `${raiz()}/dados/${TSE.uf}/${TSE.uf}${codigo}-c${TSE.cargo}-e${eleicaoArquivo()}-u.json`;

/** Arquivo de configuração com todas as localidades de cada UF. */
export const urlConfigMunicipios = () =>
  `${raiz()}/config/mun-e${eleicaoArquivo()}-cm.json`;

/** Foto oficial do candidato. Presidente fica sempre sob a abrangência "br". */
export const urlFoto = (sqcand: string) =>
  `${raiz()}/fotos/br/${sqcand}.jpeg`;
