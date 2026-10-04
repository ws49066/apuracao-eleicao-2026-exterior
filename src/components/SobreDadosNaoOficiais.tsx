import { paisPorIso, bandeira } from "@/lib/locais";
import type { Levantamento } from "@/lib/fontes";
import { inteiro } from "@/lib/format";

export function SobreDadosNaoOficiais({ lev }: { lev: Levantamento }) {
  const principais = lev.fontes.filter((f) => f.papel === "principal");
  const conferencia = lev.fontes.filter((f) => f.papel === "conferencia");

  return (
    <details className="mb-4 rounded-lg border border-tse-borda bg-white p-4 text-sm shadow-sm">
      <summary className="cursor-pointer font-bold">
        Sobre estes números: boletins de urna (BU) não oficiais coletados de matérias
      </summary>

      <div className="mt-3 space-y-3 text-tse-suave">
        <p>
          O <strong className="text-tse-texto">boletim de urna (BU)</strong> é o resumo impresso
          por cada urna ao fim da votação. O resultado oficial é a soma de todos os BUs, mas o TSE
          só divulga a totalização depois do horário definido. Enquanto isso, veículos de imprensa
          leem BUs afixados nos locais de votação e publicam os totais por país.
        </p>
        <p>
          Este painel <strong className="text-tse-texto">coleta automaticamente</strong> essas
          matérias e as usa como resultado <strong className="text-tse-texto">provisório e não
          oficial</strong>. Os números podem conter erros de digitação da fonte, cobrir só parte
          das seções e divergir entre veículos. Cada país é substituído pelo dado do TSE assim
          que houver votos apurados.
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
