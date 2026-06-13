"use client";

import { useParams, useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { useMissao } from "@/hooks/queries/useMissoes";
import { MissionPage } from "../components/MissionPage";
import { formatDateTime } from "@/../utils/dateHandler";
import type {
   MissaoLog,
   MissaoLogSnapshot,
} from "services/routes/cegep/missoes";

// ─── Formatadores ─────────────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
   create: "Criação",
   update: "Atualização",
};

const FIELD_LABELS: Record<keyof MissaoLogSnapshot, string> = {
   tipo_doc: "Tipo de Ordem",
   n_doc: "Nº da Ordem",
   desc: "Descrição",
   afast: "Afastamento",
   regres: "Regresso",
   indenizavel: "Indenizável",
   acrec_desloc: "Acréscimo Desloc.",
   tipo: "Tipo de Missão",
   obs: "Observações",
};

const BOOL_FIELDS = new Set<keyof MissaoLogSnapshot>([
   "indenizavel",
   "acrec_desloc",
]);
const DATE_FIELDS = new Set<keyof MissaoLogSnapshot>(["afast", "regres"]);

function formatFieldValue(
   field: keyof MissaoLogSnapshot,
   value: unknown
): string {
   if (value === null || value === undefined) return "—";
   if (BOOL_FIELDS.has(field)) return value ? "Sim" : "Não";
   if (DATE_FIELDS.has(field)) {
      // ISO datetime → DD/MM/YYYY
      const s = String(value);
      const d = new Date(s.endsWith("Z") ? s : s + "Z");
      if (isNaN(d.getTime())) return s;
      return d.toLocaleDateString("pt-BR", {
         day: "2-digit",
         month: "2-digit",
         year: "numeric",
         timeZone: "UTC",
      });
   }
   if (field === "tipo_doc") return String(value).toUpperCase();
   if (field === "tipo") return String(value).toUpperCase();
   return String(value);
}

// ─── Componente de entrada do log ─────────────────────────────────────────────

function MissaoLogEntry({ log }: { log: MissaoLog }) {
   const action = ACTION_LABEL[log.action] ?? log.action;
   const before = log.before;
   const after = log.after;

   const diffs: {
      field: keyof MissaoLogSnapshot;
      before: unknown;
      after: unknown;
   }[] = [];

   if (after) {
      for (const field of Object.keys(
         FIELD_LABELS
      ) as (keyof MissaoLogSnapshot)[]) {
         const b = before ? before[field] : undefined;
         const a = after[field];
         if (b !== a) diffs.push({ field, before: b, after: a });
      }
   }

   return (
      <li className="relative">
         <span className="absolute -start-[26px] top-[6px] flex h-3 w-3 items-center justify-center rounded-full border border-red-300 bg-red-100" />
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
            <time className="text-xs whitespace-nowrap text-gray-400">
               {formatDateTime(log.timestamp) ?? ""}
            </time>
         </div>
         {diffs.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs break-words text-gray-600">
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

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MissaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const missaoId = Number(params.id);
   const { data: missao, isLoading } = useMissao(missaoId);

   const handleNavigateBack = () => {
      router.back();
   };

   const handleClone = () => {
      router.push(`/cegep/missoes/new?clone_from=${missaoId}`);
   };

   if (isLoading) {
      return (
         <div className="flex h-96 items-center justify-center">
            <Spinner size="xl" color="failure" />
         </div>
      );
   }

   if (!missao) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">Missão não encontrada.</p>
            <button
               onClick={handleNavigateBack}
               className="text-sm font-medium text-red-600 hover:underline"
            >
               Voltar para lista de missões
            </button>
         </div>
      );
   }

   const logs = missao.logs ?? [];

   return (
      <div className="flex flex-col gap-4 lg:flex-row">
         <MissionPage
            missao={missao}
            initialEdit={false}
            onClose={handleNavigateBack}
            onClone={handleClone}
         />

         {/* HISTÓRICO DE AUDITORIA — só renderiza se houver logs */}
         {logs.length > 0 && (
            <div className="w-full rounded border border-slate-300 bg-white shadow-sm lg:w-1/3 lg:shrink-0">
               <div className="border-b border-slate-300 bg-gray-50/50 px-5 py-3">
                  <h3 className="font-semibold text-gray-800">
                     Histórico de Alterações
                  </h3>
                  <p className="text-xs text-gray-500">
                     Registro de criações e atualizações desta missão.
                  </p>
               </div>
               <div className="p-5">
                  <ol className="relative space-y-4 border-s border-slate-300 ps-5">
                     {logs.map((log) => (
                        <MissaoLogEntry key={log.id} log={log} />
                     ))}
                  </ol>
               </div>
            </div>
         )}
      </div>
   );
}
