import { isoDateToShort } from "@/../utils/dateHandler";
import { faixasPresenca } from "./pessoalAgrupado";
import type { OperacaoPessoalOut } from "services/routes/ops/operacoes";

interface Props {
   periodos: OperacaoPessoalOut[];
   opInicio: string;
   opFim: string;
}

/**
 * Presença de um militar dentro do período da operação.
 *
 * Ingresso e regresso são duas datas soltas na tabela; como faixa sobre a
 * régua da operação, dá para varrer a coluna e ver quem esteve o tempo todo,
 * quem chegou depois e quem saiu antes.
 *
 * Suporta mais de uma faixa: o mesmo militar pode ter dois períodos na mesma
 * operação (ver `pessoalAgrupado`). O intervalo entre elas fica no fundo
 * neutro, e é justamente esse vão que comunica a ausência.
 */
export function BarraPresenca({ periodos, opInicio, opFim }: Props) {
   const faixas = faixasPresenca(periodos, opInicio, opFim);
   if (faixas.length === 0) return null;

   const titulo = periodos
      .map(
         (p) =>
            `${isoDateToShort(p.data_ingresso)} → ${isoDateToShort(p.data_regresso)}`
      )
      .join(" · ");

   return (
      <span
         title={titulo}
         className="relative block h-3.5 w-full min-w-[120px] rounded-sm bg-slate-100 ring-1 ring-slate-200 ring-inset"
      >
         <span className="sr-only">{titulo}</span>
         {faixas.map((f, i) => (
            <span
               key={i}
               aria-hidden
               className="absolute top-[3px] h-2 rounded-[2px] bg-slate-500"
               style={{ left: `${f.leftPct}%`, width: `${f.widthPct}%` }}
            />
         ))}
      </span>
   );
}
