/**
 * Levantamento provisório de boletins de urna (BU) do exterior, transcrito da
 * cobertura do g1 de 04/10/2026. NÃO é dado oficial do TSE: serve apenas
 * enquanto o TSE não divulga a totalização do exterior e deixa de ser usado
 * assim que o consolidado oficial do país tiver votos apurados.
 */

export const FONTE_PROVISORIO = {
  nome: "g1 — levantamento de boletins de urna no exterior",
  url: "https://g1.globo.com/mundo/noticia/2026/10/04/resultados-eleicao-exterior-primeiro-turno-presidente-boletins-de-urna.ghtml",
  coletadoEm: "04/10/2026",
};

/** Chave = nome de urna do candidato no TSE. */
export interface PaisProvisorio {
  iso: string;
  votos: Record<string, number>;
  /** Votos que a matéria cita mas que não correspondem a nenhum candidato do TSE. */
  naoIdentificados?: number;
  /** Percentual do líder informado pelo g1, usado só para conferência. */
  lideRefPct?: number;
  parcial?: string;
  /** Aviso exibido quando os números da fonte não fecham entre si. */
  ressalva?: string;
}

/** Observações editoriais por país, aplicadas qualquer que seja a fonte que forneceu os números. */
export const OBSERVACOES_PAISES: Record<string, string> = {
  JP: "Os veículos divergem: o g1 informa Lula com 5.222 votos, outras matérias citam 5.234 e uma delas, 'dados atualizados', 25.109 para Flávio e 5.567 para Lula. A contagem pode ainda estar em atualização.",
};

export const PROVISORIO: PaisProvisorio[] = [
  {
    iso: "AE",
    ressalva: "A soma dos votos listados pelo g1 não fecha com os percentuais que ele próprio publica; os valores podem estar incompletos.",
    lideRefPct: 48.92,
    votos: {
      "FLAVIO BOLSONARO": 659, LULA: 469, "RENAN SANTOS": 64, "ESCRITOR AUGUSTO CURY": 56,
      ZEMA: 27, "RONALDO CAIADO": 26, "HERTZ DIAS": 3, "CLARIANA BARAO": 3,
      "EDMILSON COSTA": 2, "RUI COSTA PIMENTA": 2, "VETERINÁRIO WILSON GRASSI": 1,
    },
  },
  {
    iso: "AU",
    ressalva: "A soma dos votos listados pelo g1 não fecha com os percentuais que ele próprio publica; os valores podem estar incompletos.",
    lideRefPct: 53.98,
    votos: {
      LULA: 4562, "FLAVIO BOLSONARO": 2579, "RENAN SANTOS": 316, "ESCRITOR AUGUSTO CURY": 329,
      ZEMA: 132, "RONALDO CAIADO": 124, SAMARA: 30, "HERTZ DIAS": 14, "CLARIANA BARAO": 21,
      "RUI COSTA PIMENTA": 6, "VETERINÁRIO WILSON GRASSI": 6, "EDMILSON COSTA": 10,
    },
    naoIdentificados: 1,
  },
  {
    iso: "CN",
    lideRefPct: 56.63,
    votos: {
      LULA: 367, "FLAVIO BOLSONARO": 203, "RENAN SANTOS": 28, "ESCRITOR AUGUSTO CURY": 21,
      "RONALDO CAIADO": 13, ZEMA: 9, SAMARA: 2, "RUI COSTA PIMENTA": 2,
      "CLARIANA BARAO": 1, "HERTZ DIAS": 1,
    },
    naoIdentificados: 1,
  },
  {
    iso: "KR",
    lideRefPct: 56.94,
    votos: {
      LULA: 123, "FLAVIO BOLSONARO": 72, "RENAN SANTOS": 6, "RONALDO CAIADO": 6,
      "ESCRITOR AUGUSTO CURY": 6, "RUI COSTA PIMENTA": 1, ZEMA: 1, SAMARA: 1,
    },
  },
  {
    iso: "PH",
    lideRefPct: 53.23,
    votos: { "FLAVIO BOLSONARO": 33, LULA: 26, "RENAN SANTOS": 2, "RONALDO CAIADO": 1 },
  },
  {
    iso: "IN",
    parcial: "1 de 2 seções apuradas",
    votos: { "FLAVIO BOLSONARO": 26, LULA: 24 },
  },
  {
    iso: "MY",
    ressalva: "A soma dos votos listados pelo g1 não fecha com os percentuais que ele próprio publica; os valores podem estar incompletos.",
    lideRefPct: 53.66,
    votos: {
      LULA: 44, "FLAVIO BOLSONARO": 27, "RENAN SANTOS": 7, "ESCRITOR AUGUSTO CURY": 3,
      ZEMA: 1, "RONALDO CAIADO": 1,
    },
  },
  {
    iso: "NZ",
    lideRefPct: 70.48,
    votos: {
      LULA: 234, "FLAVIO BOLSONARO": 64, "RENAN SANTOS": 13, ZEMA: 7,
      "ESCRITOR AUGUSTO CURY": 6, "RONALDO CAIADO": 5, SAMARA: 2, "HERTZ DIAS": 1,
    },
  },
  {
    iso: "SG",
    lideRefPct: 54.6,
    votos: {
      LULA: 190, "FLAVIO BOLSONARO": 92, "RENAN SANTOS": 22, "ESCRITOR AUGUSTO CURY": 21,
      ZEMA: 12, "RONALDO CAIADO": 6, "RUI COSTA PIMENTA": 2, SAMARA: 2, "CLARIANA BARAO": 1,
    },
  },
  {
    iso: "TH",
    ressalva: "A soma dos votos listados pelo g1 não fecha com os percentuais que ele próprio publica; os valores podem estar incompletos.",
    lideRefPct: 50,
    votos: {
      "FLAVIO BOLSONARO": 51, LULA: 40, "RENAN SANTOS": 3, "ESCRITOR AUGUSTO CURY": 3,
      ZEMA: 1, SAMARA: 1,
    },
  },
  {
    iso: "TW",
    lideRefPct: 48.86,
    votos: {
      "FLAVIO BOLSONARO": 107, LULA: 77, "RENAN SANTOS": 14, "ESCRITOR AUGUSTO CURY": 6,
      "CLARIANA BARAO": 4, ZEMA: 4, "HERTZ DIAS": 2, "RONALDO CAIADO": 2,
      "EDMILSON COSTA": 1, SAMARA: 1,
    },
    naoIdentificados: 1,
  },
  {
    iso: "JP",
    lideRefPct: 71.59,
    votos: {
      "FLAVIO BOLSONARO": 24601, LULA: 5222, "ESCRITOR AUGUSTO CURY": 1555, "RENAN SANTOS": 1195,
      "RONALDO CAIADO": 595, ZEMA: 367, "CLARIANA BARAO": 307, SAMARA: 164,
      "EDMILSON COSTA": 131, "VETERINÁRIO WILSON GRASSI": 92, "HERTZ DIAS": 59,
      "RUI COSTA PIMENTA": 35,
    },
    naoIdentificados: 40,
  },
];
