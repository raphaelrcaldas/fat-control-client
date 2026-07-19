"use client";
import { memo, useMemo } from "react";
import { Checkbox, Button, Badge, TableRow, TableCell } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiExternalLink, HiExclamation } from "react-icons/hi";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import { formatNaiveDateTime } from "utils/dateHandler";

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
         afast: formatNaiveDateTime(record.missao.afast) || "N/A",
         regres: formatNaiveDateTime(record.missao.regres) || "N/A",
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
            <span className="text-gray-900">{record.missao.n_doc}</span>
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
         <TableCell className="text-center font-mono text-sm whitespace-nowrap text-gray-600 tabular-nums">
            {afast}
         </TableCell>
         <TableCell className="text-center font-mono text-sm whitespace-nowrap text-gray-600 tabular-nums">
            {regres}
         </TableCell>
         <TableCell className="text-center">
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
               {record.missao.dias}
            </span>
         </TableCell>
         <TableCell
            className={clsx("text-center", {
               "opacity-50": record.user_mis.sit === "g",
            })}
         >
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
               {Number(record.missao.diarias).toFixed(1)}
            </span>
         </TableCell>
         <TableCell className="text-center font-mono text-sm font-bold whitespace-nowrap text-emerald-700 tabular-nums">
            <div className="flex items-center justify-center gap-1">
               {record.missao.custo_inconsistente && (
                  <span title="Custo possivelmente desatualizado. Reabra e salve a missão para recalcular.">
                     <HiExclamation className="h-4 w-4 text-amber-500" />
                  </span>
               )}
               {Number(record.missao.valor_total).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
               })}
            </div>
         </TableCell>
         <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1">
               <Button
                  size="sm"
                  disabled={record.user_mis.sit === "g"}
                  color="light"
                  onClick={() => onShowDetail(record)}
                  title="Ver detalhamento do pagamento"
                  aria-label="Ver detalhamento do pagamento"
               >
                  <IoMdInformationCircleOutline size={18} />
               </Button>
               <Button
                  size="sm"
                  color="light"
                  onClick={() =>
                     router.push(`/cegep/missoes/${record.missao.id}`)
                  }
                  title="Abrir missão"
                  aria-label="Abrir missão"
                  className="transition-colors duration-200 hover:bg-blue-50"
               >
                  <HiExternalLink size={18} />
               </Button>
            </div>
         </TableCell>
      </TableRow>
   );
});

/**
 * Variante mobile (< md): cada registro vira um card, mesmo padrão visual da
 * aba Registros (rounded border-slate-200 bg-white p-4 shadow-sm). Evita o
 * scroll horizontal da tabela que escondia Valor/Diárias no celular.
 */
export const UserCard = memo(function UserCard({
   record,
   checked,
   onSelect,
   onShowDetail,
}: UserRowProps) {
   const router = useRouter();

   const { afast, regres } = useMemo(
      () => ({
         afast: formatNaiveDateTime(record.missao.afast) || "N/A",
         regres: formatNaiveDateTime(record.missao.regres) || "N/A",
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
   const isGrat = record.user_mis.sit === "g";

   return (
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
         {/* Topo: seleção + Militar/OM + situação */}
         <div className="flex items-start gap-3">
            <Checkbox
               className="mt-0.5 size-5 shrink-0 cursor-pointer pointer-coarse:size-11"
               color={statusConfig.checkBoxColor}
               checked={checked}
               onChange={onChange}
               aria-label={`Selecionar ${record.user_mis.user.nome_guerra}`}
            />
            <div className="min-w-0 flex-1">
               <p className="truncate font-medium text-gray-900 uppercase">
                  {record.user_mis.p_g} {record.user_mis.user.nome_guerra}
               </p>
               <p className="font-mono text-xs tracking-wider text-gray-500 tabular-nums">
                  <span className="uppercase">{record.missao.tipo_doc}</span>{" "}
                  {record.missao.n_doc}
               </p>
            </div>
            <Badge
               color={statusConfig.color}
               size="sm"
               className="shrink-0 border border-current/40 px-2 py-0.5 text-xs font-medium"
            >
               {statusConfig.label}
            </Badge>
         </div>

         {/* Números em destaque: Valor / Diárias / Dias */}
         <div className="mt-3 grid grid-cols-3 gap-2 rounded border border-slate-200 bg-slate-50 p-2">
            <div className="text-center">
               <span className="block text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                  Valor
               </span>
               <span className="flex items-center justify-center gap-1 font-mono text-sm font-bold text-emerald-700 tabular-nums">
                  {record.missao.custo_inconsistente && (
                     <span title="Custo possivelmente desatualizado. Reabra e salve a missão para recalcular.">
                        <HiExclamation className="h-4 w-4 text-amber-500" />
                     </span>
                  )}
                  {Number(record.missao.valor_total).toLocaleString("pt-BR", {
                     style: "currency",
                     currency: "BRL",
                  })}
               </span>
            </div>
            <div className={clsx("text-center", { "opacity-50": isGrat })}>
               <span className="block text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                  Diárias
               </span>
               <span className="block text-sm font-semibold text-gray-900 tabular-nums">
                  {Number(record.missao.diarias).toFixed(1)}
               </span>
            </div>
            <div className="text-center">
               <span className="block text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                  Dias
               </span>
               <span className="block text-sm font-semibold text-gray-900 tabular-nums">
                  {record.missao.dias}
               </span>
            </div>
         </div>

         {/* Descrição + período */}
         <div className="mt-3 space-y-1 text-xs text-gray-600">
            <p className="truncate" title={record.missao.desc || undefined}>
               {record.missao.desc || (
                  <span className="text-gray-400 italic">Sem descrição</span>
               )}
            </p>
            <p className="font-mono text-gray-500 tabular-nums">
               {afast} <span className="text-gray-400">→</span> {regres}
            </p>
         </div>

         {/* Rodapé: ações */}
         <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
            <Button
               size="sm"
               disabled={isGrat}
               color="light"
               onClick={() => onShowDetail(record)}
               aria-label="Ver detalhamento do pagamento"
            >
               <IoMdInformationCircleOutline size={18} />
            </Button>
            <Button
               size="sm"
               color="light"
               onClick={() => router.push(`/cegep/missoes/${record.missao.id}`)}
               aria-label="Abrir missão"
            >
               <HiExternalLink size={18} />
            </Button>
         </div>
      </div>
   );
});
