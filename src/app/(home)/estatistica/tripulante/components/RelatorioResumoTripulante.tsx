import { DataRelatorio } from "./DataRelatorio";
import { minutesToTime } from "utils/dateHandler";
import clsx from "clsx";
import type {
   RelatorioAnual,
   ResumoAnual,
} from "services/routes/estatistica/relatorioAnual";

export function RelatorioResumoTripulante({
   tripulante: trip,
   aeronaves,
   simuladores,
   periodo = "ano",
   mostrarUltimoVoo = true,
}: {
   tripulante: RelatorioAnual["tripulante"];
   aeronaves: Pick<ResumoAnual, "total">;
   simuladores: Pick<ResumoAnual, "total">;
   periodo?: "ano" | "mês";
   mostrarUltimoVoo?: boolean;
}) {
   return (
      <div className="grid gap-3 rounded border border-slate-200 bg-white px-4 py-3 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
         <section
            className="min-w-0 space-y-1"
            aria-label="Identificação do tripulante"
         >
            <div className="flex items-baseline gap-3">
               <p
                  className="min-w-0 truncate text-base font-semibold text-slate-900 uppercase"
                  title={`${trip.p_g} ${trip.nome_guerra}`}
               >
                  {trip.p_g} {trip.nome_guerra}
               </p>
               <span className="shrink-0 text-xs font-semibold text-slate-600 uppercase">
                  {trip.trig}
               </span>
            </div>
            {trip.nome_completo && (
               <p
                  className="truncate text-xs text-slate-600 uppercase"
                  title={trip.nome_completo}
               >
                  {trip.nome_completo}
               </p>
            )}
         </section>
         <section
            aria-label={`Resumo do ${periodo}`}
            className={clsx(
               "border-t border-slate-200 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6",
               mostrarUltimoVoo ? "lg:min-w-96" : "lg:min-w-64"
            )}
         >
            <dl
               className={clsx(
                  "grid gap-3",
                  mostrarUltimoVoo ? "grid-cols-3" : "grid-cols-2"
               )}
            >
               {[
                  {
                     titulo: "Aeronaves",
                     valor: minutesToTime(aeronaves.total.tvoo),
                  },
                  {
                     titulo: "Simuladores",
                     valor: minutesToTime(simuladores.total.tvoo),
                  },
                  ...(mostrarUltimoVoo
                     ? [
                          {
                             titulo: "Último voo (ANV)",
                             valor: (
                                <DataRelatorio
                                   data={aeronaves.total.ultimo_voo}
                                />
                             ),
                             dica: "Último voo em aeronave; simulador não conta",
                          },
                       ]
                     : []),
               ].map(({ titulo, valor, dica }) => (
                  <div key={titulo}>
                     <dt className="text-xs text-slate-600" title={dica}>
                        {titulo}
                     </dt>
                     <dd className="text-xl font-semibold text-slate-900 tabular-nums">
                        {valor}
                     </dd>
                  </div>
               ))}
            </dl>
         </section>
      </div>
   );
}
