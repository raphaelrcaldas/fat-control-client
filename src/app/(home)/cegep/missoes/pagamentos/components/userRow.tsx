"use client";
import { memo, useMemo } from "react";
import { Checkbox, Button, Badge, TableRow, TableCell } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiExternalLink } from "react-icons/hi";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { PagamentoRecord } from "services/routes/cegep/financeiro";

interface UserRowProps {
   record: PagamentoRecord;
   checked: boolean;
   onSelect: (
      id: number,
      valor: number,
      diarias: number,
      checked: boolean
   ) => void;
   onShowDetail: (record: PagamentoRecord) => void;
}

const STATUS_CONFIGS = {
   g: {
      label: "G",
      color: "warning",
      bgClass: "bg-orange-50 hover:bg-orange-100",
      checkBoxColor: "yellow",
   },
   d: {
      label: "D",
      color: "success",
      bgClass: "bg-green-50 hover:bg-green-100",
      checkBoxColor: "green",
   },
   c: {
      label: "C",
      color: "info",
      bgClass: "bg-blue-50 hover:bg-blue-100",
      checkBoxColor: "blue",
   },
} as const;

export const UserRow = memo(function UserRow({
   record,
   checked,
   onSelect,
   onShowDetail,
}: UserRowProps) {
   const router = useRouter();

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
      onSelect(
         record.user_mis.id,
         record.missao.valor_total,
         record.missao.diarias ?? 0,
         !checked
      );
   }

   const statusConfig = STATUS_CONFIGS[record.user_mis.sit] || STATUS_CONFIGS.g;

   return (
      <TableRow className={clsx(statusConfig.bgClass)}>
         <TableCell className="w-8 text-center">
            <Checkbox
               className="size-5 cursor-pointer"
               color={statusConfig.checkBoxColor}
               checked={checked}
               onChange={onChange}
            />
         </TableCell>
         <TableCell className="text-center font-mono whitespace-nowrap">
            <span className="tracking-wider text-gray-600 uppercase">
               {record.missao.tipo_doc}
            </span>{" "}
            <span className="text-gray-900">
               {String(record.missao.n_doc).padStart(3, "0")}
            </span>
         </TableCell>
         <TableCell className="font-medium whitespace-nowrap text-gray-900 uppercase">
            {record.user_mis.p_g} {record.user_mis.user.nome_guerra}
         </TableCell>
         <TableCell className="text-center">
            <Badge
               color={statusConfig.color}
               size="sm"
               className="mx-auto w-fit border border-current/40 px-2 py-0.5 text-xs font-medium"
            >
               {statusConfig.label}
            </Badge>
         </TableCell>
         <TableCell className="max-w-60 text-xs text-gray-700">
            <p className="truncate" title={record.missao.desc || undefined}>
               {record.missao.desc || (
                  <span className="text-gray-400 italic">Sem descrição</span>
               )}
            </p>
         </TableCell>
         <TableCell className="text-center font-mono text-sm whitespace-nowrap text-gray-600">
            {afast}
         </TableCell>
         <TableCell className="text-center font-mono text-sm whitespace-nowrap text-gray-600">
            {regres}
         </TableCell>
         <TableCell className="text-center">
            <span className="text-sm font-semibold text-gray-900">
               {record.missao.dias}
            </span>
         </TableCell>
         <TableCell
            className={clsx("text-center", {
               "opacity-50": record.user_mis.sit === "g",
            })}
         >
            <span className="text-sm font-semibold text-gray-900">
               {Number(record.missao.diarias).toFixed(1)}
            </span>
         </TableCell>
         <TableCell className="text-center font-mono text-sm font-bold whitespace-nowrap text-emerald-700">
            {Number(record.missao.valor_total).toLocaleString("pt-BR", {
               style: "currency",
               currency: "BRL",
            })}
         </TableCell>
         <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1">
               <Button
                  size="sm"
                  disabled={record.user_mis.sit === "g"}
                  color="light"
                  onClick={() => onShowDetail(record)}
               >
                  <IoMdInformationCircleOutline size={18} />
               </Button>
               <Button
                  size="sm"
                  color="light"
                  onClick={() =>
                     router.push(`/cegep/missoes/${record.missao.id}`)
                  }
                  title="Abrir missao"
                  className="transition-colors duration-200 hover:bg-blue-50"
               >
                  <HiExternalLink size={18} />
               </Button>
            </div>
         </TableCell>
      </TableRow>
   );
});
