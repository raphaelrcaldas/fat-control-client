"use client";

import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import clsx from "clsx";
import {
   TbArrowLeft,
   TbArrowRight,
   TbCalendar,
   TbMapPin,
   TbFileDescription,
   TbPencil,
   TbTrash,
} from "react-icons/tb";
import { formatDateFull } from "@/../utils/dateHandler";
import { PermBased } from "../../../hooks/usePermBased";
import type { OperacaoDetail } from "services/routes/ops/operacoes";
import {
   STATUS_DOT,
   STATUS_LABEL,
   STATUS_TEXT,
   TIPO_LABEL,
} from "./operacaoUi";

interface Props {
   op: OperacaoDetail;
   onEdit: () => void;
   onDelete: () => void;
}

export function OperacaoHeader({ op, onEdit, onDelete }: Props) {
   const router = useRouter();

   return (
      <header className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
         <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
               <Button
                  color="light"
                  size="sm"
                  onClick={() => router.back()}
                  className="min-h-[32px] gap-2"
               >
                  <TbArrowLeft aria-hidden className="size-4" /> Operações
               </Button>
               <div className="flex items-center gap-2">
                  <PermBased resource="ops.operacoes" requiredPerm="create">
                     <Button
                        color="light"
                        size="sm"
                        onClick={onEdit}
                        className="min-h-[32px] gap-1.5"
                     >
                        <TbPencil aria-hidden className="size-4" /> Editar
                     </Button>
                  </PermBased>
                  <PermBased resource="ops.operacoes" requiredPerm="delete">
                     <Button
                        color="light"
                        size="sm"
                        onClick={onDelete}
                        aria-label="Excluir operação"
                        title="Excluir operação"
                        className="text-red-700"
                     >
                        <TbTrash aria-hidden className="size-4" />
                     </Button>
                  </PermBased>
               </div>
            </div>
            <div className="space-y-3">
               <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <span className="text-slate-600">{TIPO_LABEL[op.tipo]}</span>
                  <span
                     className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold ring-1 ring-slate-200 ring-inset",
                        STATUS_TEXT[op.status]
                     )}
                  >
                     <span
                        aria-hidden
                        className={clsx(
                           "size-1.5 rounded-full",
                           STATUS_DOT[op.status]
                        )}
                     />
                     {STATUS_LABEL[op.status]}
                  </span>
               </div>
               <h1 className="text-[26px] leading-none font-semibold tracking-tight break-words text-slate-950 uppercase sm:text-[32px]">
                  {op.nome}
               </h1>
               {op.obs && (
                  <p className="max-w-[75ch] text-sm leading-relaxed break-words text-slate-600">
                     {op.obs}
                  </p>
               )}
            </div>
         </div>
         <div className="grid gap-4 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 items-start gap-3">
               <TbCalendar
                  aria-hidden
                  className="size-5 shrink-0 text-slate-500"
                  strokeWidth={1.5}
               />
               <dl className="min-w-0 space-y-1">
                  <dt className="text-xs font-medium text-slate-500">
                     Período{" "}
                     <span className="text-slate-600">
                        ({op.dias} {op.dias === 1 ? "dia" : "dias"})
                     </span>
                  </dt>
                  <dd className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-800 tabular-nums">
                     <span>{formatDateFull(op.data_inicio)}</span>
                     <TbArrowRight
                        aria-label="até"
                        className="size-3.5 text-slate-500"
                     />
                     <span>{formatDateFull(op.data_fim)}</span>
                  </dd>
               </dl>
            </div>
            <div className="flex min-w-0 items-start gap-3">
               <TbMapPin
                  aria-hidden
                  className="size-5 shrink-0 text-slate-500"
                  strokeWidth={1.5}
               />
               <dl className="min-w-0 space-y-1">
                  <dt className="text-xs font-medium text-slate-500">Local</dt>
                  <dd className="text-sm font-medium break-words text-slate-800">
                     {op.cidade
                        ? `${op.cidade.nome} — ${op.cidade.uf}`
                        : "Não informado"}
                  </dd>
               </dl>
            </div>
            <div className="flex min-w-0 items-start gap-3">
               <TbFileDescription
                  aria-hidden
                  className="size-5 shrink-0 text-slate-500"
                  strokeWidth={1.5}
               />
               <dl className="min-w-0 space-y-1">
                  <dt className="text-xs font-medium text-slate-500">
                     Documento de referência
                  </dt>
                  <dd className="text-sm font-medium break-words text-slate-800">
                     {op.documento_referencia || "Não informado"}
                  </dd>
               </dl>
            </div>
         </div>
      </header>
   );
}
