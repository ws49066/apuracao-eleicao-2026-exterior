import { paisPorIso, bandeira } from "@/lib/locais";
import type { Levantamento } from "@/lib/fontes";
import { inteiro } from "@/lib/format";

export function SobreDadosNaoOficiais({ lev }: { lev: Levantamento }) {
  const principais = lev.fontes.filter((f) => f.papel === "principal");
  const conferencia = lev.fontes.filter((f) => f.papel === "conferencia");

  return (
    <details className="mb-4 rounded-lg border border-tse-borda bg-white p-4 text-sm shadow-sm">
      <summary className="cursor-pointer font-bold">
        BUs não oficiais coletados de matérias
      </summary>

      <div className="mt-3 space-y-3 text-tse-suave">
        <p>
          Resultado <strong className="text-tse-texto">provisório e não oficial</strong>, coletado de
          matérias que leram BUs. Pode ter erros ou divergir entre veículos; cada país passa ao dado do
          TSE quando houver votos apurados.
        </p>

        <div>
          <p className="mb-1 font-bold text-tse-texto">Fontes monitoradas</p>
          <ul className="space-y-1">
            {[...principais, ...conferencia].map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${f.ok ? "bg-tse-verde-claro" : "bg-tse-vermelho"}`}
                  aria-hidden
                />
                <a href={f.url} target="_blank" rel="noreferrer" className="font-semibold underline">
                  {f.nome}
                </a>
                <span className="text-xs">
                  {f.papel === "principal"
                    ? `fonte dos números${f.paisesLidos !== undefined ? ` · ${f.paisesLidos} países lidos` : ""}`
                    : "usada para conferir os números"}
                  {!f.ok && ` · indisponível${f.erro ? ` (${f.erro})` : ""}`}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1 font-bold text-tse-texto">
            Países com BU coletado ({lev.resumo.paises}) · {inteiro(lev.resumo.votos)} votos
          </p>
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {lev.paises.map((p) => (
              <li key={p.iso} className="text-xs">
                <span aria-hidden>{bandeira(p.iso)}</span>{" "}
                <span className="font-semibold text-tse-texto">{paisPorIso(p.iso)?.nome}</span>
                {" · "}
                {p.confirmadoPor.length > 0
                  ? `confirmado por ${p.confirmadoPor.length} ${p.confirmadoPor.length === 1 ? "outra fonte" : "outras fontes"}`
                  : "sem confirmação de outra fonte"}
                {p.origem === "snapshot" && " · cópia salva (coleta não encontrou)"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
