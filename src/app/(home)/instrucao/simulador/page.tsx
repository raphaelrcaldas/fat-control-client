"use client";

import { useState, useMemo } from "react";
import { Alert, Label, Select, Spinner } from "flowbite-react";
import { MdFlightTakeoff } from "react-icons/md";
import { useEtapas } from "@/hooks/queries";
import { minutesToTime } from "@/../utils/dateHandler";
import type {
   MissaoComEtapas,
   EtapaItem,
   TripEtapaItem,
} from "services/routes/estatistica/etapas";
import DuplasSidebar, { type Dupla } from "./components/DuplasSidebar";
import SessaoCard from "./components/SessaoCard";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);

function buildDuplas(missoes: MissaoComEtapas[]): Dupla[] {
   const map = new Map<string, Dupla>();
   for (const missao of missoes) {
      const pilotsMap = new Map<number, TripEtapaItem>();
      for (const etapa of missao.etapas) {
         for (const trip of etapa.tripulantes) {
            pilotsMap.set(trip.trip_id, trip);
         }
      }
      if (pilotsMap.size === 0) continue;
      const sorted = Array.from(pilotsMap.values()).sort(
         (a, b) => a.trip_id - b.trip_id
      );
      const key = sorted.map((t) => t.trip_id).join("-");
      if (!map.has(key)) {
         map.set(key, { key, pilots: sorted, etapas: [] });
      }
      const dupla = map.get(key);
      if (dupla) {
         for (const etapa of missao.etapas) {
            dupla.etapas.push(etapa);
         }
      }
   }
   return Array.from(map.values()).sort((a, b) =>
      (a.pilots[0]?.nome_guerra ?? "").localeCompare(
         b.pilots[0]?.nome_guerra ?? ""
      )
   );
}

export default function SimuladorPage() {
   const [selectedKey, setSelectedKey] = useState<string | null>(null);
   const [search, setSearch] = useState("");
   const [anoRef, setAnoRef] = useState(currentYear);

   const { data, isLoading, isError } = useEtapas({
      anv: ["2850"],
      excluir_sim: false,
      per_page: 200,
      data_ini: `${anoRef}-01-01`,
      data_fim: `${anoRef}-12-31`,
   });

   const duplas = useMemo(() => buildDuplas(data?.items ?? []), [data]);

   const selectedDupla = useMemo(
      () => duplas.find((d) => d.key === selectedKey) ?? null,
      [duplas, selectedKey]
   );

   const totalMin = duplas.reduce(
      (sum, d) => sum + d.etapas.reduce((s, e) => s + e.tvoo, 0),
      0
   );

   return (
      <div className="flex flex-col gap-6 p-1">
         <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 shadow-md">
                  <MdFlightTakeoff className="h-6 w-6 text-white" />
               </div>
               <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                     Simulador de Voo
                  </h1>
                  <p className="text-sm text-gray-500">
                     Sessões de simulador agrupadas por duplas de pilotos
                  </p>
               </div>
               <div className="ml-auto flex flex-wrap items-center gap-3">
                  <Label htmlFor="anoRef" className="font-medium text-gray-700">
                     Ano Referência:
                  </Label>
                  <Select
                     id="anoRef"
                     value={anoRef}
                     onChange={(e) => {
                        setAnoRef(Number(e.target.value));
                        setSelectedKey(null);
                     }}
                     className="w-24"
                  >
                     {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>
                           {year}
                        </option>
                     ))}
                  </Select>
                  {!isLoading && !isError && (
                     <>
                        <div className="flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-1.5">
                           <span className="text-lg font-semibold text-purple-800">
                              {duplas.length}
                           </span>
                           <span className="text-xs text-purple-500">
                              duplas
                           </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5">
                           <span className="font-mono text-lg font-semibold text-gray-800">
                              {minutesToTime(totalMin)}
                           </span>
                           <span className="text-xs text-gray-500">
                              h total
                           </span>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>

         {isError && (
            <Alert color="failure">
               Erro ao carregar as sessões do simulador. Verifique a conexão e
               tente novamente.
            </Alert>
         )}

         {isLoading ? (
            <div className="flex justify-center py-16">
               <Spinner color="failure" size="lg" />
            </div>
         ) : (
            !isError && (
               <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex min-h-[480px]">
                     <DuplasSidebar
                        duplas={duplas}
                        selectedKey={selectedKey}
                        search={search}
                        onSearchChange={setSearch}
                        onSelect={(key) =>
                           setSelectedKey((prev) => (prev === key ? null : key))
                        }
                     />

                     <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                        {!selectedDupla ? (
                           <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                              <MdFlightTakeoff className="h-12 w-12 opacity-30" />
                              <p className="text-sm">
                                 Selecione uma dupla para ver as sessões
                              </p>
                           </div>
                        ) : (
                           <div className="flex flex-col gap-3">
                              {selectedDupla.etapas
                                 .slice()
                                 .sort(
                                    (a, b) =>
                                       new Date(a.data).getTime() -
                                       new Date(b.data).getTime()
                                 )
                                 .map((etapa: EtapaItem) => (
                                    <SessaoCard key={etapa.id} etapa={etapa} />
                                 ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )
         )}
      </div>
   );
}
