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
];
