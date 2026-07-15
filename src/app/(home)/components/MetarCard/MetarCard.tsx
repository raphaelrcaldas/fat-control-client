"use client";

import { useState } from "react";
import { Spinner } from "flowbite-react";
import {
   MdFlightTakeoff,
   MdRefresh,
   MdSchedule,
   MdTerrain,
} from "react-icons/md";
import { useMetar } from "@/hooks/queries/useMetar";
import { useRotaer } from "@/hooks/queries/useRotaer";
import { useSolHoje } from "@/hooks/queries/useSol";
import { parseMetar } from "./parser";
import { FlightCategoryBadge } from "./FlightCategoryBadge";
import { ParsedView } from "./ParsedView";
import { SolTiles } from "./SolTiles";
import { RawSection } from "./RawSection";

export function MetarCard() {
   const { data, isLoading, isError, error, dataUpdatedAt, refetch } =
      useMetar();
   const { data: sol, isLoading: solLoading, isError: solError } = useSolHoje();
   const { data: rotaer } = useRotaer(data?.icao ?? "");
   const [showRaw, setShowRaw] = useState(false);
   const [isRefreshing, setIsRefreshing] = useState(false);

   const parsed = data?.metar ? parseMetar(data.metar) : null;

   const updatedLabel = dataUpdatedAt
      ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR", {
           hour: "2-digit",
           minute: "2-digit",
        })
      : null;

   const icaoName = rotaer?.data?.name ?? data?.icao ?? "—";
   const utcOffset = rotaer?.data?.utc
      ? `UTC${rotaer.data.utc.startsWith("-") ? "" : "+"}${rotaer.data.utc}`
      : null;

   async function handleRefresh() {
      setIsRefreshing(true);
      await refetch();
      setTimeout(() => setIsRefreshing(false), 800);
   }

   return (
      <div className="rounded-2xl bg-white shadow-xl">
         {/* Header */}
         <div className="flex items-center justify-between rounded-t-2xl bg-linear-to-r from-red-600 to-red-600 px-6 py-4">
            <div className="flex items-center gap-3">
               <div className="rounded-lg bg-white/10 p-2">
                  <MdFlightTakeoff className="text-white" size={20} />
               </div>
               <div>
                  <p className="text-base font-semibold text-white">
                     {data?.icao ?? "—"}
                     {" · "}
                     <span className="font-normal text-white/70">
                        {icaoName}
                     </span>
                  </p>
                  {(utcOffset || rotaer?.data?.alt_ft != null) && (
                     <div className="mt-0.5 flex items-center gap-3 text-xs font-medium text-white">
                        {utcOffset && <span>{utcOffset}</span>}
                        {rotaer?.data?.alt_ft != null && (
                           <span className="flex items-center gap-1">
                              <MdTerrain size={13} />
                              {rotaer.data.alt_ft} ft
                           </span>
                        )}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-3">
               {parsed && <FlightCategoryBadge cat={parsed.flightCategory} />}
               <button
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="rounded-lg bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-40"
                  title="Atualizar METAR"
               >
                  <MdRefresh
                     size={18}
                     className={isRefreshing ? "animate-spin" : ""}
                  />
               </button>
            </div>
         </div>

         {/* Body */}
         <div className="p-6">
            {isLoading && (
               <div className="flex items-center justify-center gap-3 py-10">
                  <Spinner color="primary" />
                  <span className="text-sm text-gray-500">
                     Buscando METAR...
                  </span>
               </div>
            )}

            {isError && (
               <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  Erro ao buscar METAR:{" "}
                  {error instanceof Error
                     ? error.message
                     : "Falha desconhecida"}
               </div>
            )}

            {data && parsed && (
               <div className="space-y-4">
                  {/* Hora da observação */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                     <MdSchedule size={14} />
                     <span>
                        Observação: {parsed.day} às {parsed.time}
                     </span>
                     {updatedLabel && (
                        <>
                           <span className="text-gray-300">·</span>
                           <span>Atualizado às {updatedLabel}</span>
                        </>
                     )}
                  </div>

                  {/* Parsed fields */}
                  <ParsedView metar={parsed} />

                  {/* Nascer / Pôr do sol */}
                  <div className="grid grid-cols-2 gap-2">
                     <SolTiles
                        sol={sol}
                        solLoading={solLoading}
                        solError={solError}
                     />
                  </div>

                  {/* Raw toggle */}
                  <RawSection
                     showRaw={showRaw}
                     onToggle={() => setShowRaw((v) => !v)}
                     metar={data.metar}
                     taf={data.taf}
                  />
               </div>
            )}
         </div>
      </div>
   );
}
