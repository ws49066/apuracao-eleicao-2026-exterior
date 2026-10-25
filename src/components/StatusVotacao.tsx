"use client";

import { useMemo } from "react";
import { bandeira, paisPorIso } from "@/lib/locais";
import { faltam, horaBrasilia, statusTodos, type StatusPais } from "@/lib/horarios";
import { useAgora } from "./useAgora";

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
        Votação encerrada nos {grupos.total} países.
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

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Já encerraram ({grupos.encerrada.length})
        </summary>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {grupos.encerrada.map((s) => (
            <li key={s.iso} className="whitespace-nowrap">
              <span aria-hidden>{bandeira(s.iso)}</span> {paisPorIso(s.iso)?.nome}
              <span className="tabular ml-1 text-xs text-tse-suave">{horaBrasilia(s.ultimoFechamento, agora)}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
