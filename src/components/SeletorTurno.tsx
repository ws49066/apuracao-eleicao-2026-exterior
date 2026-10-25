import Link from "next/link";

const TURNOS = [
  { valor: "1", rotulo: "1º turno", data: "04/10" },
  { valor: "2", rotulo: "2º turno", data: "25/10" },
];

export function SeletorTurno({ atual, tipo, id }: { atual: string; tipo?: string; id?: string }) {
  const escopo = tipo && id ? `&tipo=${tipo}&id=${id}` : "";
  return (
    <nav aria-label="Turno" className="flex flex-col items-center gap-0.5">
      <p className="text-xs font-semibold text-tse-suave">Turno</p>
      <div className="flex overflow-hidden rounded-full border-2 border-tse-amarelo bg-white text-sm font-bold">
        {TURNOS.map((t) => (
          <Link
            key={t.valor}
            href={`/?turno=${t.valor}${escopo}`}
            scroll={false}
            aria-current={atual === t.valor ? "page" : undefined}
            className={`px-4 py-1.5 transition ${
              atual === t.valor ? "bg-tse-amarelo text-tse-texto" : "text-tse-suave hover:bg-tse-amarelo/20"
            }`}
          >
            {t.rotulo}
            <span className="ml-1.5 text-[11px] font-normal opacity-70">{t.data}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
