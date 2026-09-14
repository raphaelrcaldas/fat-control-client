import type { OperacaoEtapaRow } from "services/routes/ops/operacoes";

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/**
 * Um número de consumo da etapa (pax, carga, combustível, lubrificante).
 *
 * Os quatro são opcionais na origem, e `null` ali é "não foi informado" — não
 * zero. Um traço afirma menos que um `0`, que diria que a etapa levou zero
 * passageiro ou não queimou combustível. O `title` carrega a distinção para
 * quem passa o mouse, e o `sr-only` para quem não vê a tela.
 */
export function Consumo({ valor }: { valor: number | null }) {
   if (valor == null) {
      return (
         <span className="text-slate-400" title="Não informado">
            <span aria-hidden>—</span>
            <span className="sr-only">não informado</span>
         </span>
      );
   }
   return <>{nf.format(valor)}</>;
}

/** Os quatro campos de consumo de uma etapa. */
type EtapaConsumo = Pick<OperacaoEtapaRow, "pax" | "carga" | "comb" | "lub">;

/**
 * A linha de consumo da etapa no mobile.
 *
 * Os quatro números não cabem como colunas em 360px; aqui viram uma linha
 * própria, rotulados e com a unidade junto — no desktop a unidade fica no
 * cabeçalho, que não se repete por etapa.
 *
 * Some inteira quando a etapa não informou nenhum dos quatro: uma linha só com
 * traços ocuparia altura para não dizer nada.
 */
export function ConsumoLinha({ etapa }: { etapa: EtapaConsumo }) {
   const { pax, carga, comb, lub } = etapa;
   if (pax == null && carga == null && comb == null && lub == null) return null;

   return (
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-slate-600 tabular-nums">
         <span>
            <span className="text-slate-500">Pax </span>
            <Consumo valor={pax} />
         </span>
         <span>
            <span className="text-slate-500">Carga </span>
            <Consumo valor={carga} /> kg
         </span>
         <span>
            <span className="text-slate-500">Comb </span>
            <Consumo valor={comb} /> L
         </span>
         <span>
            <span className="text-slate-500">Lub </span>
            <Consumo valor={lub} /> L
         </span>
      </div>
   );
}
