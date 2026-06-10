"use client";

import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import { HiArrowLeft } from "react-icons/hi";
import {
   MdCalendarMonth,
   MdSchedule,
   MdDescription,
   MdDelete,
   MdLocationOn,
   MdEdit,
} from "react-icons/md";
import { TbPlaneInflight } from "react-icons/tb";
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
      <div className="mb-5">
         {/* Voltar — pill (preserva os filtros da lista via histórico) */}
         <button
            type="button"
            onClick={() => router.back()}
            className="mb-2 -ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
         >
            <HiArrowLeft className="h-4 w-4" />
            Voltar
         </button>

         {/* Masthead — claro, mesma linguagem do header da lista */}
         <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
            {/* Brilho radial vermelho bem sutil */}
            <div
               aria-hidden
               className="pointer-events-none absolute inset-0"
               style={{
                  background:
                     "radial-gradient(55% 130% at 95% -30%, rgba(239,68,68,0.07), transparent 60%)",
               }}
            />
            {/* Espinha vermelha — ecoa a espinha dos cards */}
            <span
               aria-hidden
               className="absolute top-0 left-0 h-full w-1 bg-linear-to-b from-red-500 to-red-600"
            />

            <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
               <div className="flex min-w-0 items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100 ring-inset">
                     <TbPlaneInflight className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                     {/* Eyebrow: tipo (mono) + status */}
                     <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase">
                           {TIPO_LABEL[op.tipo]}
                        </span>
                        <span aria-hidden className="h-3 w-px bg-slate-200" />
                        <span
                           className={`flex items-center gap-1.5 text-xs font-bold uppercase ${STATUS_TEXT[op.status]}`}
                        >
                           <span
                              className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[op.status]}`}
                           />
                           {STATUS_LABEL[op.status]}
                        </span>
                     </div>

                     <h1 className="mt-1 text-2xl leading-none font-extrabold tracking-tight text-slate-900 uppercase sm:text-[28px]">
                        {op.nome}
                     </h1>

                     <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
                        {op.cidade && (
                           <span className="flex items-center gap-1.5">
                              <MdLocationOn className="h-4 w-4 text-slate-400" />
                              {op.cidade.nome} — {op.cidade.uf}
                           </span>
                        )}
                        <span className="flex items-center gap-1.5 font-mono tabular-nums">
                           <MdCalendarMonth className="h-4 w-4 text-slate-400" />
                           {formatDateFull(op.data_inicio)}
                           <span className="text-slate-300">→</span>
                           {formatDateFull(op.data_fim)}
                        </span>
                        <span className="flex items-center gap-1.5">
                           <MdSchedule className="h-4 w-4 text-slate-400" />
                           {op.dias} dias
                        </span>
                        {op.documento_referencia && (
                           <span className="flex items-center gap-1.5">
                              <MdDescription className="h-4 w-4 text-slate-400" />
                              {op.documento_referencia}
                           </span>
                        )}
                     </div>

                     {op.obs && (
                        <p className="mt-2.5 max-w-3xl text-sm text-slate-600">
                           {op.obs}
                        </p>
                     )}
                  </div>
               </div>

               {/* Ações — centralizadas contra todo o bloco (alinham c/ o ícone) */}
               <div className="flex shrink-0 items-center gap-2 self-center">
                  <PermBased resource="operacoes" requiredPerm="create">
                     <Button color="gray" size="sm" onClick={onEdit}>
                        <MdEdit className="mr-1.5 h-4 w-4" /> Editar
                     </Button>
                  </PermBased>
                  <PermBased resource="operacoes" requiredPerm="delete">
                     <Button color="red" outline size="sm" onClick={onDelete}>
                        <MdDelete className="mr-1.5 h-4 w-4" /> Excluir
                     </Button>
                  </PermBased>
               </div>
            </div>
         </header>
      </div>
   );
}
