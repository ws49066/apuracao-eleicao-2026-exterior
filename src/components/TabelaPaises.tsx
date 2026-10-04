"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { bandeira } from "@/lib/locais";
import { inteiro, percentual } from "@/lib/format";
import type { LinhaPais } from "@/lib/apuracao";

const CONTINENTES = [
  "Todos",
  "América do Sul",
  "América do Norte",
  "América Central e Caribe",
  "Europa",
  "África",
  "Ásia",
  "Oceania",
];

export function TabelaPaises() {
  const router = useRouter();
  const [linhas, setLinhas] = useState<LinhaPais[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [continente, setContinente] = useState("Todos");

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/paises");
      if (!resposta.ok) throw new Error("O TSE não respondeu a tempo. Tente novamente.");
      setLinhas((await resposta.json()) as LinhaPais[]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar.");
    } finally {
      setCarregando(false);
    }
  }

  const visiveis = useMemo(
    () => (linhas ?? []).filter((l) => continente === "Todos" || l.continente === continente),
    [linhas, continente],
  );

  return (
    <section className="rounded-lg border border-tse-borda bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Resultado por país</h2>
          <p className="text-xs text-tse-suave">
            Consolida as cidades de cada país. A consulta percorre todas as localidades do
            exterior, então leva alguns segundos.
          </p>
        </div>
        {linhas && (
          <select
            value={continente}
            onChange={(e) => setContinente(e.target.value)}
            className="rounded border border-tse-borda bg-white px-3 py-1.5 text-sm"
          >
            {CONTINENTES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {!linhas && (
        <button
          type="button"
          onClick={carregar}
          disabled={carregando}
          className="rounded bg-tse-amarelo px-4 py-2 text-sm font-bold text-tse-texto shadow-sm transition hover:brightness-95 disabled:opacity-60"
        >
          {carregando ? "Consultando o TSE…" : "Carregar ranking por país"}
        </button>
      )}

      {erro && <p className="mt-2 text-sm text-tse-vermelho">{erro}</p>}

      {linhas && (
        <div className="max-h-128 overflow-auto rounded border border-tse-borda">
          <table className="w-full min-w-184 border-collapse text-sm">
            <thead className="sticky top-0 bg-tse-fundo text-xs uppercase tracking-wide text-tse-suave">
              <tr>
                <th className="px-3 py-2 text-left font-bold">País</th>
                <th className="px-3 py-2 text-right font-bold">Eleitorado</th>
                <th className="px-3 py-2 text-right font-bold">Comparecimento</th>
                <th className="px-3 py-2 text-right font-bold">Seções</th>
                <th className="px-3 py-2 text-left font-bold">Mais votado</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((l) => (
                <tr
                  key={l.iso}
                  onClick={() => router.push(`/?tipo=pais&id=${l.iso}`, { scroll: false })}
                  className="cursor-pointer border-t border-tse-borda transition hover:bg-tse-amarelo/10"
                >
                  <td className="px-3 py-2">
                    <span className="mr-2" aria-hidden>
                      {bandeira(l.iso)}
                    </span>
                    <span className="font-semibold">{l.nome}</span>
                    <span className="ml-2 text-xs text-tse-suave">
                      {l.cidades} {l.cidades === 1 ? "cidade" : "cidades"}
                    </span>
                  </td>
                  <td className="tabular px-3 py-2 text-right">{inteiro(l.eleitorado)}</td>
                  <td className="tabular px-3 py-2 text-right">{inteiro(l.comparecimento)}</td>
                  <td className="tabular px-3 py-2 text-right text-tse-suave">
                    {inteiro(l.secoesTotalizadas)}/{inteiro(l.secoesTotal)}
                  </td>
                  <td className="px-3 py-2">
                    {l.lider ? (
                      <span>
                        <span className="font-semibold">{l.lider.nomeUrna}</span>
                        <span className="tabular ml-2 text-tse-suave">
                          {percentual(l.lider.percentual)}
                        </span>
                        {l.provisorio && (
                          <span className="ml-2 rounded bg-tse-amarelo/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-tse-amarelo-escuro">
                            provisório
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-tse-suave">Sem votos apurados</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
