import { createHash } from "node:crypto";
import { OBSERVACOES_PAISES, PROVISORIO, type PaisProvisorio } from "@/data/provisorio";
import { PAISES, paisPorIso } from "../locais";
import { FONTES, type FonteConfig } from "./config";
import { htmlParaTexto, lerMateriaPorPais, semAcento, totalVotos } from "./leitor";

export interface PaisLevantado extends PaisProvisorio {
  origem: "coleta" | "snapshot";
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

export async function obterLevantamento(): Promise<Levantamento> {
  const resultados = await Promise.allSettled(FONTES.map((f) => baixar(f)));

  const fontes: StatusFonte[] = [];
  let lidos: PaisProvisorio[] = [];
  const textosConferencia: { nome: string; texto: string }[] = [];

  FONTES.forEach((fonte, i) => {
    const r = resultados[i];
    const base = { id: fonte.id, nome: fonte.nome, url: fonte.url, papel: fonte.papel };
    if (r.status === "rejected") {
      fontes.push({ ...base, ok: false, erro: r.reason instanceof Error ? r.reason.message : "falha" });
      return;
    }
    if (fonte.papel === "principal") {
      lidos = lerMateriaPorPais(r.value);
      fontes.push({ ...base, ok: lidos.length > 0, paisesLidos: lidos.length, erro: lidos.length ? undefined : "formato não reconhecido" });
    } else {
      textosConferencia.push({ nome: fonte.nome, texto: semAcento(htmlParaTexto(r.value)) });
      fontes.push({ ...base, ok: true });
    }
  });

  const fechaComRef = (d: PaisProvisorio) =>
    d.lideRefPct === undefined ||
    Math.abs((Math.max(...Object.values(d.votos)) / totalVotos(d)) * 100 - d.lideRefPct) <= 0.3;
  const confirmacoes = (d: PaisProvisorio) =>
    textosConferencia.filter((t) => confirma(t.texto, d)).map((t) => t.nome);

  const snapshots = new Map(PROVISORIO.map((p) => [p.iso, p]));
  const lidosPorIso = new Map(lidos.map((p) => [p.iso, p]));

  const paises: PaisLevantado[] = [...new Set([...snapshots.keys(), ...lidosPorIso.keys()])].map((iso) => {
    const lido = lidosPorIso.get(iso);
    const salvo = snapshots.get(iso);
    let dado = lido ?? salvo!;
    let origem: PaisLevantado["origem"] = lido ? "coleta" : "snapshot";
    let confirmadoPor = confirmacoes(dado);
    let aviso: string | undefined;

    if (lido && salvo && !fechaComRef(lido) && fechaComRef(salvo)) {
      const confirmadoSalvo = confirmacoes(salvo);
      if (confirmadoSalvo.length > confirmadoPor.length) {
        dado = salvo;
        origem = "snapshot";
        confirmadoPor = confirmadoSalvo;
        aviso =
          "A matéria atual traz números inconsistentes para este país; mantidos os anteriores, que fecham com o percentual publicado e são confirmados por outras fontes.";
      }
    }

    const ressalva =
      [
        !fechaComRef(dado) &&
          "A soma dos votos listados não fecha com os percentuais publicados pela própria fonte; os valores podem estar incompletos.",
        aviso,
        OBSERVACOES_PAISES[iso],
        dado.ressalva,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return { ...dado, ressalva, origem, confirmadoPor };
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
