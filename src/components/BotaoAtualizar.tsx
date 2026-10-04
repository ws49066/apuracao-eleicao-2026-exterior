"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const INTERVALO_MS = 60_000;

export function BotaoAtualizar() {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();
  const [automatico, setAutomatico] = useState(true);

  const atualizar = () => iniciarTransicao(() => router.refresh());

  useEffect(() => {
    if (!automatico) return;
    const id = setInterval(() => router.refresh(), INTERVALO_MS);
    return () => clearInterval(id);
  }, [automatico, router]);

  return (
    <div className="flex items-center gap-3">
      <label className="flex cursor-pointer items-center gap-2 text-xs text-tse-suave">
        <input
          type="checkbox"
          checked={automatico}
          onChange={(e) => setAutomatico(e.target.checked)}
          className="h-3.5 w-3.5 accent-tse-amarelo"
        />
        A cada 60s
      </label>
      <button
        type="button"
        onClick={atualizar}
        disabled={pendente}
        className="flex items-center gap-2 rounded border border-tse-borda bg-white px-3 py-1.5 text-sm font-semibold shadow-sm transition hover:bg-tse-fundo disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 fill-tse-amarelo-escuro ${pendente ? "animate-spin" : ""}`}
          aria-hidden
        >
          <path d="M12 5V2L8 6l4 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
        </svg>
        Atualizar
      </button>
    </div>
  );
}
