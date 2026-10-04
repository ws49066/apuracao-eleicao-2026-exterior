import { BotaoAtualizar } from "@/components/BotaoAtualizar";
import { CartaoCandidato } from "@/components/CartaoCandidato";
import { PainelDadosGerais } from "@/components/PainelDadosGerais";
import { SeletorEscopo } from "@/components/SeletorEscopo";
import { TabelaPaises } from "@/components/TabelaPaises";
import { obterApuracao, type FiltroEscopo } from "@/lib/apuracao";
import { bandeira } from "@/lib/locais";
import { inteiro, percentual } from "@/lib/format";
import { TSE } from "@/lib/tse/config";
import type { Apuracao } from "@/lib/tse/normalize";

export const revalidate = 30;

interface Props {
  searchParams: Promise<{ tipo?: string; id?: string }>;
}

function montarFiltro(tipo?: string, id?: string): { filtro: FiltroEscopo; valor: string } {
  if (tipo === "pais" && id) return { filtro: { tipo: "pais", iso: id }, valor: `pais:${id}` };
  if (tipo === "cidade" && id)
    return { filtro: { tipo: "cidade", codigo: id }, valor: `cidade:${id}` };
  return { filtro: { tipo: "exterior" }, valor: "exterior" };
}

function Cabecalho({ valorSelecionado }: { valorSelecionado: string }) {
  return (
    <header className="border-b border-tse-borda bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-tse-amarelo-escuro">
            Eleições 2026 · Voto no exterior
          </p>
          <h1 className="text-xl font-bold leading-tight">Apuração para Presidente</h1>
        </div>
        <p className="text-xs text-tse-suave">
          Criado por <span className="font-bold text-tse-texto">Wanderson Oliveira</span>
        </p>
      </div>
      <div className="border-t border-tse-borda bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <SeletorEscopo valorAtual={valorSelecionado} />
          <div className="text-center">
            <p className="text-xs font-semibold text-tse-suave">Turno</p>
            <p className="mt-0.5 rounded bg-tse-amarelo px-3 py-1 text-sm font-bold">
              {TSE.turno}º
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Rodape() {
  return (
    <footer className="mt-10 border-t border-tse-borda bg-white">
      <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-xs text-tse-suave">
        <p>
          Fonte: arquivos públicos de divulgação de resultados do Tribunal Superior Eleitoral
          (resultados.tse.jus.br). Projeto independente, sem vínculo com o TSE.
        </p>
        <p>
          Criado por <span className="font-bold text-tse-texto">Wanderson Oliveira</span>.
        </p>
      </div>
    </footer>
  );
}

function Erro({ mensagem }: { mensagem: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-tse-borda bg-white p-8 text-center shadow-sm">
      <p className="text-3xl" aria-hidden>
        📡
      </p>
      <h2 className="mt-2 text-lg font-bold">Não foi possível obter os dados do TSE</h2>
      <p className="mt-2 text-sm text-tse-suave">{mensagem}</p>
      <p className="mt-4 text-xs text-tse-suave">
        Os arquivos ficam disponíveis a partir do início da totalização. Tente novamente em
        instantes.
      </p>
    </div>
  );
}

function AvisoProvisorio({ apuracao }: { apuracao: Apuracao }) {
  const p = apuracao.provisorio;
  if (!p) return null;
  return (
    <div className="mb-4 rounded-lg border-2 border-tse-amarelo bg-tse-amarelo/15 px-4 py-3 text-sm">
      <p className="font-bold">Resultado provisório — não oficial</p>
      <p className="mt-1 text-tse-suave">
        O TSE ainda não divulgou a totalização. Os votos abaixo vêm de boletins de urna levantados
        pela imprensa ({p.paisesCobertos} {p.paisesCobertos === 1 ? "país" : "países"}) e serão
        substituídos pelo resultado oficial assim que ele for publicado. Fonte:{" "}
        <a href={p.url} className="font-semibold underline" target="_blank" rel="noreferrer">
          {p.fonte}
        </a>
        .
      </p>
      {p.avisos.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-tse-suave">
          {p.avisos.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Resumo({ apuracao }: { apuracao: Apuracao }) {
  const { escopo, secoes, eleitorado } = apuracao;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-tse-borda bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {escopo.iso ? bandeira(escopo.iso) : "🌎"}
        </span>
        <div>
          <h2 className="text-lg font-bold leading-tight">{escopo.nome}</h2>
          <p className="tabular text-xs text-tse-suave">
            {inteiro(secoes.totalizadas)} de {inteiro(secoes.total)} seções totalizadas ·{" "}
            {percentual(secoes.percentual)} · {inteiro(eleitorado.apto)} eleitores aptos
          </p>
        </div>
      </div>
      <BotaoAtualizar />
    </div>
  );
}

export default async function Pagina({ searchParams }: Props) {
  const { tipo, id } = await searchParams;
  const { filtro, valor } = montarFiltro(tipo, id);

  let apuracao: Apuracao | null = null;
  let mensagemErro: string | null = null;
  try {
    apuracao = await obterApuracao(filtro);
  } catch (erro) {
    mensagemErro = erro instanceof Error ? erro.message : "Erro desconhecido.";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho valorSelecionado={valor} />

      <div className="bg-tse-fundo">
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <span className="inline-block rounded bg-tse-verde px-4 py-2 text-sm font-bold uppercase tracking-wide text-white">
            Presidente
          </span>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4">
        {!apuracao ? (
          <Erro mensagem={mensagemErro ?? ""} />
        ) : (
          <>
            <Resumo apuracao={apuracao} />
            <AvisoProvisorio apuracao={apuracao} />
            <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
              <aside>
                <PainelDadosGerais apuracao={apuracao} />
              </aside>
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {apuracao.candidatos.map((candidato, indice) => (
                    <CartaoCandidato
                      key={candidato.sqcand}
                      candidato={candidato}
                      destaque={indice === 0 && candidato.votos > 0}
                    />
                  ))}
                </div>
                <TabelaPaises />
              </div>
            </div>
          </>
        )}
      </main>

      <Rodape />
    </div>
  );
}
