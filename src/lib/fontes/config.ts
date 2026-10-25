export interface FonteConfig {
  id: string;
  nome: string;
  url: string;
  /** "principal" é lida e entra nos números; "conferencia" só confirma ou contesta. */
  papel: "principal" | "conferencia";
  turno: "1" | "2";
  /** Como a matéria organiza os números. Sem formato, a fonte só confere os números das outras. */
  formato?: "g1" | "lista" | "prosa";
}

export const FONTES: FonteConfig[] = [
  {
    id: "g1",
    nome: "g1",
    papel: "principal",
    turno: "1",
    formato: "g1",
    url: "https://g1.globo.com/mundo/noticia/2026/10/04/resultados-eleicao-exterior-primeiro-turno-presidente-boletins-de-urna.ghtml",
  },
  {
    id: "transmissao-1",
    nome: "Transmissão Política (1)",
    papel: "conferencia",
    turno: "1",
    url: "https://transmissaopolitica.com.br/politica-nacional/2026/10/04/resultados-exterior-lula-flavio/",
  },
  {
    id: "transmissao-2",
    nome: "Transmissão Política (2)",
    papel: "conferencia",
    turno: "1",
    url: "https://transmissaopolitica.com.br/politica-internacional/2026/10/04/resultados-eleicoes-2026-exterior/",
  },
  {
    id: "nd-mais",
    nome: "ND Mais",
    papel: "conferencia",
    turno: "1",
    url: "https://ndmais.com.br/politica/resultado-das-urnas-no-exterior/",
  },
  {
    id: "lupa1",
    nome: "Lupa1",
    papel: "conferencia",
    turno: "1",
    url: "https://lupa1.com.br/noticias/politica/veja-os-primeiros-resultados-da-votacao-de-brasileiros-no-exterior-76566.html",
  },
  {
    id: "fala-genefax",
    nome: "Fala Genefax",
    papel: "conferencia",
    turno: "1",
    url: "https://falagenefax.com/2026/10/04/votacao-presidente-exterior-eleicoes-2026/",
  },
  {
    id: "nc-news",
    nome: "NC News",
    papel: "conferencia",
    turno: "1",
    url: "https://ncnews.com.br/2026/10/04/resultados-eleicao-exterior-2026-presidente/",
  },
  {
    id: "exame",
    nome: "Exame",
    papel: "conferencia",
    turno: "1",
    url: "https://exame.com/brasil/votacao-para-presidente-no-exterior-veja-quem-venceu-no-japao-china-e-nova-zelandia/",
  },
  {
    id: "tn-sul",
    nome: "TN Sul",
    papel: "conferencia",
    turno: "1",
    url: "https://tnsul.com/2026/10/04/eleicoes-2026-votacao-no-exterior-comeca-a-revelar-primeiros-resultados/",
  },
  {
    id: "poder360",
    nome: "Poder360",
    papel: "conferencia",
    turno: "1",
    url: "https://www.poder360.com.br/poder-eleicoes-2026/eleicoes-2026-exterior-resultados/",
  },
  {
    id: "uol",
    nome: "UOL",
    papel: "conferencia",
    turno: "1",
    url: "https://noticias.uol.com.br/eleicoes/2026/10/04/apuracao-dos-votos-para-presidente-no-exterior-veja-parcial-dos-votos-pelo-mundo.ghtml",
  },
  {
    id: "cnn-t2",
    nome: "CNN Brasil",
    papel: "principal",
    turno: "2",
    formato: "lista",
    url: "https://www.cnnbrasil.com.br/internacional/eleicoes-2026-exterior-boletins-urna-flavio-lula/",
  },
  {
    id: "ultimas-noticias-t2",
    nome: "Últimas Notícias",
    papel: "principal",
    turno: "2",
    formato: "lista",
    url: "https://ultimasnoticias.inf.br/noticia/eleicoes-2026-veja-os-resultados-dos-paises-que-ja-encerraram-a-votacao/",
  },
  {
    id: "folha-bv-t2",
    nome: "Folha BV",
    papel: "principal",
    turno: "2",
    formato: "prosa",
    url: "https://www.folhabv.com.br/politica/urnas-no-exterior-apontam-vantagem-de-lula-sobre-flavio-bolsonaro-nas-primeiras-apuracoes/",
  },
  {
    id: "portal-gerais-t2",
    nome: "Portal Gerais",
    papel: "principal",
    turno: "2",
    formato: "prosa",
    url: "https://portalgerais.com/lula-vence-na-nova-zelandia-china-e-coreia-do-sul-flavio-ganha-no-japao",
  },
];
