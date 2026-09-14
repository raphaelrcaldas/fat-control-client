import { isoDateToShort } from "@/../utils/dateHandler";
import { diasFora, faixasPresenca } from "./pessoalAgrupado";
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

   const vaos = diasFora(periodos);
   const titulo = periodos
      .map(
         (p) =>
            `${isoDateToShort(p.data_ingresso)} → ${isoDateToShort(p.data_regresso)}`
      )
      .join(" · ");
   const ausencia = vaos.reduce((a, b) => a + b, 0);
   const descricao =
      ausencia > 0
         ? `${titulo} — ${ausencia} ${ausencia === 1 ? "dia fora" : "dias fora"}`
         : titulo;

   return (
      <span
         title={descricao}
         className="relative block h-3.5 w-full min-w-[120px] rounded-sm bg-slate-100 ring-1 ring-slate-200 ring-inset"
      >
         <span className="sr-only">{descricao}</span>
         {/* O vão entre duas faixas é a ausência. Hachurar em vez de deixar no
             fundo neutro distingue "esteve fora" de "a operação ainda não
             começou" — os dois são o mesmo cinza claro. */}
         {faixas.slice(0, -1).map((f, i) => {
            const proxima = faixas[i + 1];
            const inicio = f.leftPct + f.widthPct;
            const largura = proxima.leftPct - inicio;
            if (largura <= 0) return null;
            return (
               <span
                  key={`vao-${i}`}
                  aria-hidden
                  className="absolute top-[3px] h-2 rounded-[2px] bg-[repeating-linear-gradient(45deg,var(--color-amber-500)_0_2px,transparent_2px_5px)]"
                  style={{ left: `${inicio}%`, width: `${largura}%` }}
               />
            );
         })}
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
