"use client";
import { Checkbox, Button, Popover, Badge } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import {
   HiCalendar,
   HiClock,
   HiCurrencyDollar,
   HiLocationMarker,
} from "react-icons/hi";
import clsx from "clsx";
import { MisPntsTable } from "../../../components/popMisPnts";

export function UserRow({ record, checked, onSelect }) {
   const pnts = record.missao.pernoites || [];

   const afast =
      new Date(record.missao.afast).toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }) || "N/A";

   const regres =
      new Date(record.missao.regres).toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
      }) || "N/A";

   function onChange() {
      onSelect(record.user_mis.id, record.missao.valor_total, !checked);
   }

   const getStatusConfig = (sit: string) => {
      const configs = {
         g: {
            label: "G",
            color: "warning",
            bgClass: "bg-gradient-to-br from-orange-50 to-orange-100/50",
            hoverClass: "hover:from-orange-100 hover:to-orange-150",
            borderClass: "border-l-4 border-orange-400",
         },
         d: {
            label: "D",
            color: "success",
            bgClass: "bg-gradient-to-br from-green-50 to-green-100/50",
            hoverClass: "hover:from-green-100 hover:to-green-150",
            borderClass: "border-l-4 border-green-400",
         },
         c: {
            label: "C",
            color: "info",
            bgClass: "bg-gradient-to-br from-blue-50 to-blue-100/50",
            hoverClass: "hover:from-blue-100 hover:to-blue-150",
            borderClass: "border-l-4 border-blue-400",
         },
      };
      return configs[sit] || configs.g;
   };

   const statusConfig = getStatusConfig(record.user_mis.sit);

   return (
      <li
         key={record.missao.id}
         className={clsx(
            "group relative my-1.5 rounded p-2 transition-all duration-200 ease-in-out",
            "flex flex-row items-center gap-0.5 sm:gap-2",
            statusConfig.bgClass,
            statusConfig.hoverClass,
            statusConfig.borderClass,
            "hover:shadow",
            {
               "ring-2 ring-blue-400 ring-offset-1": checked,
            }
         )}
      >
         {/* Checkbox Section */}
         <div className="flex w-8 items-center justify-center">
            <Checkbox
               className="size-5 cursor-pointer transition-transform hover:scale-105"
               color="blue"
               checked={checked}
               onChange={onChange}
            />
         </div>

         {/* Document Info */}
         <div className="flex min-w-[70px] flex-col items-center">
            <span className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">
               {record.missao.tipo_doc}
            </span>
            <span className="text-base font-bold text-gray-900">
               {record.missao.n_doc}
            </span>
         </div>

         {/* User Info */}
         <div className="flex min-w-[160px] flex-col text-xs sm:text-base">
            <span className="text-[10px] tracking-wide text-gray-500 uppercase">
               Militar
            </span>
            <span className="font-semibold text-gray-900 uppercase">
               {record.user_mis.p_g} {record.user_mis.user.nome_guerra}
            </span>
         </div>

         {/* Status Badge */}
         <div className="hidden items-center md:flex">
            <Badge
               color={statusConfig.color}
               size="sm"
               className="px-2 py-0.5 text-xs font-medium"
            >
               {statusConfig.label}
            </Badge>
         </div>

         {/* Description */}
         <div className="hidden min-w-[150px] sm:flex sm:flex-1">
            <p className="line-clamp-2 text-xs leading-tight text-gray-700">
               {record.missao.desc || (
                  <span className="text-gray-400 italic">Sem descrição</span>
               )}
            </p>
         </div>

         {/* Dates Section */}
         <div className="flex min-w-[140px] flex-col gap-1">
            <div className="flex items-center gap-2">
               <HiCalendar className="shrink-0 text-gray-400" size={14} />
               <span className="text-xs text-gray-600">{afast}</span>
            </div>
            <div className="flex items-center gap-2">
               <HiCalendar className="shrink-0 text-gray-400" size={14} />
               <span className="text-xs text-gray-600">{regres}</span>
            </div>
         </div>

         {/* Days & Diarias */}
         <div className="flex gap-3">
            <div className="flex min-w-[60px] flex-col items-center">
               <span className="text-base font-bold text-gray-900">
                  {record.missao.dias}
               </span>
               <span className="text-[10px] font-medium text-gray-500 uppercase">
                  dia{record.missao.dias > 1 ? "s" : ""}
               </span>
            </div>

            <div
               className={clsx("flex min-w-[70px] flex-col items-center", {
                  "opacity-50": record.user_mis.sit === "g",
               })}
            >
               <span className="text-base font-bold text-gray-900">
                  {Number(record.missao.diarias).toFixed(1)}
               </span>
               <span className="text-[10px] font-medium text-gray-500 uppercase">
                  diária{record.missao.diarias > 1 ? "s" : ""}
               </span>
            </div>
         </div>

         {/* Total Value */}
         <div className="flex min-w-[120px] flex-col items-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 px-3 py-1.5">
            <HiCurrencyDollar className="mb-0.5 text-emerald-600" size={16} />
            <span className="text-sm font-bold text-emerald-700">
               {Number(record.missao.valor_total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
               })}
            </span>
         </div>

         {/* Pernoites */}
         <div className="flex max-w-[240px] min-w-[240px] flex-wrap items-center gap-1">
            {pnts.length > 0 ? (
               pnts.map((pnt) => {
                  const totalDiarias = pnt.custo.vals.reduce(
                     (acc, val) => acc + val.qtd,
                     0
                  );
                  return (
                     <div
                        key={pnt.id}
                        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 text-[11px] transition-all duration-200 hover:from-gray-200 hover:to-gray-300"
                     >
                        <HiLocationMarker className="text-gray-500" size={11} />
                        <span className="font-medium text-gray-700">
                           {pnt.cidade.nome}-{pnt.cidade.uf}
                        </span>
                        {record.user_mis.sit !== "g" && (
                           <span className="font-semibold text-gray-500">
                              ({Number(totalDiarias).toFixed(1)})
                           </span>
                        )}
                     </div>
                  );
               })
            ) : (
               <span className="text-xs text-gray-400 italic">
                  Sem pernoites
               </span>
            )}
         </div>

         {/* Info Button */}
         <div className="flex items-center">
            <Popover
               content={
                  <MisPntsTable
                     pernoites={pnts}
                     acDeslocSede={record.missao.acrec_desloc}
                     total={record.missao.valor_total}
                  />
               }
               placement="left"
            >
               <Button
                  className="transition-opacity duration-200 hover:opacity-70"
                  size="xs"
                  disabled={record.sit === "g"}
                  color="gray"
                  pill
               >
                  <IoMdInformationCircleOutline size={18} />
               </Button>
            </Popover>
         </div>
      </li>
   );
}
