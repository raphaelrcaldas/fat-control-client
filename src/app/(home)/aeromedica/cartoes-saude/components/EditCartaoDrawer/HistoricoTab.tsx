"use client";

import { useMemo } from "react";
import type { IconType } from "react-icons";
import {
   HiBan,
   HiClock,
   HiDocumentAdd,
   HiDocumentRemove,
   HiPencilAlt,
   HiPlusCircle,
   HiTrash,
} from "react-icons/hi";
import clsx from "clsx";
import { useCartaoSaudeHistorico } from "@/hooks/queries";
import { HISTORICO_LIMIT } from "services/routes/aeromedica/cartoesSaude";
import type { UserActionLog } from "services/routes/logs";
import { formatDateFull, formatDateTime } from "utils/dateHandler";
import HistoricoTabSkeleton from "./HistoricoTabSkeleton";

// Rótulos dos campos que aparecem no before/after gravado pela API
// (routers/aeromedica/cartoes.py e atas.py).
const FIELD_LABELS: Record<string, string> = {
   prontuario: "Prontuário",
   cemal: "CEMAL",
   tovn: "TOVN",
   imae: "IMAE",
   file_name: "Arquivo",
   letra_finalidade: "Letra de finalidade",
   data_realizacao: "Realização",
   validade_inspsau: "Validade",
   cartao_criado: "Cartão criado por esta ata",
};

// Campos que guardam data ISO — o resto sai como veio do log.
const DATE_FIELDS = new Set([
   "cemal",
   "tovn",
   "imae",
   "data_realizacao",
   "validade_inspsau",
]);

type Tom = "create" | "update" | "delete";

// Acento só na borda esquerda, sobre cartão branco — mesma gramática do
// histórico da OM (OrdemHistoricoItem). Com 20 eventos empilhados, fundo
// tonal em todos vira ruído; a cor da espinha basta para dar o tom.
const TOM_STYLE: Record<Tom, { accent: string; text: string }> = {
   create: { accent: "border-l-green-500", text: "text-green-700" },
   update: { accent: "border-l-amber-500", text: "text-amber-700" },
   delete: { accent: "border-l-red-500", text: "text-red-700" },
};

const ACTION_CONFIG: Record<
   string,
   { label: string; tom: Tom; Icon: IconType }
> = {
   create: { label: "Cartão cadastrado", tom: "create", Icon: HiPlusCircle },
   update: { label: "Cartão alterado", tom: "update", Icon: HiPencilAlt },
   delete: { label: "Cartão removido", tom: "delete", Icon: HiTrash },
   ata_create: { label: "Ata anexada", tom: "create", Icon: HiDocumentAdd },
   ata_update: { label: "Ata corrigida", tom: "update", Icon: HiPencilAlt },
   ata_delete: {
      label: "Ata removida",
      tom: "delete",
      Icon: HiDocumentRemove,
   },
   // Gravada pelo gate de permissão (security.py), não pelos endpoints do
   // domínio, mas cai no mesmo par resource/resource_id — e uma tentativa
   // barrada de ver dado de saúde é exatamente o que a trilha existe para
   // mostrar. Sem esta linha o identificador cru vazaria para a tela.
   access_denied: {
      label: "Acesso negado",
      tom: "delete",
      Icon: HiBan,
   },
};

function formatValue(field: string, value: unknown): string {
   if (typeof value === "boolean") return value ? "sim" : "não";
   const str = String(value ?? "");
   if (!str) return "—";
   if (DATE_FIELDS.has(field)) return formatDateFull(str) || str;
   return str;
}

function parseJson(raw: string | null): Record<string, unknown> {
   if (!raw) return {};
   try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
   } catch {
      return {};
   }
}

interface Linha {
   field: string;
   label: string;
   oldValue: string | null;
   newValue: string | null;
}

/**
 * Um evento da trilha: cartão e atas dividem a mesma linha do tempo do
 * militar (mesmo `resource` no backend), então a distinção vem do `action`.
 *
 * As linhas saem da união das chaves de `before`/`after`, e não de uma lista
 * fixa: o formato do payload é do backend, e cravar campos aqui esconderia
 * silenciosamente qualquer campo novo que passasse a ser auditado.
 */
function EventoCard({ log }: { log: UserActionLog }) {
   const { label, tom, Icon } = ACTION_CONFIG[log.action] ?? {
      label: log.action,
      tom: "update" as Tom,
      Icon: HiPencilAlt,
   };
   const style = TOM_STYLE[tom];

   const linhas = useMemo<Linha[]>(() => {
      const before = parseJson(log.before);
      const after = parseJson(log.after);
      const campos = Array.from(
         new Set([...Object.keys(before), ...Object.keys(after)])
      );

      return campos
         .filter((field) => {
            // Flag de evento em falso não é informação ("Cartão criado por
            // esta ata: não"). O descarte é pela AUSÊNCIA no `before` — uma
            // transição real `true → false` tem os dois lados e continua
            // aparecendo, mesmo que hoje o backend não grave nenhuma.
            return !(!(field in before) && after[field] === false);
         })
         .map((field) => ({
            field,
            label: FIELD_LABELS[field] || field,
            oldValue:
               field in before ? formatValue(field, before[field]) : null,
            newValue: field in after ? formatValue(field, after[field]) : null,
         }))
         .filter((linha) => {
            // Linha sem informação dos dois lados é ruído: o cadastro grava
            // os quatro campos do cartão mesmo quando só um foi preenchido.
            const vazio = (v: string | null) => v === null || v === "—";
            if (vazio(linha.oldValue) && vazio(linha.newValue)) return false;
            return linha.oldValue !== linha.newValue;
         });
   }, [log.before, log.after]);

   return (
      <div
         className={clsx(
            "rounded border border-l-2 border-slate-200 bg-white p-3 text-sm shadow-sm",
            style.accent
         )}
      >
         <div className="flex items-center justify-between gap-2">
            <span
               className={clsx(
                  "flex items-center gap-1.5 font-medium",
                  style.text
               )}
            >
               <Icon className="h-4 w-4 shrink-0" aria-hidden />
               {label}
            </span>
            <time
               dateTime={log.timestamp}
               className="shrink-0 font-mono text-xs text-gray-500"
            >
               {formatDateTime(log.timestamp)}
            </time>
         </div>

         <div className="text-gray-600 uppercase">
            {log.user.p_g} {log.user.nome_guerra}
         </div>

         {linhas.length > 0 && (
            <ul className="mt-2 space-y-1">
               {linhas.map((linha) => (
                  <li key={linha.field} className="text-gray-600">
                     <span className="font-medium">{linha.label}:</span>{" "}
                     {linha.oldValue !== null && (
                        <span
                           className={clsx(
                              linha.newValue !== null &&
                                 "text-red-600 line-through"
                           )}
                        >
                           {linha.oldValue}
                        </span>
                     )}
                     {linha.oldValue !== null && linha.newValue !== null
                        ? " → "
                        : null}
                     {linha.newValue !== null && (
                        // 700, não 600: o valor novo é o dado mais
                        // importante da linha e `text-green-600` sobre
                        // `bg-green-50` fica em ~3,1:1, abaixo do AA.
                        <span className="text-green-700">{linha.newValue}</span>
                     )}
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}

export default function HistoricoTab({ userId }: { userId: number }) {
   const {
      data: logs = [],
      isLoading,
      isError,
      error,
   } = useCartaoSaudeHistorico(userId);

   if (isLoading) return <HistoricoTabSkeleton />;

   // Falha de carga não pode se passar por "sem registros": a diferença entre
   // "nada aconteceu" e "não consegui ler" é o ponto de uma auditoria.
   if (isError) {
      return (
         <p className="py-4 text-center text-sm text-red-600">
            {error instanceof Error
               ? error.message
               : "Não foi possível carregar o histórico."}
         </p>
      );
   }

   if (logs.length === 0) {
      return (
         <div className="flex flex-col items-center rounded border border-dashed border-slate-300 px-4 py-8 text-center">
            <HiClock className="mb-3 h-10 w-10 text-gray-400" />
            <p className="font-medium text-gray-600">
               Sem registros de alteração
            </p>
            {/* Sem "agora": o texto continuaria dizendo isso daqui a um ano
                para todo militar que nunca teve alteração. */}
            <p className="mt-1 text-sm text-gray-500">
               Alterações anteriores à implantação da auditoria não constam da
               trilha.
            </p>
         </div>
      );
   }

   return (
      // A API já devolve do mais recente para o mais antigo: numa trilha de
      // auditoria a pergunta é "o que mudou por último", não "como começou".
      //
      // Sem `max-h`/`overflow` próprios: quem rola é o corpo do modal. Um
      // container rolável cujos filhos são só texto não recebe foco, e a
      // lista ficaria inalcançável por teclado depois do 4º evento.
      <div className="space-y-2">
         {logs.map((log) => (
            <EventoCard key={log.id} log={log} />
         ))}

         {/* A lista corta no teto do backend: sem dizer isso, os eventos
             mais antigos simplesmente sumiriam. */}
         {logs.length >= HISTORICO_LIMIT && (
            <p className="pt-1 text-center text-xs text-gray-500">
               Mostrando os {HISTORICO_LIMIT} eventos mais recentes.
            </p>
         )}
      </div>
   );
}
