"use client";

import { useRouter } from "next/navigation";
import { Button } from "flowbite-react";
import clsx from "clsx";
import { TbArrowLeft, TbPencil, TbTrash } from "react-icons/tb";
import { isoDateToShort, formatNaiveDate } from "@/../utils/dateHandler";
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

/**
 * Identificação da operação — o primeiro bloco do dossiê.
 *
 * Os quatro fatos ficam numa faixa de colunas fixas em vez de blocos com
 * ícone: a faixa lê como cabeçalho de documento, que é o que a tela é, e
 * economiza a altura que o ícone consumia antes do primeiro número.
 */
export function OperacaoIdentificacao({ op, onEdit, onDelete }: Props) {
   const router = useRouter();

   return (
      <header className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="min-w-0">
               <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{TIPO_LABEL[op.tipo]}</span>
                  <span aria-hidden className="text-slate-300">
                     ·
                  </span>
                  <span className="font-mono tabular-nums">
                     Nº {String(op.numero).padStart(3, "0")}
                  </span>
                  <span aria-hidden className="text-slate-300">
                     ·
                  </span>
                  <span
                     className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold ring-1 ring-slate-200 ring-inset",
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
               <h1 className="text-2xl leading-tight font-semibold tracking-tight break-words text-slate-950 uppercase sm:text-[28px]">
                  {op.nome}
               </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
               <Button
                  color="light"
                  size="sm"
                  onClick={() => router.push("/ops/operacoes")}
                  className="gap-1.5"
               >
                  <TbArrowLeft aria-hidden className="size-4" /> Operações
               </Button>
               <PermBased resource="ops.operacoes" requiredPerm="create">
                  <Button
                     color="light"
                     size="sm"
                     onClick={onEdit}
                     className="gap-1.5"
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

         <dl className="grid grid-cols-2 border-t border-slate-200 bg-slate-50/70 md:grid-cols-4">
            <Fato rotulo="Período">
               {isoDateToShort(op.data_inicio)} → {isoDateToShort(op.data_fim)}{" "}
               <span className="font-normal text-slate-500">
                  · {op.dias} {op.dias === 1 ? "dia" : "dias"}
               </span>
            </Fato>
            <Fato rotulo="Local">
               {op.cidade ? (
                  `${op.cidade.nome} — ${op.cidade.uf}`
               ) : (
                  <span className="font-normal text-slate-500 italic">
                     Não informado
                  </span>
               )}
            </Fato>
            <Fato rotulo="Documento">
               {op.documento_referencia ? (
                  <span className="font-mono">{op.documento_referencia}</span>
               ) : (
                  <span className="font-normal text-slate-500 italic">
                     Não informado
                  </span>
               )}
            </Fato>
            <Fato rotulo="Aberta em">
               <span className="font-normal text-slate-600">
                  {formatNaiveDate(op.created_at)}
               </span>
            </Fato>
         </dl>

         {op.obs && (
            <p className="max-w-[82ch] border-t border-slate-200 px-4 py-2.5 text-sm leading-relaxed break-words text-slate-600 sm:px-5">
               {op.obs}
            </p>
         )}
      </header>
   );
}

function Fato({
   rotulo,
   children,
}: {
   rotulo: string;
   children: React.ReactNode;
}) {
   return (
      <div className="min-w-0 border-slate-200 px-4 py-2 not-first:border-l max-md:nth-[n+3]:border-t max-md:nth-[odd]:border-l-0 sm:px-5">
         <dt className="font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            {rotulo}
         </dt>
         <dd className="truncate text-sm font-semibold text-slate-800">
            {children}
         </dd>
      </div>
   );
}
