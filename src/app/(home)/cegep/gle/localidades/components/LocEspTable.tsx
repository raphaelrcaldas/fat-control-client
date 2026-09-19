"use client";

import { useMemo } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   Tooltip,
} from "flowbite-react";
import clsx from "clsx";
import { HiPencilAlt } from "react-icons/hi";

import {
   compareValues,
   SortableHeadCell,
   useSortConfig,
} from "@/components/ui/SortableTable";
import { usePermBased } from "@/app/(home)/hooks/usePermBased";
import { fusoLabel, type LocEsp } from "services/routes/cegep/gle";

import { GrupoBadge } from "./GrupoBadge";

type SortKey = "cidade" | "uf" | "grupo" | "fuso" | "icaos";

interface LocEspTableProps {
   localidades: LocEsp[];
   onEdit: (loc: LocEsp) => void;
}

export function LocEspTable({ localidades, onEdit }: LocEspTableProps) {
   const { hasPerm } = usePermBased();
   const podeEditar = hasPerm("cegep.gle", "update");
   const { sortConfig, requestSort } = useSortConfig<SortKey>({
      key: "cidade",
      direction: "asc",
   });

   const ordenadas = useMemo(() => {
      const valor = (loc: LocEsp) => {
         switch (sortConfig.key) {
            case "cidade":
               return loc.cidade.nome;
            case "uf":
               return loc.cidade.uf;
            case "grupo":
               return loc.grupo;
            case "fuso":
               return loc.fuso;
            case "icaos":
               return loc.icaos.length;
         }
      };
      return [...localidades].sort((a, b) =>
         compareValues(valor(a), valor(b), sortConfig.direction)
      );
   }, [localidades, sortConfig]);

   return (
      <div className="overflow-x-auto">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <SortableHeadCell
                     label="Município"
                     sortKey="cidade"
                     sortConfig={sortConfig}
                     onSort={requestSort}
                     align="left"
                  />
                  <SortableHeadCell
                     label="UF"
                     sortKey="uf"
                     sortConfig={sortConfig}
                     onSort={requestSort}
                  />
                  <SortableHeadCell
                     label="Grupo"
                     sortKey="grupo"
                     sortConfig={sortConfig}
                     onSort={requestSort}
                  />
                  <SortableHeadCell
                     label="Fuso"
                     sortKey="fuso"
                     sortConfig={sortConfig}
                     onSort={requestSort}
                  />
                  <TableHeadCell className="bg-slate-50 text-left!">
                     Aeródromos
                  </TableHeadCell>
                  <TableHeadCell className="w-px bg-slate-50">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>

            <TableBody className="divide-y">
               {ordenadas.map((loc) => (
                  <TableRow key={loc.id} className="bg-white">
                     <TableCell className="max-w-[220px] font-medium text-slate-900">
                        <span
                           className="block truncate"
                           title={loc.cidade.nome}
                        >
                           {loc.cidade.nome}
                        </span>
                     </TableCell>

                     <TableCell className="text-center font-mono text-xs text-slate-600">
                        {loc.cidade.uf}
                     </TableCell>

                     <TableCell className="text-center">
                        <GrupoBadge grupo={loc.grupo} />
                     </TableCell>

                     <TableCell className="text-center font-mono text-xs whitespace-nowrap text-slate-600">
                        {fusoLabel(loc.fuso)}
                     </TableCell>

                     <TableCell>
                        {/* Vários ICAOs por município é a regra, não a exceção
                            (Manaus tem dois). Chips numa linha só, sem quebrar. */}
                        <div className="flex flex-wrap gap-1">
                           {loc.icaos.map((icao) => (
                              <span
                                 key={icao}
                                 className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-700"
                              >
                                 {icao}
                              </span>
                           ))}
                           {loc.icaos.length === 0 && (
                              <span
                                 className="text-xs text-amber-700"
                                 title="Sem ICAO, esta localidade não aparece na pesquisa de etapas"
                              >
                                 sem aeródromo
                              </span>
                           )}
                        </div>
                     </TableCell>

                     <TableCell className="text-right">
                        <Tooltip
                           content={
                              podeEditar
                                 ? "Editar localidade"
                                 : "Você não tem permissão para editar"
                           }
                        >
                           <button
                              type="button"
                              onClick={() => onEdit(loc)}
                              disabled={!podeEditar}
                              aria-label={`Editar ${loc.cidade.nome} - ${loc.cidade.uf}`}
                              className={clsx(
                                 "grid h-[32px] w-[32px] place-items-center rounded transition-colors",
                                 podeEditar
                                    ? "hover:bg-primary-50 hover:text-primary-600 text-slate-400"
                                    : "cursor-not-allowed text-slate-300"
                              )}
                           >
                              <HiPencilAlt className="h-4 w-4" />
                           </button>
                        </Tooltip>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
