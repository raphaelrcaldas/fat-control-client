"use client";

import { useParams, useRouter } from "next/navigation";
import { useMissao } from "@/hooks/queries/useMissoes";
import { MissionPage } from "../components/MissionPage";
import { MissionPageSkeleton } from "../components/MissionPageSkeleton";
import { formatNaiveDate } from "@/../utils/dateHandler";
import { Timeline } from "flowbite-react";
import { AuditTimelineItem } from "@/components/audit/AuditTimelineItem";
import { AuditValueDelta } from "@/components/audit/AuditValueDelta";
import { TIMELINE_DENSO } from "@/components/audit/timelineTheme";
import { SITUACAO_CONFIG, SituacaoType } from "@/constants/cegep/situacoes";
import type {
   MissaoLog,
   MissaoLogSnapshot,
} from "services/routes/cegep/missoes";

// ─── Formatadores ─────────────────────────────────────────────────────────────

const ACTION_LABEL: Record<string, string> = {
   create: "Criação",
   update: "Atualização",
   delete: "Exclusão",
};

// A COR do evento é compartilhada com as demais trilhas; o rótulo, não. Antes
// toda ação — inclusive a criação — saía com a mesma bolinha VERMELHA, o que
// além de não distinguir nada gastava o vermelho que o sistema reserva a
// perigo e exclusão.
const ACTION_TONE = {
   create: "create",
   update: "update",
   delete: "delete",
} as const;

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
   // Renderizados à parte (listas) — não entram no loop escalar abaixo.
   militares: "Militares",
   pernoites: "Pernoites",
   etiquetas: "Etiquetas",
};

const SCALAR_FIELDS = Object.keys(FIELD_LABELS).filter(
   (f) => f !== "militares" && f !== "pernoites" && f !== "etiquetas"
) as (keyof MissaoLogSnapshot)[];

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
      // afast/regres são datetime naive — formatação string-pura (fuso-safe)
      return formatNaiveDate(String(value)) || String(value);
   }
   if (field === "tipo_doc") return String(value).toUpperCase();
   if (field === "tipo") return String(value).toUpperCase();
   return String(value);
}

// ─── Diff de listas (militares/pernoites/etiquetas) ───────────────────────────

type MissaoMilitar = NonNullable<MissaoLogSnapshot["militares"]>[number];
type MissaoPernoite = NonNullable<MissaoLogSnapshot["pernoites"]>[number];

type ListField = "militares" | "pernoites" | "etiquetas";

/** Diff por igualdade estrutural de item — as listas já vêm ordenadas do backend. */
function diffLista<T>(
   before: T[] | undefined,
   after: T[] | undefined
): { removidos: T[]; adicionados: T[] } {
   const b = before ?? [];
   const a = after ?? [];
   const bKeys = new Set(b.map((item) => JSON.stringify(item)));
   const aKeys = new Set(a.map((item) => JSON.stringify(item)));
   return {
      removidos: b.filter((item) => !aKeys.has(JSON.stringify(item))),
      adicionados: a.filter((item) => !bKeys.has(JSON.stringify(item))),
   };
}

function formatMilitar(m: MissaoMilitar): string {
   const situ = SITUACAO_CONFIG[m.sit as SituacaoType]?.label ?? m.sit;
   return `${m.p_g.toUpperCase()} ${m.nome} (${situ})`;
}

function formatPernoite(p: MissaoPernoite): string {
   return `${p.cidade} — ${formatNaiveDate(p.data_ini)} a ${formatNaiveDate(p.data_fim)}`;
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

   const listDiffs: {
      field: ListField;
      removidos: string[];
      adicionados: string[];
   }[] = [];

   if (after) {
      for (const field of SCALAR_FIELDS) {
         const b = before ? before[field] : undefined;
         const a = after[field];
         if (b !== a) diffs.push({ field, before: b, after: a });
      }

      const militares = diffLista(before?.militares, after.militares);
      if (militares.removidos.length > 0 || militares.adicionados.length > 0) {
         listDiffs.push({
            field: "militares",
            removidos: militares.removidos.map(formatMilitar),
            adicionados: militares.adicionados.map(formatMilitar),
         });
      }

      const pernoites = diffLista(before?.pernoites, after.pernoites);
      if (pernoites.removidos.length > 0 || pernoites.adicionados.length > 0) {
         listDiffs.push({
            field: "pernoites",
            removidos: pernoites.removidos.map(formatPernoite),
            adicionados: pernoites.adicionados.map(formatPernoite),
         });
      }

      const etiquetas = diffLista(before?.etiquetas, after.etiquetas);
      if (etiquetas.removidos.length > 0 || etiquetas.adicionados.length > 0) {
         listDiffs.push({
            field: "etiquetas",
            removidos: etiquetas.removidos,
            adicionados: etiquetas.adicionados,
         });
      }
   }

   return (
      <AuditTimelineItem
         tone={ACTION_TONE[log.action as keyof typeof ACTION_TONE] ?? "update"}
         label={action}
         timestamp={log.timestamp}
         user={log.user}
      >
         {(diffs.length > 0 || listDiffs.length > 0) && (
            <ul className="space-y-0.5 wrap-break-word text-slate-600">
               {diffs.map((d) => (
                  <li key={d.field}>
                     <span className="font-medium text-slate-700">
                        {FIELD_LABELS[d.field]}:
                     </span>{" "}
                     <AuditValueDelta
                        before={
                           d.before === undefined || d.before === null
                              ? null
                              : formatFieldValue(d.field, d.before)
                        }
                        after={formatFieldValue(d.field, d.after)}
                     />
                  </li>
               ))}
               {listDiffs.map((d) => (
                  <li key={d.field}>
                     <span className="font-medium text-gray-700">
                        {FIELD_LABELS[d.field]}:
                     </span>
                     <ul className="ml-2 space-y-0.5">
                        {d.removidos.map((item, i) => (
                           <li
                              key={`${d.field}-rem-${i}`}
                              className="text-red-600 line-through"
                           >
                              − {item}
                           </li>
                        ))}
                        {d.adicionados.map((item, i) => (
                           <li
                              key={`${d.field}-add-${i}`}
                              className="text-green-700"
                           >
                              + {item}
                           </li>
                        ))}
                     </ul>
                  </li>
               ))}
            </ul>
         )}
      </AuditTimelineItem>
   );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MissaoDetailPage() {
   const params = useParams<{ id: string }>();
   const router = useRouter();
   const missaoId = Number(params.id);
   const {
      data: missao,
      isLoading,
      isError,
      error,
      refetch,
   } = useMissao(missaoId);

   const handleNavigateBack = () => {
      router.back();
   };

   const handleClone = () => {
      router.push(`/cegep/missoes/new?clone_from=${missaoId}`);
   };

   if (isLoading) {
      return <MissionPageSkeleton />;
   }

   if (isError) {
      return (
         <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg text-gray-500">
               {error instanceof Error
                  ? error.message
                  : "Erro ao carregar a missão."}
            </p>
            <div className="flex items-center gap-4">
               <button
                  onClick={() => refetch()}
                  className="text-sm font-medium text-red-600 hover:underline"
               >
                  Tentar novamente
               </button>
               <button
                  onClick={handleNavigateBack}
                  className="text-sm font-medium text-gray-600 hover:underline"
               >
                  Voltar
               </button>
            </div>
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
      <div className="flex flex-col gap-4">
         <MissionPage
            missao={missao}
            initialEdit={false}
            onClose={handleNavigateBack}
            onClone={handleClone}
         />

         {/* HISTÓRICO DE AUDITORIA — só renderiza se houver logs.
             Embaixo, e não numa coluna lateral: o diff é texto corrido com
             "antigo → novo", e espremido em 1/3 da largura cada mudança
             quebrava em três linhas. Mesma posição do histórico do
             comissionamento e da OM — a trilha fica no mesmo lugar em todo o
             sistema. */}
         {logs.length > 0 && (
            <div className="flex w-full justify-center">
               <div className="w-full max-w-7xl rounded border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3">
                     <h3 className="font-semibold text-slate-800">
                        Histórico de Alterações
                     </h3>
                     <p className="text-xs text-slate-500">
                        Registro de criações e atualizações desta missão.
                     </p>
                  </div>
                  <div className="p-5">
                     <Timeline theme={TIMELINE_DENSO}>
                        {logs.map((log) => (
                           <MissaoLogEntry key={log.id} log={log} />
                        ))}
                     </Timeline>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
