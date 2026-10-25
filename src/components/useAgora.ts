"use client";

import { useEffect, useState } from "react";

/** Relógio que reavalia a cada `intervaloMs`; começa nulo para não divergir do HTML do servidor. */
export function useAgora(intervaloMs = 30_000): Date | null {
  const [agora, setAgora] = useState<Date | null>(null);
  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return agora;
}
