"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bandeira, LOCALIDADES, PAISES } from "@/lib/locais";

interface Opcao {
  valor: string;
  rotulo: string;
  detalhe: string;
  icone: string;
  grupo: "Visão geral" | "Países" | "Cidades";
}

const OPCOES: Opcao[] = [
  {
    valor: "exterior",
    rotulo: "Exterior (todos os países)",
    detalhe: `${PAISES.length} países · ${LOCALIDADES.length} cidades`,
    icone: "🌎",
    grupo: "Visão geral",
  },
  ...PAISES.map((p) => ({
    valor: `pais:${p.iso}`,
    rotulo: p.nome,
    detalhe: `${p.continente} · ${p.localidades.length} ${p.localidades.length === 1 ? "cidade" : "cidades"}`,
    icone: bandeira(p.iso),
    grupo: "Países" as const,
  })),
  ...LOCALIDADES.map((l) => ({
    valor: `cidade:${l.codigo}`,
    rotulo: l.cidade,
    detalhe: l.pais,
    icone: bandeira(l.iso),
    grupo: "Cidades" as const,
  })).sort((a, b) => a.rotulo.localeCompare(b.rotulo, "pt-BR")),
];

const semAcento = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function SeletorEscopo({ valorAtual }: { valorAtual: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [pendente, iniciarTransicao] = useTransition();
  const container = useRef<HTMLDivElement>(null);

  const selecionada = OPCOES.find((o) => o.valor === valorAtual) ?? OPCOES[0];

  const filtradas = useMemo(() => {
    if (!busca.trim()) return OPCOES;
    const termo = semAcento(busca.trim());
    return OPCOES.filter(
      (o) => semAcento(o.rotulo).includes(termo) || semAcento(o.detalhe).includes(termo),
    );
  }, [busca]);

  useEffect(() => {
    if (!aberto) return;
    const aoClicarFora = (evento: MouseEvent) => {
      if (!container.current?.contains(evento.target as Node)) setAberto(false);
    };
    const aoApertarEsc = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarEsc);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarEsc);
    };
  }, [aberto]);

  function selecionar(valor: string) {
    setAberto(false);
    setBusca("");
    const [tipo, id] = valor.split(":");
    const destino = id ? `/?tipo=${tipo}&id=${id}` : "/";
    iniciarTransicao(() => router.push(destino, { scroll: false }));
  }

  let grupoAnterior = "";

  return (
    <div className="relative w-full max-w-sm" ref={container}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        aria-haspopup="listbox"
        className="flex w-full items-center gap-2 rounded-full border-2 border-tse-amarelo bg-white px-4 py-2 text-left shadow-sm transition hover:border-tse-amarelo-escuro"
      >
        <span className="text-lg leading-none" aria-hidden>
          {selecionada.icone}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{selecionada.rotulo}</span>
          <span className="block truncate text-xs text-tse-suave">{selecionada.detalhe}</span>
        </span>
        {pendente ? (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-tse-amarelo border-t-transparent" />
        ) : (
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-tse-amarelo-escuro" aria-hidden>
            <path d="M5 7l5 6 5-6z" />
          </svg>
        )}
      </button>

      {aberto && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-tse-borda bg-white shadow-xl">
          <div className="border-b border-tse-borda p-2">
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar país ou cidade…"
              className="w-full rounded-lg bg-tse-fundo px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tse-amarelo"
            />
          </div>
          <ul role="listbox" className="max-h-80 overflow-y-auto py-1">
            {filtradas.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-tse-suave">
                Nenhum resultado para “{busca}”.
              </li>
            )}
            {filtradas.map((opcao) => {
              const novoGrupo = opcao.grupo !== grupoAnterior;
              grupoAnterior = opcao.grupo;
              return (
                <li key={opcao.valor}>
                  {novoGrupo && (
                    <p className="bg-tse-fundo px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-tse-suave">
                      {opcao.grupo}
                    </p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={opcao.valor === valorAtual}
                    onClick={() => selecionar(opcao.valor)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-tse-amarelo/15 ${
                      opcao.valor === valorAtual ? "bg-tse-amarelo/25 font-semibold" : ""
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {opcao.icone}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{opcao.rotulo}</span>
                      <span className="block truncate text-xs text-tse-suave">{opcao.detalhe}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
