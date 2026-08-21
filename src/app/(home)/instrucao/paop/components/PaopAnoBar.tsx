"use client";

import clsx from "clsx";
import { Button, Label, Select } from "flowbite-react";
import { FaPenToSquare, FaTrashCan, FaListCheck } from "react-icons/fa6";
import { formatDateFull } from "@/../utils/dateHandler";
import { PermBased } from "../../../hooks/usePermBased";
import type { PaopResumo } from "services/routes/instrucao/paops";
import { STATUS_META } from "./paopUi";

interface PaopAnoBarProps {
   paops: PaopResumo[];
   selecionado: PaopResumo;
   isBusy: boolean;
   onSelect: (id: number) => void;
   onEdit: () => void;
   onDelete: () => void;
   onGerenciarSubprogramas: () => void;
}

export function PaopAnoBar({
   paops,
   selecionado,
   isBusy,
   onSelect,
   onEdit,
   onDelete,
   onGerenciarSubprogramas,
}: PaopAnoBarProps) {
   const status = STATUS_META[selecionado.status];

   return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded border border-slate-200 bg-white p-3 shadow-sm">
         <div className="flex items-center gap-2">
            <Label
               htmlFor="paop-ano-sel"
               className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase"
            >
               Ano
            </Label>
            {/* Largura fixa: em auto-width a seta do Flowbite monta por cima
                do texto e come as últimas letras da opção. */}
            <Select
               id="paop-ano-sel"
               sizing="sm"
               className="w-48"
               value={selecionado.id}
               onChange={(e) => onSelect(Number(e.target.value))}
            >
               {paops.map((paop) => (
                  <option key={paop.id} value={paop.id}>
                     {paop.ano} — {STATUS_META[paop.status].label}
                  </option>
               ))}
            </Select>
         </div>

         <span
            className={clsx(
               "inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold",
               status.badge
            )}
         >
            {status.label}
         </span>

         <span className="text-sm text-slate-600 tabular-nums">
            {formatDateFull(selecionado.data_ini)} —{" "}
            {formatDateFull(selecionado.data_fim)}
         </span>

         <span className="text-sm text-slate-500">
            {selecionado.total_subprogramas} subprograma
            {selecionado.total_subprogramas === 1 ? "" : "s"}
         </span>

         <div className="ml-auto flex items-center gap-1.5">
            <PermBased resource="instrucao.paop" requiredPerm="update">
               <Button
                  size="xs"
                  color="light"
                  disabled={isBusy}
                  onClick={onGerenciarSubprogramas}
               >
                  <FaListCheck className="mr-1.5 size-3.5" />
                  Subprogramas
               </Button>
               <Button
                  size="xs"
                  color="light"
                  disabled={isBusy}
                  onClick={onEdit}
                  title="Editar plano"
               >
                  <FaPenToSquare className="size-3.5" />
               </Button>
            </PermBased>
            <PermBased resource="instrucao.paop" requiredPerm="delete">
               <Button
                  size="xs"
                  color="red"
                  disabled={isBusy}
                  onClick={onDelete}
                  title="Remover plano"
               >
                  <FaTrashCan className="size-3.5" />
               </Button>
            </PermBased>
         </div>
      </div>
   );
}
