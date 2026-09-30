import { KpiCard } from "@/components/ui/KpiCard";
import { PainelResumo } from "./PainelResumo";
import { EtapasResumo } from "./EtapasResumo";

/** Espelha o dossiê: identificação, indicadores, distribuição e as duas listas. */
export function OperacaoDetailSkeleton() {
   return (
      <div role="status" className="space-y-2">
         <span className="sr-only">Carregando operação…</span>
         <div aria-hidden className="mx-auto max-w-[96rem] space-y-4">
            <section className="min-h-[206px] overflow-hidden rounded border border-slate-200 bg-white shadow-sm md:min-h-[127px]">
               <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="min-w-0 space-y-1.5">
                     <div className="flex items-center gap-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                     </div>
                     <div className="h-[26.25px] w-64 max-w-full animate-pulse rounded bg-slate-200 sm:h-[35px]" />
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                     <div className="h-[31.5px] w-28 animate-pulse rounded-md bg-slate-100" />
                     <div className="h-[31.5px] w-20 animate-pulse rounded-md bg-slate-100" />
                     <div className="size-[31.5px] animate-pulse rounded-md bg-slate-100" />
                  </div>
               </div>
               <div className="grid grid-cols-2 border-t border-slate-200 bg-slate-50/70 md:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                     <div
                        key={i}
                        className="min-w-0 space-y-1 border-slate-200 px-4 py-2 not-first:border-l max-md:nth-[n+3]:border-t max-md:nth-[odd]:border-l-0 sm:px-5"
                     >
                        <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-36 max-w-full animate-pulse rounded bg-slate-200" />
                     </div>
                  ))}
               </div>
            </section>

            <section className="space-y-2">
               <div className="flex h-[15px] items-center gap-2">
                  <span className="h-2.5 w-20 animate-pulse rounded bg-slate-200" />
                  <span className="h-px flex-1 bg-slate-200" />
               </div>
               <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                  {[
                     "Horas voadas",
                     "Etapas",
                     "Aeronaves",
                     "Efetivo",
                     "Pax transportados",
                     "Carga transportada",
                     "Combustível consumido",
                     "Lubrificante consumido",
                  ].map((label) => (
                     <KpiCard
                        key={label}
                        label={label}
                        icon={
                           <span className="size-5 animate-pulse rounded bg-slate-200" />
                        }
                        value={null}
                        isLoading
                        reservaSub
                     />
                  ))}
               </div>
               <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">
                     Sem registro nesta operação:
                  </span>
                  {["w-20", "w-24", "w-36"].map((w) => (
                     <span
                        key={w}
                        className={`h-[17.5px] ${w} animate-pulse rounded bg-slate-100 px-1.5 py-0.5`}
                     />
                  ))}
               </p>
            </section>

            <section className="space-y-2">
               <div className="flex h-[15px] items-center gap-2">
                  <span className="h-2.5 w-24 animate-pulse rounded bg-slate-200" />
                  <span className="h-3 w-36 animate-pulse rounded bg-slate-100" />
                  <span className="h-px flex-1 bg-slate-200" />
               </div>
               <div className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2">
                  {["Esforço aéreo", "Pau de sebo"].map((titulo, i) => (
                     <PainelResumo
                        key={titulo}
                        titulo={titulo}
                        filtro={
                           i === 1 ? (
                              <div className="flex w-fit items-center gap-0.5 rounded-md bg-slate-200/70 p-0.5">
                                 {[0, 1, 2].map((f) => (
                                    <div
                                       key={f}
                                       className="h-[23.5px] w-16 animate-pulse rounded bg-slate-100"
                                    />
                                 ))}
                              </div>
                           ) : undefined
                        }
                     >
                        <div
                           className={
                              i === 1 ? "h-[198px] overflow-hidden" : undefined
                           }
                        >
                           <div className="h-[29px] border-b border-slate-200 bg-slate-50" />
                           <div className="divide-y divide-slate-100">
                              {[0, 1, 2, 3, 4].map((r) => (
                                 <div
                                    key={r}
                                    className="flex items-center gap-3 px-3 py-2"
                                 >
                                    <div className="min-w-0 flex-1">
                                       <div
                                          className={
                                             i === 1
                                                ? "h-[18px] w-36 max-w-full animate-pulse rounded bg-slate-200"
                                                : "h-[17.5px] w-36 max-w-full animate-pulse rounded bg-slate-200"
                                          }
                                       />
                                       {i === 0 && r < 4 && (
                                          <div className="mt-1 h-[3px] w-24 animate-pulse rounded-sm bg-slate-100" />
                                       )}
                                    </div>
                                    <div className="h-[17.5px] w-8 animate-pulse rounded bg-slate-100" />
                                    <div className="h-[17.5px] w-12 animate-pulse rounded bg-slate-100" />
                                 </div>
                              ))}
                           </div>
                        </div>
                        {i === 1 && (
                           <div className="flex h-[29px] items-center justify-center border-t border-slate-200 bg-slate-50">
                              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                           </div>
                        )}
                     </PainelResumo>
                  ))}
               </div>
            </section>

            <div className="grid grid-cols-1 items-start gap-4 2xl:grid-cols-2">
               <section className="space-y-2">
                  <div className="flex h-[15px] items-center gap-2">
                     <span className="h-2.5 w-12 animate-pulse rounded bg-slate-200" />
                     <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <EtapasResumo
                     etapas={[]}
                     carregando
                     anunciarCarregamento={false}
                     onVerTudo={() => {}}
                     onAssociar={() => {}}
                  />
               </section>
               <section className="space-y-2">
                  <div className="flex h-[15px] items-center gap-2">
                     <span className="h-2.5 w-14 animate-pulse rounded bg-slate-200" />
                     <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <PainelResumo titulo="Militares envolvidos">
                     <div className="divide-y divide-slate-100 md:h-[193px] md:overflow-hidden">
                        {[0, 1, 2, 3, 4].map((i) => (
                           <div
                              key={i}
                              className="flex items-center gap-3 px-3 py-2.5"
                           >
                              <div className="h-3.5 w-36 animate-pulse rounded bg-slate-200" />
                              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                              <div className="ml-auto h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                           </div>
                        ))}
                     </div>
                     <div className="flex h-[29px] items-center justify-center border-t border-slate-200 bg-slate-50">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                     </div>
                  </PainelResumo>
               </section>
            </div>
         </div>
      </div>
   );
}
