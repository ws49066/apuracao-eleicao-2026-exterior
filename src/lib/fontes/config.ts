export interface FonteConfig {
  id: string;
  nome: string;
  url: string;
  /** "principal" é lida e entra nos números; "conferencia" só confirma ou contesta. */
  papel: "principal" | "conferencia";
}

export const FONTES: FonteConfig[] = [
  {
    id: "g1",
    nome: "g1",
    papel: "principal",
    url: "https://g1.globo.com/mundo/noticia/2026/10/04/resultados-eleicao-exterior-primeiro-turno-presidente-boletins-de-urna.ghtml",
  },
  {
    id: "transmissao-1",
    nome: "Transmissão Política (1)",
    papel: "conferencia",
    url: "https://transmissaopolitica.com.br/politica-nacional/2026/10/04/resultados-exterior-lula-flavio/",
  },
  {
    id: "transmissao-2",
    nome: "Transmissão Política (2)",
    papel: "conferencia",
    url: "https://transmissaopolitica.com.br/politica-internacional/2026/10/04/resultados-eleicoes-2026-exterior/",
  },
  {
    id: "nd-mais",
    nome: "ND Mais",
    papel: "conferencia",
    url: "https://ndmais.com.br/politica/resultado-das-urnas-no-exterior/",
  },
  {
    id: "lupa1",
    nome: "Lupa1",
    papel: "conferencia",
    url: "https://lupa1.com.br/noticias/politica/veja-os-primeiros-resultados-da-votacao-de-brasileiros-no-exterior-76566.html",
  },
  {
    id: "fala-genefax",
    nome: "Fala Genefax",
    papel: "conferencia",
    url: "https://falagenefax.com/2026/10/04/votacao-presidente-exterior-eleicoes-2026/",
  },
  {
    id: "nc-news",
    nome: "NC News",
    papel: "conferencia",
    url: "https://ncnews.com.br/2026/10/04/resultados-eleicao-exterior-2026-presidente/",
  },
  {
    id: "exame",
    nome: "Exame",
    papel: "conferencia",
    url: "https://exame.com/brasil/votacao-para-presidente-no-exterior-veja-quem-venceu-no-japao-china-e-nova-zelandia/",
  },
  {
    id: "tn-sul",
    nome: "TN Sul",
    papel: "conferencia",
    url: "https://tnsul.com/2026/10/04/eleicoes-2026-votacao-no-exterior-comeca-a-revelar-primeiros-resultados/",
  },
  {
    id: "poder360",
    nome: "Poder360",
    papel: "conferencia",
    url: "https://www.poder360.com.br/poder-eleicoes-2026/eleicoes-2026-exterior-resultados/",
  },
  {
    id: "uol",
    nome: "UOL",
    papel: "conferencia",
    url: "https://noticias.uol.com.br/eleicoes/2026/10/04/apuracao-dos-votos-para-presidente-no-exterior-veja-parcial-dos-votos-pelo-mundo.ghtml",
  },
];
