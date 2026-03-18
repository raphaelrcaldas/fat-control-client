"use client";
import { memo, useMemo } from "react";
import { Checkbox, Button, Badge } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiCalendar } from "react-icons/hi";
import clsx from "clsx";
import { PagamentoRecord } from "services/routes/cegep/financeiro";

interface UserRowProps {
   record: PagamentoRecord;
   checked: boolean;
   onSelect: (id: number, valor: number, diarias: number, checked: boolean) => void;
   onShowDetail: (record: PagamentoRecord) => void;
}

const STATUS_CONFIGS = {
   g: {
      label: "G",
      color: "warning",
      bgClass: "bg-orange-50",
      hoverClass: "hover:bg-orange-100",
      borderClass: "border-l-2 border-orange-400",
      active: "ring-2 ring-orange-400",
      checkBoxColor: "yellow",
   },
   d: {
      label: "D",
      color: "success",
      bgClass: "bg-green-50",
      hoverClass: "hover:bg-green-100",
      borderClass: "border-l-2 border-green-400",
      active: "ring-2 ring-green-400",
      checkBoxColor: "green",
   },
   c: {
      label: "C",
      color: "info",
      bgClass: "bg-blue-50",
      hoverClass: "hover:bg-blue-100",
      borderClass: "border-l-2 border-blue-400",
      active: "ring-2 ring-blue-400",
      checkBoxColor: "blue",
   },
} as const;

export const UserRow = memo(function UserRow({
   record,
   checked,
   onSelect,
   onShowDetail,
}: UserRowProps) {
   const { afast, regres } = useMemo(
      () => ({
         afast:
            new Date(record.missao.afast).toLocaleDateString("pt-BR", {
               day: "2-digit",
               month: "2-digit",
               year: "2-digit",
               hour: "2-digit",
               minute: "2-digit",
            }) || "N/A",
         regres:
            new Date(record.missao.regres).toLocaleDateString("pt-BR", {
               day: "2-digit",
               month: "2-digit",
               year: "2-digit",
               hour: "2-digit",
               minute: "2-digit",
            }) || "N/A",
      }),
      [record.missao.afast, record.missao.regres]
   );

   function onChange() {
      onSelect(record.user_mis.id, record.missao.valor_total, record.missao.diarias ?? 0, !checked);
   }

   const statusConfig = STATUS_CONFIGS[record.user_mis.sit] || STATUS_CONFIGS.g;

   return (
      <li
         key={record.missao.id}
         className={clsx(
            "group relative my-2 rounded px-2 py-3",
            "flex flex-row items-center gap-0.5 sm:gap-2",
            statusConfig.bgClass,
            statusConfig.hoverClass,
            statusConfig.borderClass,
            "hover:shadow",
            {
               [statusConfig.active]: checked,
            }
         )}
      >
         {/* Checkbox Section */}
         <div className="flex w-8 items-center justify-center">
            <Checkbox
               className="size-5 cursor-pointer"
               color={statusConfig.checkBoxColor}
               checked={checked}
               onChange={onChange}
            />
         </div>

         {/* Document Info */}
         <div className="flex min-w-17.5 flex-col items-center">
            <span className="text-[10px] font-medium tracking-wider text-gray-500 uppercase">
               {record.missao.tipo_doc}
            </span>
            <span className="text-base font-medium text-gray-900">
               {String(record.missao.n_doc).padStart(3, "0")}
            </span>
         </div>

         {/* User Info */}
         <div className="flex min-w-40 flex-col text-xs sm:text-base">
            <span className="text-[10px] tracking-wide text-gray-500 uppercase">
               Militar
            </span>
            <span className="font-medium text-gray-900 uppercase">
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
         <div className="hidden min-w-37.5 flex-col gap-1 sm:flex sm:flex-1">
            <span className="text-[10px] tracking-wide text-gray-500 uppercase">
               Descrição
            </span>
            <p className="line-clamp-2 text-xs leading-tight text-gray-700">
               {record.missao.desc || (
                  <span className="text-gray-400 italic">Sem descrição</span>
               )}
            </p>
         </div>

         {/* Dates Section */}
         <div className="flex flex-row gap-5">
            <div>
               <span className="text-[10px] tracking-wide text-gray-500 uppercase">
                  Afastamento
               </span>
               <div className="flex items-center gap-2">
                  <HiCalendar className="shrink-0 text-gray-400" size={14} />
                  <span className="text-sm text-gray-600">{afast}</span>
               </div>
            </div>
            <div>
               <span className="text-[10px] tracking-wide text-gray-500 uppercase">
                  Regresso
               </span>
               <div className="flex items-center gap-2">
                  <HiCalendar className="shrink-0 text-gray-400" size={14} />
                  <span className="text-sm text-gray-600">{regres}</span>
               </div>
            </div>
         </div>

         {/* Days & Diarias */}
         <div className="flex gap-3">
            <div className="flex min-w-15 flex-col items-center">
               <span className="text-base font-semibold text-gray-900">
                  {record.missao.dias}
               </span>
               <span className="text-[10px] font-medium text-gray-500 uppercase">
                  dia{record.missao.dias > 1 ? "s" : ""}
               </span>
            </div>

            <div
               className={clsx("flex min-w-17.5 flex-col items-center", {
                  "opacity-50": record.user_mis.sit === "g",
               })}
            >
               <span className="text-base font-semibold text-gray-900">
                  {Number(record.missao.diarias).toFixed(1)}
               </span>
               <span className="text-[10px] font-medium text-gray-500 uppercase">
                  diária{record.missao.diarias > 1 ? "s" : ""}
               </span>
            </div>
         </div>

         {/* Total Value */}
         <div className="flex min-w-30 flex-col items-center rounded-lg bg-emerald-50 px-3 py-1.5">
            <span className="text-sm font-bold text-emerald-700">
               {Number(record.missao.valor_total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
               })}
            </span>
         </div>

         {/* Info Button */}
         <div className="flex items-center">
            <Button
               size="sm"
               disabled={record.user_mis.sit === "g"}
               color="light"
               onClick={() => onShowDetail(record)}
            >
               <IoMdInformationCircleOutline size={18} />
            </Button>
         </div>
      </li>
   );
});
