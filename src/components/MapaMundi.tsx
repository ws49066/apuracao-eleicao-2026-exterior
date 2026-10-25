"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import mapa from "@/data/mapa-paises.json";
import type { DadosMapa, PaisMapa } from "@/lib/apuracao";
import { inteiro, percentual } from "@/lib/format";
import { faltam, horaBrasilia, statusPais } from "@/lib/horarios";
import { bandeira, paisPorIso } from "@/lib/locais";
import type { Turno } from "@/lib/tse/config";
import { useAgora } from "./useAgora";

const COR_LULA = "#d62839";
const COR_FLAVIO = "#1f6feb";
const COR_EMPATE = "#8b7fb8";
const COR_VAZIO = "#e6e6e6";

type Lider = "lula" | "flavio" | "empate";

function lider(p: PaisMapa): Lider {
  return p.lula > p.flavio ? "lula" : p.flavio > p.lula ? "flavio" : "empate";
}

/** Quanto mais folgada a vitória, mais forte a cor. */
function estilo(p: PaisMapa | undefined): { fill: string; opacity: number } {
  if (!p || p.lula + p.flavio === 0) return { fill: COR_VAZIO, opacity: 1 };
  const l = lider(p);
  const margem = Math.abs(p.lula - p.flavio) / (p.lula + p.flavio);
  const opacity = 0.5 + 0.5 * Math.min(margem / 0.5, 1);
  return { fill: l === "lula" ? COR_LULA : l === "flavio" ? COR_FLAVIO : COR_EMPATE, opacity };
}

const INTERVALO_MS = 60_000;

export function MapaMundi({ totalPaises, turno }: { totalPaises: number; turno: string }) {
  const router = useRouter();
  const [dados, setDados] = useState<DadosMapa | null>(null);
  const [erro, setErro] = useState(false);
  const [ativo, setAtivo] = useState<{ iso: string; x: number; y: number } | null>(null);
  const agora = useAgora(60_000);
  const status = (iso: string) =>
    agora && paisPorIso(iso) ? statusPais(iso, turno as Turno, agora) : null;

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const r = await fetch(`/api/mapa?turno=${turno}`, { cache: "no-store" });
        if (!r.ok) throw new Error();
        const d = (await r.json()) as DadosMapa;
        if (!cancelado) {
          setDados(d);
          setErro(false);
        }
      } catch {
        if (!cancelado) setErro(true);
      }
    }
    carregar();
    const id = setInterval(carregar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [turno]);

  const porIso = useMemo(() => new Map((dados?.paises ?? []).map((p) => [p.iso, p])), [dados]);

  const resumo = useMemo(() => {
    const r = { lula: 0, flavio: 0, empate: 0, votosLula: 0, votosFlavio: 0 };
    for (const p of dados?.paises ?? []) {
      if (p.lula + p.flavio === 0) continue;
      r[lider(p)] += 1;
      r.votosLula += p.lula;
      r.votosFlavio += p.flavio;
    }
    return r;
  }, [dados]);

  const comDados = resumo.lula + resumo.flavio + resumo.empate;
  const selecionado: PaisMapa | undefined = ativo
    ? (porIso.get(ativo.iso) ?? {
        iso: ativo.iso,
        nome: paisPorIso(ativo.iso)?.nome ?? ativo.iso,
        lula: 0,
        flavio: 0,
        provisorio: false,
      })
    : undefined;
  const statusSelecionado = selecionado ? status(selecionado.iso) : null;

  function mostrar(iso: string, evento: React.MouseEvent | React.FocusEvent) {
    const caixa = (evento.currentTarget.closest("[data-mapa]") as HTMLElement).getBoundingClientRect();
    const alvo = (evento.currentTarget as SVGElement).getBoundingClientRect();
    const x = "clientX" in evento ? evento.clientX - caixa.left : alvo.left - caixa.left + alvo.width / 2;
    const y = "clientY" in evento ? evento.clientY - caixa.top : alvo.top - caixa.top;
    setAtivo({ iso, x, y });
  }

  const interativo = (iso: string) => {
    if (!paisPorIso(iso)) return {};
    return {
      onMouseMove: (e: React.MouseEvent) => mostrar(iso, e),
      onMouseLeave: () => setAtivo(null),
      onFocus: (e: React.FocusEvent) => mostrar(iso, e),
      onBlur: () => setAtivo(null),
      onClick: (e: React.MouseEvent) => mostrar(iso, e),
      tabIndex: 0,
      style: { cursor: "pointer" },
    };
  };

  return (
    <section className="mb-4 rounded-lg border border-tse-borda bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Quem lidera em cada país</h2>
          <p className="text-xs text-tse-suave">
            {dados
              ? dados.fonte === "oficial"
                ? "Resultado oficial do TSE"
                : "Provisório e não oficial (BUs da imprensa)"
              : "Carregando…"}
            {dados && ` · ${comDados} de ${totalPaises} países com votos`}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Placar cor={COR_LULA} rotulo="Lula lidera" valor={resumo.lula} detalhe={`${inteiro(resumo.votosLula)} votos`} />
          <Placar cor={COR_FLAVIO} rotulo="Flávio lidera" valor={resumo.flavio} detalhe={`${inteiro(resumo.votosFlavio)} votos`} />
          <Placar cor={COR_VAZIO} rotulo="Sem dados" valor={Math.max(totalPaises - comDados, 0)} detalhe="países" escuro />
        </div>
      </div>

      <div data-mapa className="relative">
        <svg
          viewBox={`0 ${mapa.deslocY} ${mapa.largura} ${mapa.altura}`}
          className="h-auto w-full"
          role="img"
          aria-label="Mapa-múndi com o candidato líder em cada país"
        >
          <defs>
            <pattern id="listras" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="#fff6d0" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="#f2c200" strokeWidth="3" />
            </pattern>
          </defs>
          <rect x="0" y={mapa.deslocY} width={mapa.largura} height={mapa.altura} fill="#f6f9fc" rx="8" />
          {mapa.paises.map((p) => {
            const e = estilo(porIso.get(p.iso));
            const alvo = ativo?.iso === p.iso;
            const aindaVota = e.fill === COR_VAZIO && status(p.iso)?.estado === "votando";
            return (
              <path
                key={p.iso}
                d={p.d}
                fill={aindaVota ? "url(#listras)" : e.fill}
                fillOpacity={e.opacity}
                stroke={alvo ? "#1b1b1b" : "#ffffff"}
                strokeWidth={alvo ? 1.2 : 0.5}
                {...interativo(p.iso)}
              >
                <title>{p.nome}</title>
              </path>
            );
          })}
          {mapa.marcadores.map((m) => {
            const e = estilo(porIso.get(m.iso));
            const aindaVota = e.fill === COR_VAZIO && status(m.iso)?.estado === "votando";
            return (
              <circle
                key={m.iso}
                cx={m.x}
                cy={m.y}
                r={5}
                fill={aindaVota ? "#f2c200" : e.fill}
                fillOpacity={e.opacity}
                stroke={ativo?.iso === m.iso ? "#1b1b1b" : "#ffffff"}
                strokeWidth={1.2}
                {...interativo(m.iso)}
              />
            );
          })}
        </svg>

        {ativo && selecionado && (
          <div
            className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-tse-borda bg-white p-3 text-sm shadow-xl sm:pointer-events-auto"
            style={{ left: Math.min(Math.max(ativo.x, 112), 9999), top: Math.max(ativo.y - 10, 0) }}
          >
            <p className="font-bold">
              <span aria-hidden>{bandeira(selecionado.iso)}</span> {selecionado.nome}
            </p>
            {selecionado.lula + selecionado.flavio > 0 ? (
              <>
                <Barra p={selecionado} />
                <p className="mt-1 text-[11px] text-tse-suave">
                  {selecionado.provisorio ? "Provisório (BUs da imprensa)" : "Oficial TSE"}
                </p>
              </>
            ) : (
              <p className="mt-1 text-xs text-tse-suave">Sem votos apurados.</p>
            )}
            {statusSelecionado && agora && (
              <p className="mt-1.5 text-xs font-semibold">
                {statusSelecionado.estado === "votando" &&
                  `Votando · encerra ${horaBrasilia(statusSelecionado.ultimoFechamento, agora)} (Brasília), em ${faltam(statusSelecionado.ultimoFechamento, agora)}`}
                {statusSelecionado.estado === "aguardando" &&
                  `Ainda não abriu · abre ${horaBrasilia(statusSelecionado.abre, agora)} (Brasília)`}
                {statusSelecionado.estado === "encerrada" &&
                  (selecionado.lula + selecionado.flavio > 0
                    ? "Votação encerrada · apurado"
                    : "Votação encerrada · aguardando apuração")}
              </p>
            )}
            <button
              type="button"
              onClick={() => router.push(`/?turno=${turno}&tipo=pais&id=${selecionado.iso}`, { scroll: true })}
              className="mt-2 w-full rounded bg-tse-amarelo px-2 py-1 text-xs font-bold hover:brightness-95"
            >
              Ver este país
            </button>
          </div>
        )}

        {!dados && !erro && (
          <p className="absolute inset-0 grid place-items-center text-sm text-tse-suave">Carregando mapa…</p>
        )}
        {erro && !dados && (
          <p className="absolute inset-0 grid place-items-center text-sm text-tse-vermelho">
            Não foi possível carregar os dados do mapa.
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-tse-suave">
        <Legenda cor={COR_LULA} texto="Lula" />
        <Legenda cor={COR_FLAVIO} texto="Flávio Bolsonaro" />
        <Legenda cor={COR_EMPATE} texto="Empate" />
        <Legenda cor={COR_VAZIO} texto="Sem votos apurados" />
        <Legenda cor="repeating-linear-gradient(45deg,#fff6d0 0 3px,#f2c200 3px 5px)" texto="Ainda votando" />
        <span>
          Cor mais forte = vitória mais folgada. Passe o mouse ou toque no país.
          {turno === "1" && " Compara só Lula e Flávio; o 1º turno teve 12 candidatos."}
        </span>
      </div>
    </section>
  );
}

function Placar({
  cor,
  rotulo,
  valor,
  detalhe,
  escuro,
}: {
  cor: string;
  rotulo: string;
  valor: number;
  detalhe: string;
  escuro?: boolean;
}) {
  return (
    <div className="min-w-24 rounded-lg px-3 py-1.5" style={{ backgroundColor: cor, color: escuro ? "#444" : "#fff" }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-90">{rotulo}</p>
      <p className="tabular text-2xl font-bold leading-tight">{valor}</p>
      <p className="tabular text-[11px] opacity-90">{detalhe}</p>
    </div>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-sm" style={{ background: cor }} />
      {texto}
    </span>
  );
}

function Barra({ p }: { p: PaisMapa }) {
  const total = p.lula + p.flavio;
  const pl = total ? (p.lula / total) * 100 : 0;
  return (
    <div className="mt-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-tse-fundo">
        <div style={{ width: `${pl}%`, backgroundColor: COR_LULA }} />
        <div style={{ width: `${100 - pl}%`, backgroundColor: COR_FLAVIO }} />
      </div>
      <div className="tabular mt-1 flex justify-between text-xs">
        <span style={{ color: COR_LULA }} className="font-bold">
          Lula {inteiro(p.lula)} · {percentual(pl)}
        </span>
        <span style={{ color: COR_FLAVIO }} className="font-bold">
          {percentual(100 - pl)} · {inteiro(p.flavio)} Flávio
        </span>
      </div>
    </div>
  );
}
