"use client";

import { HiExclamationCircle, HiUserGroup } from "react-icons/hi";
import type { PernoiteRow } from "../hooks/useSimulacao";
import { useImpactoComissoes } from "../hooks/useImpactoComissoes";
import { ComissSearchInline } from "./ComissSearchInline";
import { ImpactoComissRow } from "./ImpactoComissRow";

interface ImpactoComissPanelProps {
   pnts: PernoiteRow[];
   acrecDesloc: boolean;
}

/**
 * Painel "e se estes militares voarem esta missão?": acopla comissionamentos
 * abertos, um por um, e mostra para onde a completude de cada um iria.
 *
 * Vive fora do fluxo do cálculo de custo — a projeção é uma consulta
 * paralela, que se refaz sozinha quando os pernoites ou a lista de acoplados
 * mudam (ver `useImpactoComissoes`). Nada aqui altera o custo total da
 * missão: o comissionamento só muda quando a missão é cadastrada.
 */
export function ImpactoComissPanel({
   pnts,
   acrecDesloc,
}: ImpactoComissPanelProps) {
   const {
      disponiveis,
      carregandoAbertos,
      acoplados,
      acoplar,
      desacoplar,
      impactos,
      projetando,
      erro,
   } = useImpactoComissoes({ pnts, acrecDesloc });

   const porId = new Map(impactos.map((i) => [i.comiss.id, i]));

   // Espinha âmbar como BORDA, não como `span` absoluto sobre
   // `overflow-hidden` (o padrão do Masthead): aqui dentro mora um dropdown
   // `absolute` que o recorte cortaria pela metade.
   return (
      <section className="relative rounded border border-l-4 border-slate-200 border-l-amber-400 bg-white p-4 shadow-sm">
         <div className="mb-3 flex items-center justify-between gap-2">
            <div>
               {/* `h2`: o único título acima na página é o `h1` do masthead —
                   um `h3` aqui pularia nível. */}
               <h2 className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.3em] text-amber-700 uppercase">
                  Impacto no comissionamento
                  {acoplados.length > 0 && (
                     <span className="rounded-[1px] bg-amber-100 px-1.5 py-0.5 tracking-normal text-amber-900 tabular-nums">
                        {acoplados.length}
                     </span>
                  )}
               </h2>
               <p className="mt-1 text-xs text-slate-500">
                  Projeção local — nada é gravado.
               </p>
            </div>
            {projetando && (
               <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] tracking-wider text-amber-700 uppercase">
                  <span
                     aria-hidden
                     className="animate-sandbox-pulse size-2 rounded-[1px] bg-amber-400"
                  />
                  projetando
               </span>
            )}
         </div>

         <ComissSearchInline
            disponiveis={disponiveis}
            carregando={carregandoAbertos}
            onAcoplar={acoplar}
         />

         {erro && (
            <p className="mt-3 flex items-start gap-1.5 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
               <HiExclamationCircle
                  className="mt-0.5 size-3.5 shrink-0"
                  aria-hidden
               />
               <span>{erro}</span>
            </p>
         )}

         {acoplados.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 rounded border border-dashed border-slate-200 px-4 py-6 text-center">
               <HiUserGroup className="size-6 text-slate-300" aria-hidden />
               <p className="text-sm text-slate-600">
                  Busque um militar comissionado para ver quanto esta missão
                  adiantaria a contagem dele.
               </p>
            </div>
         ) : (
            <div className="mt-3 divide-y divide-slate-100">
               {acoplados.map((c) => (
                  <ImpactoComissRow
                     key={c.id}
                     comiss={c}
                     impacto={porId.get(c.id) ?? null}
                     onRemover={() => desacoplar(c.id!)}
                  />
               ))}
            </div>
         )}
      </section>
   );
}
