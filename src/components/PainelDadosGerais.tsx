import { inteiro, percentual } from "@/lib/format";
import type { Apuracao } from "@/lib/tse/normalize";

function Linha({
  rotulo,
  valor,
  cor,
  recuo = false,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
  recuo?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-tse-borda py-2 text-sm last:border-0 ${
        recuo ? "pl-4" : ""
      }`}
    >
      <span className="flex items-center gap-2 text-tse-suave">
        {cor && <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: cor }} />}
        {rotulo}
      </span>
      <span className="tabular shrink-0 font-semibold">{valor}</span>
    </div>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-tse-borda bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-bold">{titulo}</h2>
      {children}
    </section>
  );
}

function Barra({ valor, cor = "#7cb342" }: { valor: number; cor?: string }) {
  return (
    <div className="relative h-5 w-full overflow-hidden rounded bg-tse-fundo">
      <div
        className="h-full transition-[width] duration-700"
        style={{ width: `${Math.min(valor, 100)}%`, backgroundColor: cor }}
      />
      <span className="tabular absolute inset-0 grid place-items-center text-xs font-bold">
        {percentual(valor)}
      </span>
    </div>
  );
}

export function PainelDadosGerais({ apuracao }: { apuracao: Apuracao }) {
  const { secoes, votos, eleitorado } = apuracao;

  return (
    <div className="flex flex-col gap-4">
      <Cartao titulo="Dados Gerais">
        <p className="mb-3 text-xs font-semibold text-tse-suave">
          Última atualização {apuracao.atualizadoEm} (horário de Brasília)
        </p>
        <Linha rotulo="Número de vagas" valor="1" />
        <Linha rotulo="Total de seções" valor={inteiro(secoes.total)} />
        <Linha rotulo="Seções totalizadas" valor={inteiro(secoes.totalizadas)} />
        <div className="pt-3">
          <Barra valor={secoes.percentual} />
        </div>
      </Cartao>

      {apuracao.provisorio ? (
        <Cartao titulo="Votação (provisório)">
          <p className="tabular pb-1 text-sm font-bold">
            {inteiro(votos.total)}{" "}
            <span className="font-normal text-tse-suave">votos nos boletins levantados</span>
          </p>
          <p className="text-xs text-tse-suave">
            Brancos, nulos e anulados não constam no levantamento.
          </p>
        </Cartao>
      ) : (
      <Cartao titulo="Votação">
        <div className="pb-3">
          <Barra valor={votos.percNominais} cor="#4e7d1f" />
        </div>
        <p className="tabular pb-1 text-sm font-bold">
          {inteiro(votos.total)} <span className="font-normal text-tse-suave">votos apurados</span>
        </p>
        <Linha rotulo="Nominais" valor={percentual(votos.percNominais)} />
        <Linha rotulo="Válidos" valor={inteiro(votos.validos)} cor="#7cb342" recuo />
        <Linha rotulo="Anulados" valor={inteiro(votos.anulados)} cor="#e4572e" recuo />
        <Linha
          rotulo="Anulados sub judice"
          valor={inteiro(votos.anuladosSubJudice)}
          cor="#f2c200"
          recuo
        />
        <Linha rotulo="Em branco" valor={inteiro(votos.brancos)} cor="#4a7fb5" />
        <Linha rotulo="Nulos" valor={inteiro(votos.nulos)} cor="#c9a7d8" />
      </Cartao>
      )}

      <Cartao titulo="Eleitorado">
        <Linha rotulo="Eleitorado apto" valor={inteiro(eleitorado.apto)} />
        <Linha
          rotulo="Apto nas seções totalizadas"
          valor={inteiro(eleitorado.aptoTotalizadas)}
        />
        <Linha
          rotulo="Comparecimento"
          valor={`${inteiro(eleitorado.comparecimento)} · ${percentual(eleitorado.percComparecimento)}`}
        />
        <Linha
          rotulo="Abstenção"
          valor={`${inteiro(eleitorado.abstencao)} · ${percentual(eleitorado.percAbstencao)}`}
        />
      </Cartao>
    </div>
  );
}
