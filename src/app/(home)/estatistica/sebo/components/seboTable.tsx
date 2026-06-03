"use client";
import clsx from "clsx";
import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
} from "flowbite-react";
import Tooltip from "./tooltip";
import { minutesToTime, isoDateToString } from "@/../utils/dateHandler";
import type { SeboTripItem } from "services/routes/estatistica/sebo";
import { INFO_COLUMNS, PILOT_ONLY_COLUMNS, type InfoColumn } from "../page";

interface SeboTableProps {
   trips: SeboTripItem[];
   activeRow: number;
   setRow: (index: number) => void;
   isLoading: boolean;
   infoCols: Record<InfoColumn, boolean>;
   isPilot: boolean;
}

const getDaysUntil = (isoDate: string): number => {
   const date = new Date(isoDate + "T00:00:00");
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getDateColor = (isoDate: string | null): string => {
   const styles =
      "rounded-lg text-white font-semibold font-mono px-2 py-1 text-xs inline-block cursor-help";

   if (!isoDate) return styles + " bg-slate-500";

   const diffDays = getDaysUntil(isoDate);
   if (diffDays <= 0) return styles + " bg-red-500";
   if (diffDays <= 30) return styles + " bg-yellow-400 text-gray-800";
   return styles + " bg-green-500";
};

const getDateTooltip = (isoDate: string | null, label: string): string => {
   if (!isoDate) return `${label} não informado`;

   const diffDays = getDaysUntil(isoDate);
   const formatted = isoDateToString(isoDate);
   if (diffDays <= 0)
      return `${label} vencido há ${Math.abs(diffDays)} dias (${formatted})`;
   return `${label} vence em ${diffDays} dias (${formatted})`;
};

const getDsvColor = (value: number | null): string => {
   const styles =
      "rounded-lg text-white font-semibold px-2 py-1 text-xs inline-block min-w-[40px] text-center";

   if (value === null) return styles + " bg-slate-500";
   if (value > 45) return styles + " bg-red-500";
   if (value > 30) return styles + " bg-yellow-400 text-gray-800";
   return styles + " bg-green-500";
};

const getDsvTooltip = (dataUltVoo: string | null): string => {
   if (!dataUltVoo) return "Sem dados de voo";
   return isoDateToString(dataUltVoo);
};

const getOperBadgeClasses = (oper: string): string => {
   const lower = oper.toLowerCase();
   if (lower === "al") return "bg-green-100 text-green-700";
   if (lower === "op") return "bg-yellow-100 text-yellow-700";
   if (lower === "in") return "bg-red-100 text-red-700";
   if (lower === "ba") return "bg-orange-100 text-orange-700";
   return "bg-gray-100 text-gray-700";
};

const SKELETON_ROWS = 8;

const SkeletonCell = ({ width = "w-12" }: { width?: string }) => (
   <div className={`mx-auto h-4 animate-pulse rounded bg-gray-200 ${width}`} />
);

const SeboTable = ({
   trips,
   activeRow,
   setRow,
   isLoading,
   infoCols,
   isPilot,
}: SeboTableProps) => {
   // Coluna visível: ligada no toggle e, se for exclusiva de piloto,
   // só quando a função selecionada é Piloto.
   const showCol = (col: InfoColumn): boolean =>
      infoCols[col] && (isPilot || !PILOT_ONLY_COLUMNS.includes(col));

   const visibleInfoCount = INFO_COLUMNS.filter(showCol).length;

   return (
      <div
         className={clsx(
            "overflow-x-auto rounded-xl bg-white uppercase shadow-md ring-1 ring-gray-200",
            {
               "opacity-60": isLoading,
            }
         )}
      >
         <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="hidden text-center 2xl:table-cell">
                     PG
                  </TableHeadCell>
                  <TableHeadCell className="hidden min-w-40 text-center 2xl:table-cell">
                     NOME DE GUERRA
                  </TableHeadCell>
                  <TableHeadCell className="px-4 text-center">
                     TRIG
                  </TableHeadCell>
                  <TableHeadCell className="px-4 text-center">OP</TableHeadCell>
                  <TableHeadCell className="px-4 text-center">
                     DSV
                  </TableHeadCell>
                  {infoCols.cemal && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        CEMAL
                     </TableHeadCell>
                  )}
                  {infoCols.tovn && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        TOVN
                     </TableHeadCell>
                  )}
                  {infoCols.imae && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        IMAE
                     </TableHeadCell>
                  )}
                  {infoCols.crm && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        CRM
                     </TableHeadCell>
                  )}
                  {infoCols.val_pass && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        PASS
                     </TableHeadCell>
                  )}
                  {infoCols.val_visa && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        VISA
                     </TableHeadCell>
                  )}
                  {showCol("cvi") && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        CVI
                     </TableHeadCell>
                  )}
                  {showCol("ptai") && (
                     <TableHeadCell className="hidden text-center md:table-cell">
                        PTAI
                     </TableHeadCell>
                  )}
                  <TableHeadCell className="px-6 text-center">
                     ANO
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {isLoading ? (
                  Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                     <TableRow key={`skeleton-${index}`}>
                        <TableCell className="hidden 2xl:table-cell">
                           <SkeletonCell width="w-8" />
                        </TableCell>
                        <TableCell className="hidden 2xl:table-cell">
                           <SkeletonCell width="w-24" />
                        </TableCell>
                        <TableCell>
                           <SkeletonCell width="w-10" />
                        </TableCell>
                        <TableCell>
                           <SkeletonCell width="w-10" />
                        </TableCell>
                        <TableCell>
                           <SkeletonCell width="w-10" />
                        </TableCell>
                        {infoCols.cemal && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {infoCols.tovn && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {infoCols.imae && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {infoCols.crm && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {infoCols.val_pass && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {infoCols.val_visa && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {showCol("cvi") && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        {showCol("ptai") && (
                           <TableCell className="hidden md:table-cell">
                              <SkeletonCell width="w-16" />
                           </TableCell>
                        )}
                        <TableCell>
                           <SkeletonCell width="w-12" />
                        </TableCell>
                     </TableRow>
                  ))
               ) : trips.length > 0 ? (
                  trips.map((trip, index) => (
                     <TableRow
                        key={trip.trip_id}
                        onClick={() => setRow(index)}
                        className={clsx(
                           "cursor-pointer border-l-4 transition-all duration-150",
                           {
                              "border-l-blue-500 bg-blue-50! hover:bg-blue-100!":
                                 index === activeRow,
                              "border-l-transparent": index !== activeRow,
                           }
                        )}
                     >
                        <TableCell className="hidden px-0.5 text-center font-semibold text-gray-700 2xl:table-cell">
                           {trip.p_g}
                        </TableCell>
                        <TableCell className="hidden px-0.5 text-center font-semibold text-nowrap text-gray-800 2xl:table-cell">
                           {trip.nome_guerra}
                        </TableCell>
                        <TableCell className="px-0.5 text-center font-bold text-gray-900">
                           {trip.trig}
                        </TableCell>
                        <TableCell className="px-0.5 text-center">
                           <span
                              className={clsx(
                                 "rounded-full px-3 py-1 text-xs font-bold",
                                 getOperBadgeClasses(trip.oper)
                              )}
                           >
                              {trip.oper}
                           </span>
                        </TableCell>
                        <TableCell className="px-0.5 text-center">
                           <Tooltip
                              content={getDsvTooltip(trip.voo.data_ult_voo)}
                           >
                              <span className={getDsvColor(trip.voo.dsv)}>
                                 {trip.voo.dsv !== null ? trip.voo.dsv : "—"}
                              </span>
                           </Tooltip>
                        </TableCell>
                        {infoCols.cemal && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.cemal,
                                    "CEMAL"
                                 )}
                              >
                                 <span
                                    className={getDateColor(trip.cartoes.cemal)}
                                 >
                                    {trip.cartoes.cemal
                                       ? isoDateToString(trip.cartoes.cemal)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {infoCols.tovn && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.tovn,
                                    "TOVN"
                                 )}
                              >
                                 <span
                                    className={getDateColor(trip.cartoes.tovn)}
                                 >
                                    {trip.cartoes.tovn
                                       ? isoDateToString(trip.cartoes.tovn)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {infoCols.imae && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.imae,
                                    "IMAE"
                                 )}
                              >
                                 <span
                                    className={getDateColor(trip.cartoes.imae)}
                                 >
                                    {trip.cartoes.imae
                                       ? isoDateToString(trip.cartoes.imae)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {infoCols.crm && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.crm,
                                    "CRM"
                                 )}
                              >
                                 <span
                                    className={getDateColor(trip.cartoes.crm)}
                                 >
                                    {trip.cartoes.crm
                                       ? isoDateToString(trip.cartoes.crm)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {infoCols.val_pass && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.val_pass,
                                    "Passaporte"
                                 )}
                              >
                                 <span
                                    className={getDateColor(
                                       trip.cartoes.val_pass
                                    )}
                                 >
                                    {trip.cartoes.val_pass
                                       ? isoDateToString(trip.cartoes.val_pass)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {infoCols.val_visa && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.val_visa,
                                    "VISA"
                                 )}
                              >
                                 <span
                                    className={getDateColor(
                                       trip.cartoes.val_visa
                                    )}
                                 >
                                    {trip.cartoes.val_visa
                                       ? isoDateToString(trip.cartoes.val_visa)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {showCol("cvi") && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.cvi,
                                    "CVI"
                                 )}
                              >
                                 <span
                                    className={getDateColor(trip.cartoes.cvi)}
                                 >
                                    {trip.cartoes.cvi
                                       ? isoDateToString(trip.cartoes.cvi)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        {showCol("ptai") && (
                           <TableCell className="hidden px-0.5 text-center md:table-cell">
                              <Tooltip
                                 content={getDateTooltip(
                                    trip.cartoes.ptai,
                                    "PTAI"
                                 )}
                              >
                                 <span
                                    className={getDateColor(trip.cartoes.ptai)}
                                 >
                                    {trip.cartoes.ptai
                                       ? isoDateToString(trip.cartoes.ptai)
                                       : "NIL"}
                                 </span>
                              </Tooltip>
                           </TableCell>
                        )}
                        <TableCell className="px-0.5 text-center font-bold text-blue-600">
                           {minutesToTime(trip.voo.h_ano)}
                        </TableCell>
                     </TableRow>
                  ))
               ) : (
                  <TableRow>
                     <TableCell
                        colSpan={6 + visibleInfoCount}
                        className="py-12 text-center text-gray-500"
                     >
                        Nenhum registro encontrado
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>
   );
};

export default SeboTable;
