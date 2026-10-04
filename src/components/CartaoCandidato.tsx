"use client";

import { useState } from "react";
import { inteiro, percentual } from "@/lib/format";
import type { Candidato } from "@/lib/tse/normalize";

function iniciais(nome: string) {
  const partes = nome.split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? "") + (partes.at(-1)?.[0] ?? "")).toUpperCase();
}

export function CartaoCandidato({
  candidato,
  destaque,
}: {
  candidato: Candidato;
  destaque: boolean;
}) {
  const [semFoto, setSemFoto] = useState(false);

  return (
    <article
      className={`relative flex flex-col justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md ${
        destaque ? "border-tse-verde-claro ring-1 ring-tse-verde-claro" : "border-tse-borda"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-tse-borda bg-tse-fundo">
            {semFoto ? (
              <span className="grid h-full w-full place-items-center text-xl font-bold text-tse-suave">
                {iniciais(candidato.nomeUrna)}
              </span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={candidato.foto}
                alt={candidato.nomeUrna}
                loading="lazy"
                onError={() => setSemFoto(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-tse-amarelo" />
        </div>

        <div className="flex-1 text-right">
          <p className="tabular text-2xl font-bold text-tse-amarelo-escuro">
            {percentual(candidato.percentual)}
          </p>
          <p className="tabular text-sm text-tse-suave">{inteiro(candidato.votos)} votos</p>
          {candidato.eleito && (
            <span className="mt-1 inline-block rounded bg-tse-verde px-2 py-0.5 text-[11px] font-bold uppercase text-white">
              Eleito
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-tse-suave">
          {candidato.partido} — {candidato.numero}
        </p>
        <h3 className="text-lg font-bold uppercase leading-tight">{candidato.nomeUrna}</h3>
        {candidato.vice && (
          <p className="mt-1 text-xs text-tse-suave">Vice: {candidato.vice}</p>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-tse-fundo">
        <div
          className="h-full rounded-full bg-tse-amarelo transition-[width] duration-700"
          style={{ width: `${Math.min(candidato.percentual, 100)}%` }}
        />
      </div>
    </article>
  );
}
