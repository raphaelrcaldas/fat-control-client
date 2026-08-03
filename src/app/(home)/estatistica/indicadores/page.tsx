"use client";

import { useState } from "react";
import { Select, Label } from "flowbite-react";
import { MdInsights } from "react-icons/md";
import clsx from "clsx";
import { useIndicadores } from "@/hooks/queries";
import { useOrgProjetos } from "@/hooks/queries/useAeronaves";
import { YEAR_OPTIONS } from "./constants";
import { IndicadoresKpis } from "./components/IndicadoresKpis";
import { IndicadoresMatriz } from "./components/IndicadoresMatriz";
import { IndicadoresQuebras } from "./components/IndicadoresQuebras";
import { IndicadoresFrota } from "./components/IndicadoresFrota";
import { IndicadoresSkeleton } from "./components/IndicadoresSkeleton";

export default function IndicadoresPage() {
   const [anoRef, setAnoRef] = useState(() => new Date().getFullYear());
   // "" = todos os projetos operados pela org ativa.
   const [projeto, setProjeto] = useState("");

   const { data: projetos } = useOrgProjetos();
   const { data, isLoading, isFetching, error, refetch } = useIndicadores(
      anoRef,
      projeto || undefined
   );

   const showSkeleton = isLoading || (isFetching && !data);
   const isRefetching = !showSkeleton && isFetching;
   const semDados = !!data && data.totais.etapas === 0;

   return (
      <div className="flex flex-col space-y-2">
         {/* Masthead — mesma linguagem tática das demais telas do sistema */}
         <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            <span
               aria-hidden
               className="bg-primary-600 absolute top-0 left-0 h-full w-1"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="bg-primary-50 text-primary-600 ring-primary-100 grid h-12 w-12 shrink-0 place-items-center rounded-md ring-1 ring-inset">
                     <MdInsights className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                     <span className="text-primary-600 block font-mono text-[10px] font-bold tracking-[0.3em] uppercase">
                        Estatística
                     </span>
                     <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                        Indicadores
                     </h1>
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="flex items-center gap-2">
                     <Label
                        htmlFor="projeto"
                        className="font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase"
                     >
                        Projeto
                     </Label>
                     <Select
                        id="projeto"
                        value={projeto}
                        onChange={(e) => setProjeto(e.target.value)}
                        className="w-36"
                     >
                        <option value="">Todos</option>
                        {(projetos ?? []).map((p) => (
                           <option key={p.id_projeto} value={p.id_projeto}>
                              {p.modelo}
                           </option>
                        ))}
                     </Select>
                  </div>

                  <div className="flex items-center gap-2">
                     <Label
                        htmlFor="anoRef"
                        className="font-mono text-[11px] font-bold tracking-wider text-slate-500 uppercase"
                     >
                        Ano
                     </Label>
                     <Select
                        id="anoRef"
                        value={anoRef}
                        onChange={(e) => setAnoRef(Number(e.target.value))}
                        className="w-24"
                     >
                        {YEAR_OPTIONS.map((year) => (
                           <option key={year} value={year}>
                              {year}
                           </option>
                        ))}
                     </Select>
                  </div>
               </div>
            </div>
         </header>

         {/* Falha de carga nunca pode ser exibida como painel vazio. */}
         {error && (
            <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
               <p className="font-semibold">
                  Não foi possível carregar os indicadores.
               </p>
               <p className="mt-1 text-rose-700">{(error as Error).message}</p>
               <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-2 rounded border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 pointer-coarse:min-h-[44px]"
               >
                  Tentar novamente
               </button>
            </div>
         )}

         {showSkeleton ? (
            <IndicadoresSkeleton />
         ) : !data ? null : semDados ? (
            <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
               <p className="text-sm font-semibold text-slate-600">
                  Nenhum voo registrado em {anoRef}
               </p>
               <p className="mt-1 text-xs text-slate-500">
                  {projeto
                     ? "Nenhuma etapa deste projeto no período. Tente outro projeto ou ano."
                     : "Selecione outro ano de referência."}
               </p>
            </div>
         ) : (
            <div
               className={clsx(
                  "space-y-2 transition-opacity duration-200",
                  isRefetching && "pointer-events-none opacity-50"
               )}
            >
               <IndicadoresKpis
                  totais={data.totais}
                  pqdPorTipo={data.pqd_por_tipo}
                  lancamentos={data.lancamentos}
               />
               <IndicadoresMatriz
                  mensal={data.mensal}
                  totais={data.totais}
                  anoRef={data.ano_ref}
               />
               <IndicadoresQuebras
                  porRegime={data.por_regime}
                  porTipoMissao={data.por_tipo_missao}
               />
               <IndicadoresFrota porAeronave={data.por_aeronave} />
            </div>
         )}
      </div>
   );
}
