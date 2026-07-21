"use client";

import { useParams, useRouter } from "next/navigation";
import {
   useSearchParamsUpdater,
   getStringParam,
} from "@/hooks/useSearchParamsState";
import { useComissDetail } from "@/hooks/queries";
import { ComissPage } from "../components/ComissPage";
import { ComissPageSkeleton } from "../components/ComissPageSkeleton";
import { ComissForm } from "../components/ComissForm";
import { formatDateTime, isoDateToString } from "@/../utils/dateHandler";
import { realCurrency } from "utils/financeiro";
import type {
   ComissLog,
   ComissLogSnapshot,
} from "services/routes/cegep/comiss";

const ACTION_LABEL: Record<string, string> = {
   create: "Criação",
   update: "Atualização",
};

const FIELD_LABELS: Record<keyof ComissLogSnapshot, string> = {
   status: "Status",
   user_id: "Militar",
   dep: "Dependente",
   data_ab: "Abertura",
   qtd_aj_ab: "Qtd Aj. Abertura",
   valor_aj_ab: "Vl. Aj. Abertura",
   data_fc: "Fechamento",
   qtd_aj_fc: "Qtd Aj. Fechamento",
   valor_aj_fc: "Vl. Aj. Fechamento",
   dias_cumprir: "Dias a Cumprir",
   doc_prop: "Doc. Proposta",
   doc_aut: "Doc. Autorização",
   doc_enc: "Doc. Encerramento",
};

const MONEY_FIELDS = new Set<keyof ComissLogSnapshot>([
   "valor_aj_ab",
   "valor_aj_fc",
]);
const DATE_FIELDS = new Set<keyof ComissLogSnapshot>(["data_ab", "data_fc"]);
const BOOL_FIELDS = new Set<keyof ComissLogSnapshot>(["dep"]);

function formatFieldValue(
   field: keyof ComissLogSnapshot,
   value: unknown
): string {
   if (value === null || value === undefined) return "—";
   if (MONEY_FIELDS.has(field)) return realCurrency(value as number);
   if (DATE_FIELDS.has(field)) return isoDateToString(value as string);
   if (BOOL_FIELDS.has(field)) return value ? "Sim" : "Não";
   return String(value);
}

export default function ComissDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const comissId = Number(params.id);

   // Modo de edição vive na URL (?edit=1) para sobreviver ao F5/compartilhamento.
   const { searchParams, setParams } = useSearchParamsUpdater();
   const isEditMode = getStringParam(searchParams, "edit") === "1";
   const openEdit = () => setParams({ edit: "1" });
   const closeEdit = () => setParams({ edit: undefined });

   const { data: comiss, isLoading } = useComissDetail(comissId);

   const handleNavigateBack = () => {
      router.push("/cegep/comiss");
   };

   if (isLoading) {
      return <ComissPageSkeleton />;
   }

   if (!comiss) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               Comissionamento não encontrado.
            </p>
            <button
               onClick={handleNavigateBack}
               className="text-primary-700 text-sm font-medium hover:underline"
            >
               Voltar para lista de comissionamentos
            </button>
         </div>
      );
   }

   if (isEditMode) {
      return (
         <ComissForm
            comiss={comiss}
            onCancel={closeEdit}
            onSuccess={closeEdit}
         />
      );
   }

   return (
      <div className="flex flex-col gap-4">
         <ComissPage
            detail={comiss}
            onEdit={openEdit}
            onClose={handleNavigateBack}
         />

         {/* HISTÓRICO DE AUDITORIA */}
         {comiss.logs.length > 0 && (
            <div className="flex w-full justify-center">
               <div className="w-full max-w-7xl rounded border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                     <h3 className="font-semibold text-gray-800">
                        Histórico de Alterações
                     </h3>
                     <p className="text-xs text-gray-500">
                        Registro de criações e atualizações deste
                        comissionamento.
                     </p>
                  </div>
                  <div className="p-5">
                     <ol className="relative space-y-4 border-s border-gray-200 ps-5">
                        {comiss.logs.map((log) => (
                           <ComissLogEntry key={log.id} log={log} />
                        ))}
                     </ol>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

function ComissLogEntry({ log }: { log: ComissLog }) {
   const action = ACTION_LABEL[log.action] ?? log.action;
   const before = log.before;
   const after = log.after;

   const diffs: {
      field: keyof ComissLogSnapshot;
      before: unknown;
      after: unknown;
   }[] = [];

   if (after) {
      for (const field of Object.keys(
         FIELD_LABELS
      ) as (keyof ComissLogSnapshot)[]) {
         const b = before ? before[field] : undefined;
         const a = after[field];
         if (b === a) continue;
         // Na criação (sem `before`), campos opcionais vazios não são mudança.
         if (!before && (a === null || a === undefined)) continue;
         diffs.push({ field, before: b, after: a });
      }
   }

   return (
      <li className="relative">
         <span className="absolute -inset-s-6.5 top-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-slate-300 bg-slate-100" />
         <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
               <span className="text-sm font-semibold text-gray-800">
                  {action}
               </span>
               {log.user && (
                  <span className="text-xs text-gray-500 uppercase">
                     por {log.user.p_g} {log.user.nome_guerra}
                  </span>
               )}
            </div>
            <time className="text-xs whitespace-nowrap text-slate-500">
               {formatDateTime(log.timestamp) ?? ""}
            </time>
         </div>
         {diffs.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs wrap-break-word text-gray-600">
               {diffs.map((d) => (
                  <li key={d.field}>
                     <span className="font-medium text-gray-700">
                        {FIELD_LABELS[d.field]}:
                     </span>{" "}
                     {d.before !== undefined && d.before !== null ? (
                        <>
                           <span className="text-red-600 line-through">
                              {formatFieldValue(d.field, d.before)}
                           </span>{" "}
                           <span className="text-gray-400">→</span>{" "}
                           <span className="text-green-700">
                              {formatFieldValue(d.field, d.after)}
                           </span>
                        </>
                     ) : (
                        <span className="text-green-700">
                           {formatFieldValue(d.field, d.after)}
                        </span>
                     )}
                  </li>
               ))}
            </ul>
         )}
      </li>
   );
}
