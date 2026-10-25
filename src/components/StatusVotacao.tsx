"use client";

import { useEffect, useMemo, useState } from "react";
import type { DadosMapa } from "@/lib/apuracao";
import { bandeira, paisPorIso } from "@/lib/locais";
import { faltam, horaBrasilia, statusTodos, type StatusPais } from "@/lib/horarios";
import { useAgora } from "./useAgora";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`inline h-4 w-4 shrink-0 ${className}`} aria-hidden>
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M5.5 10.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Linha({ s, agora, tipo }: { s: StatusPais; agora: Date; tipo: "votando" | "aguardando" }) {
  const nome = paisPorIso(s.iso)?.nome ?? s.iso;
  const alvo = tipo === "votando" ? s.ultimoFechamento : s.abre;
  const varios = tipo === "votando" && s.primeiroFechamento.getTime() !== s.ultimoFechamento.getTime();
  const logo = tipo === "votando" && s.ultimoFechamento.getTime() - agora.getTime() <= 60 * 60_000;

  return (
    <li className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="min-w-0 truncate">
        <span aria-hidden>{bandeira(s.iso)}</span> <span className="font-semibold">{nome}</span>
        {logo && (
          <span className="ml-2 rounded bg-tse-vermelho px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
            encerra em breve
          </span>
        )}
      </span>
      <span className="tabular shrink-0 text-right text-xs text-tse-suave">
        {tipo === "votando" ? "encerra " : "abre "}
        <strong className="text-tse-texto">
          {varios ? `${horaBrasilia(s.primeiroFechamento, agora)} a ` : ""}
          {horaBrasilia(alvo, agora)}
        </strong>{" "}
        (Brasília) · em {faltam(alvo, agora)}
      </span>
    </li>
  );
}

export function StatusVotacao({ turno }: { turno: "1" | "2" }) {
  const agora = useAgora();
  const [dados, setDados] = useState<DadosMapa | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      try {
        const r = await fetch(`/api/mapa?turno=${turno}`, { cache: "no-store" });
        if (r.ok && !cancelado) setDados((await r.json()) as DadosMapa);
      } catch {
        /* sem rede: mantém o que já tinha */
      }
    }
    carregar();
    const id = setInterval(carregar, 60_000);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [turno]);

  const apurados = useMemo(
    () => new Set((dados?.paises ?? []).filter((p) => p.lula + p.flavio > 0).map((p) => p.iso)),
    [dados],
  );
  const origem = dados?.fonte === "oficial" ? "resultado oficial do TSE" : "BUs da imprensa, não oficial";

  const grupos = useMemo(() => {
    if (!agora) return null;
    const todos = statusTodos(turno, agora);
    const por = (e: StatusPais["estado"]) => todos.filter((s) => s.estado === e);
    return {
      total: todos.length,
      votando: por("votando").sort((a, b) => a.ultimoFechamento.getTime() - b.ultimoFechamento.getTime()),
      aguardando: por("aguardando").sort((a, b) => a.abre.getTime() - b.abre.getTime()),
      encerrada: por("encerrada").sort((a, b) =>
        (paisPorIso(a.iso)?.nome ?? "").localeCompare(paisPorIso(b.iso)?.nome ?? "", "pt-BR"),
      ),
    };
  }, [agora, turno]);

  if (!agora || !grupos) return null;

  if (grupos.votando.length === 0 && grupos.aguardando.length === 0) {
    return (
      <p className="mb-4 rounded-lg border border-tse-borda bg-white px-4 py-2 text-sm text-tse-suave shadow-sm">
        Votação encerrada nos {grupos.total} países
        {dados && (
          <>
            {" · "}
            <span className="inline-flex items-center gap-1 font-semibold text-tse-verde">
              <Check className="text-tse-verde-claro" /> {apurados.size} com votos apurados
            </span>
          </>
        )}
        .
      </p>
    );
  }

  const ultimo = [...grupos.votando].sort((a, b) => b.ultimoFechamento.getTime() - a.ultimoFechamento.getTime())[0];
  const primeiroAEncerrar = grupos.votando[0];

  return (
    <section className="mb-4 rounded-lg border border-tse-borda bg-white p-4 shadow-sm" aria-live="polite">
      {grupos.votando.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg bg-tse-vermelho/10 px-3 py-2 text-sm">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tse-vermelho opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-tse-vermelho" />
          </span>
          <p>
            <strong>Votação em andamento em {grupos.votando.length} países.</strong> Próximo a encerrar:{" "}
            {paisPorIso(primeiroAEncerrar.iso)?.nome} às {horaBrasilia(primeiroAEncerrar.ultimoFechamento, agora)}{" "}
            (em {faltam(primeiroAEncerrar.ultimoFechamento, agora)}). Último:{" "}
            {paisPorIso(ultimo.iso)?.nome} às {horaBrasilia(ultimo.ultimoFechamento, agora)}.
          </p>
        </div>
      )}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Onde ainda se vota</h2>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-tse-vermelho px-3 py-1 text-white">Votando {grupos.votando.length}</span>
          <span className="rounded-full bg-tse-amarelo px-3 py-1">Ainda não abriu {grupos.aguardando.length}</span>
          <span className="rounded-full bg-tse-fundo px-3 py-1 text-tse-suave">Encerrada {grupos.encerrada.length}</span>
          {dados && (
            <span className="inline-flex items-center gap-1 rounded-full bg-tse-verde px-3 py-1 text-white">
              <Check className="text-tse-verde-claro" /> Apurada {grupos.encerrada.filter((s) => apurados.has(s.iso)).length}
            </span>
          )}
        </div>
      </div>
      <p className="mb-2 text-xs text-tse-suave">
        Cada seção vota das 8h às 17h do horário local. Horários convertidos para Brasília.
      </p>

      <div className="grid gap-x-8 md:grid-cols-2">
        <div>
          <h3 className="border-b border-tse-borda pb-1 text-xs font-bold uppercase tracking-wide text-tse-suave">
            Votando agora
          </h3>
          <ul className="max-h-72 divide-y divide-tse-borda overflow-y-auto pr-1">
            {grupos.votando.map((s) => (
              <Linha key={s.iso} s={s} agora={agora} tipo="votando" />
            ))}
            {grupos.votando.length === 0 && <li className="py-2 text-sm text-tse-suave">Nenhum país.</li>}
          </ul>
        </div>
        <div>
          <h3 className="border-b border-tse-borda pb-1 text-xs font-bold uppercase tracking-wide text-tse-suave">
            Ainda vai abrir
          </h3>
          <ul className="max-h-72 divide-y divide-tse-borda overflow-y-auto pr-1">
            {grupos.aguardando.map((s) => (
              <Linha key={s.iso} s={s} agora={agora} tipo="aguardando" />
            ))}
            {grupos.aguardando.length === 0 && <li className="py-2 text-sm text-tse-suave">Todos já abriram.</li>}
          </ul>
        </div>
      </div>

      <details className="mt-3" open>
        <summary className="cursor-pointer text-sm font-semibold">
          Já encerraram ({grupos.encerrada.length})
          {dados && (
            <span className="ml-2 text-xs font-normal text-tse-suave">
              <Check className="mr-0.5 align-text-bottom text-tse-verde-claro" />
              apurado ({origem}) · <span className="mx-0.5">○</span> aguardando apuração
            </span>
          )}
        </summary>
        <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5 text-sm">
          {[...grupos.encerrada]
            .sort((a, b) => Number(apurados.has(b.iso)) - Number(apurados.has(a.iso)))
            .map((s) => {
              const ok = apurados.has(s.iso);
              return (
                <li
                  key={s.iso}
                  title={ok ? `Votos apurados (${origem})` : "Votação encerrada; apuração ainda não divulgada"}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 ${
                    ok ? "border-tse-verde-claro bg-tse-verde-claro/15 font-semibold" : "border-tse-borda text-tse-suave"
                  }`}
                >
                  {dados &&
                    (ok ? <Check className="text-tse-verde-claro" /> : <span aria-hidden className="w-4 text-center text-xs">○</span>)}
                  <span aria-hidden>{bandeira(s.iso)}</span> {paisPorIso(s.iso)?.nome}
                  <span className="tabular text-xs font-normal text-tse-suave">
                    {horaBrasilia(s.ultimoFechamento, agora)}
                  </span>
                </li>
              );
            })}
        </ul>
      </details>
    </section>
  );
}
