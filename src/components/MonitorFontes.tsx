"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Resumo {
  paises: number;
  votos: number;
}
interface RespostaMonitor {
  versao: string;
  coletadoEm: string;
  resumo: Resumo;
  fontes: { ok: boolean }[];
}

const INTERVALO_MS = 60_000;

export function MonitorFontes({ versao, resumo }: { versao: string; resumo: Resumo }) {
  const router = useRouter();
  const atual = useRef({ versao, resumo });
  const [novidade, setNovidade] = useState<string | null>(null);
  const [verificadoEm, setVerificadoEm] = useState<Date | null>(null);
  const [fontesOk, setFontesOk] = useState<string | null>(null);

  useEffect(() => {
    atual.current = { versao, resumo };
  }, [versao, resumo]);

  useEffect(() => {
    let cancelado = false;
    async function verificar() {
      try {
        const r = await fetch("/api/monitor", { cache: "no-store" });
        if (!r.ok || cancelado) return;
        const d = (await r.json()) as RespostaMonitor;
        setVerificadoEm(new Date());
        setFontesOk(`${d.fontes.filter((f) => f.ok).length}/${d.fontes.length}`);
        if (d.versao !== atual.current.versao) {
          const dp = d.resumo.paises - atual.current.resumo.paises;
          const dv = d.resumo.votos - atual.current.resumo.votos;
          setNovidade(
            [
              dp > 0 ? `+${dp} ${dp === 1 ? "país" : "países"}` : null,
              dv !== 0 ? `${dv > 0 ? "+" : ""}${dv.toLocaleString("pt-BR")} votos` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "números revisados",
          );
          atual.current = { versao: d.versao, resumo: d.resumo };
          router.refresh();
        }
      } catch {
        /* rede instável: tenta de novo no próximo ciclo */
      }
    }
    verificar();
    const id = setInterval(verificar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [router]);

  useEffect(() => {
    if (!novidade) return;
    const id = setTimeout(() => setNovidade(null), 20_000);
    return () => clearTimeout(id);
  }, [novidade]);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-tse-suave" role="status">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tse-verde-claro opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-tse-verde-claro" />
        </span>
        Monitorando as fontes a cada 60s
        {fontesOk && <span>· {fontesOk} acessíveis</span>}
      </span>
      {verificadoEm && (
        <span className="tabular">Última checagem {verificadoEm.toLocaleTimeString("pt-BR")}</span>
      )}
      {novidade && (
        <span className="rounded bg-tse-amarelo px-2 py-0.5 font-bold text-tse-texto">
          Atualizado: {novidade}
        </span>
      )}
    </div>
  );
}
