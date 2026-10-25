import { createHash } from "node:crypto";
import { OBSERVACOES_PAISES, PROVISORIO, type PaisProvisorio } from "@/data/provisorio";
import { PAISES, paisPorIso } from "../locais";
import { FONTES, type FonteConfig } from "./config";
import { TSE } from "../tse/config";
import { htmlParaTexto, lerListaDuelo, lerMateriaPorPais, lerProsaDuelo, semAcento, totalVotos } from "./leitor";

export interface PaisLevantado extends PaisProvisorio {
  origem: "coleta" | "snapshot";
  /** Fonte de onde vieram os números exibidos. */
  fonte: string;
  /** Fontes de conferência cujo texto traz os mesmos números do líder e do 2º colocado. */
  confirmadoPor: string[];
}

export interface StatusFonte {
  id: string;
  nome: string;
  url: string;
  papel: FonteConfig["papel"];
  ok: boolean;
  erro?: string;
  paisesLidos?: number;
}

export interface Levantamento {
  versao: string;
  coletadoEm: string;
  paises: PaisLevantado[];
  fontes: StatusFonte[];
  resumo: { paises: number; votos: number };
}

const CABECALHOS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  "Accept-Language": "pt-BR,pt;q=0.9",
};

async function baixar(fonte: FonteConfig, tentativa = 1): Promise<string> {
  try {
    return await baixarUmaVez(fonte);
  } catch (erro) {
    if (tentativa >= 2) throw erro;
    return baixar(fonte, tentativa + 1);
  }
}

async function baixarUmaVez(fonte: FonteConfig): Promise<string> {
  const revalidate = fonte.papel === "principal" ? 60 : 300;
  const r = await fetch(fonte.url, {
    headers: CABECALHOS,
    next: { revalidate },
    signal: AbortSignal.timeout(20_000),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

function confirma(textoSemAcento: string, pais: PaisProvisorio): boolean {
  const nome = semAcento(paisPorIso(pais.iso)?.nome ?? "");
  const [primeiro, segundo] = Object.values(pais.votos).sort((a, b) => b - a);
  if (!nome || segundo === undefined) return false;
  const formatar = (n: number) => n.toLocaleString("pt-BR");
  const tem = (janela: string, n: number) =>
    new RegExp(`(?<![\\d.,])${formatar(n).replace(/\./g, "\\.")}(?![\\d])`).test(janela);

  let i = textoSemAcento.indexOf(nome);
  while (i >= 0) {
    const janela = textoSemAcento.slice(i, i + 600);
    if (tem(janela, primeiro) && tem(janela, segundo)) return true;
    i = textoSemAcento.indexOf(nome, i + nome.length);
  }
  return false;
}

interface Leitura {
  fonteId: string;
  fonte: string;
  estrutura: "lista" | "prosa";
  dado: PaisProvisorio;
}

const ROTULO: Record<string, string> = { "FLAVIO BOLSONARO": "Flávio", LULA: "Lula" };
const rotulo = (nome: string) => ROTULO[nome] ?? nome.charAt(0) + nome.slice(1).toLowerCase();

function resumoLeitura(l: Leitura): string {
  const [a, b] = Object.entries(l.dado.votos).sort((x, y) => y[1] - x[1]);
  return `${l.fonte}: ${rotulo(a[0])} ${a[1].toLocaleString("pt-BR")}${b ? ` × ${rotulo(b[0])} ${b[1].toLocaleString("pt-BR")}` : ""}`;
}

export async function obterLevantamento(): Promise<Levantamento> {
  const fontesDoTurno = FONTES.filter((f) => f.turno === TSE.turno);
  const resultados = await Promise.allSettled(fontesDoTurno.map((f) => baixar(f)));

  const fontes: StatusFonte[] = [];
  const leituras: Leitura[] = [];
  const textos: { id: string; nome: string; texto: string }[] = [];

  fontesDoTurno.forEach((fonte, i) => {
    const r = resultados[i];
    const base = { id: fonte.id, nome: fonte.nome, url: fonte.url, papel: fonte.papel };
    if (r.status === "rejected") {
      fontes.push({ ...base, ok: false, erro: r.reason instanceof Error ? r.reason.message : "falha" });
      return;
    }
    textos.push({ id: fonte.id, nome: fonte.nome, texto: semAcento(htmlParaTexto(r.value)) });
    if (!fonte.formato) {
      fontes.push({ ...base, ok: true });
      return;
    }
    const lidos =
      fonte.formato === "lista"
        ? lerListaDuelo(r.value)
        : fonte.formato === "prosa"
          ? lerProsaDuelo(r.value)
          : lerMateriaPorPais(r.value);
    for (const dado of lidos) {
      leituras.push({ fonteId: fonte.id, fonte: fonte.nome, estrutura: fonte.formato === "prosa" ? "prosa" : "lista", dado });
    }
    fontes.push({ ...base, ok: lidos.length > 0, paisesLidos: lidos.length, erro: lidos.length ? undefined : "formato não reconhecido" });
  });

  // Com dois candidatos os dois números estão na própria linha; o percentual das matérias costuma
  // ficar para trás nas atualizações, então a conferência só vale para a lista completa de candidatos.
  const fechaComRef = (d: PaisProvisorio) =>
    Object.keys(d.votos).length <= 2 ||
    d.lideRefPct === undefined ||
    Math.abs((Math.max(...Object.values(d.votos)) / totalVotos(d)) * 100 - d.lideRefPct) <= 0.3;
  const confirmacoes = (d: PaisProvisorio, exceto?: string) =>
    textos.filter((t) => t.id !== exceto && confirma(t.texto, d)).map((t) => t.nome);

  const snapshots = new Map((TSE.turno === "1" ? PROVISORIO : []).map((p) => [p.iso, p]));
  const porIso = new Map<string, Leitura[]>();
  for (const l of leituras) porIso.set(l.dado.iso, [...(porIso.get(l.dado.iso) ?? []), l]);

  const paises: PaisLevantado[] = [...new Set([...snapshots.keys(), ...porIso.keys()])].map((iso) => {
    const todas = porIso.get(iso) ?? [];
    const maiorEstruturada = Math.max(0, ...todas.filter((l) => l.estrutura === "lista").map((l) => totalVotos(l.dado)));
    // Texto corrido que traga mais de 4x o total de uma lista estruturada provavelmente pegou outro número.
    const plausiveis = todas.filter(
      (l) => l.estrutura === "lista" || maiorEstruturada === 0 || totalVotos(l.dado) <= 4 * maiorEstruturada,
    );
    const coerentes = plausiveis.filter((l) => fechaComRef(l.dado));
    const escolhida = [...(coerentes.length ? coerentes : plausiveis)].sort(
      (a, b) => totalVotos(b.dado) - totalVotos(a.dado),
    )[0];
    const salvo = snapshots.get(iso);

    let dado: PaisProvisorio;
    let origem: PaisLevantado["origem"];
    let fonte: string;
    let fonteId: string | undefined;
    let aviso: string | undefined;

    if (escolhida && !(coerentes.length === 0 && salvo && fechaComRef(salvo))) {
      ({ dado, fonte, fonteId } = escolhida);
      origem = "coleta";
    } else {
      dado = salvo!;
      origem = "snapshot";
      fonte = "cópia salva";
      if (escolhida) {
        aviso =
          "A matéria atual traz números inconsistentes para este país; mantidos os anteriores, que fecham com o percentual publicado.";
      }
    }

    const divergencia =
      origem === "coleta" && plausiveis.length > 1 && new Set(plausiveis.map((l) => totalVotos(l.dado))).size > 1
        ? `Fontes divergem (${plausiveis.map(resumoLeitura).join("; ")}); exibida a leitura com mais votos, de ${fonte}.`
        : undefined;

    const ressalva =
      [
        !fechaComRef(dado) &&
          "A soma dos votos listados não fecha com os percentuais publicados pela própria fonte; os valores podem estar incompletos.",
        aviso,
        divergencia,
        TSE.turno === "1" ? OBSERVACOES_PAISES[iso] : undefined,
        dado.ressalva,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return { ...dado, ressalva, origem, fonte, confirmadoPor: confirmacoes(dado, fonteId) };
  });
  paises.sort((a, b) => (paisPorIso(a.iso)?.nome ?? "").localeCompare(paisPorIso(b.iso)?.nome ?? "", "pt-BR"));

  const resumo = { paises: paises.length, votos: paises.reduce((t, p) => t + totalVotos(p), 0) };
  const versao = createHash("sha1")
    .update(JSON.stringify(paises.map((p) => [p.iso, p.votos, p.naoIdentificados ?? 0])))
    .digest("hex")
    .slice(0, 12);

  return { versao, coletadoEm: new Date().toISOString(), paises, fontes, resumo };
}

export const TOTAL_PAISES = PAISES.length;
