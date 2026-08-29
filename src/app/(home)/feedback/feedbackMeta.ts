import type { IconType } from "react-icons";
import {
   MdBugReport,
   MdFavoriteBorder,
   MdHelpOutline,
   MdLightbulbOutline,
} from "react-icons/md";
import type { FeedbackStatus, FeedbackTipo } from "services/routes/feedbacks";

/* Espelha `fatbird/src/app/(home)/feedback/feedbackMeta.ts` — os repos são
   independentes, então o rótulo que o tripulante lê no portal e o que a
   administração lê aqui vivem em dois arquivos. Mudou de um lado, mude do
   outro (o valor cru é o contrato; o rótulo é apresentação). */

export const TIPO_META: Record<
   FeedbackTipo,
   { label: string; icon: IconType }
> = {
   bug: { label: "Problema", icon: MdBugReport },
   sugestao: { label: "Sugestão", icon: MdLightbulbOutline },
   duvida: { label: "Dúvida", icon: MdHelpOutline },
   elogio: { label: "Elogio", icon: MdFavoriteBorder },
};

interface StatusMeta {
   label: string;
   /** Selo do estado. Semântica de status — não acompanha o tema da org. */
   badge: string;
}

/** Ordem do fluxo: é ela que ordena os filtros e o seletor do modal. */
export const STATUS_ORDEM: FeedbackStatus[] = [
   "aberto",
   "em_analise",
   "aceito",
   "concluido",
   "recusado",
];

export const STATUS_META: Record<FeedbackStatus, StatusMeta> = {
   aberto: {
      label: "Aberto",
      badge: "border-slate-200 bg-slate-50 text-slate-700",
   },
   em_analise: {
      label: "Em análise",
      badge: "border-amber-200 bg-amber-50 text-amber-800",
   },
   aceito: {
      label: "Aceito",
      badge: "border-sky-200 bg-sky-50 text-sky-800",
   },
   concluido: {
      label: "Concluído",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
   },
   recusado: {
      label: "Não será feito",
      badge: "border-rose-200 bg-rose-50 text-rose-800",
   },
};
