import type { LogUser, UserActionLog } from "services/routes/logs";
import {
   CAMPO_ESPECIAL_FIELDS,
   CAMPO_ESPECIAL_FIELD_LABELS,
   ETAPA_FIELDS,
   ETAPA_FIELD_LABELS,
   LISTA_LABELS,
   ORDEM_SCALAR_FIELDS,
   ORDEM_SCALAR_LABELS,
   TRIPULANTE_FIELDS,
   TRIPULANTE_FIELD_LABELS,
   describeCampoEspecial,
   describeCampoEspecialCurto,
   describeEtapa,
   describeEtapaCurta,
   describeTripulante,
   describeTripulanteCurto,
   formatSnapshotValue,
   pluralize,
} from "./ordemHistoricoLabels";

// Motor de diff do histórico de auditoria da OM.
//
// O backend grava em `before`/`after` (string JSON) um snapshot rico da ordem
// (`services/logs.ordem_snapshot`): escalares + listas de etapas, tripulação,
// ordens especiais e etiquetas. Diffar isso com `String(before[campo])` — como
// faz o `Historico` genérico do indisp — imprimiria "[object Object]", daí este
// módulo. Tudo aqui é puro: recebe log, devolve view-model pronto para render.

// --- Formato do snapshot (espelha api/fcontrol_api/services/logs.py) ---

export interface EtapaSnapshot {
   dt_dep?: string;
   dt_arr?: string;
   origem?: string;
   dest?: string;
   alternativa?: string | null;
   tvoo_etp?: number;
   tvoo_alt?: number | null;
   qtd_comb?: number | null;
   esf_aer?: string | null;
}

export interface TripulanteSnapshot {
   funcao?: string;
   tripulante_id?: number;
   p_g?: string;
   nome?: string;
}

export interface CampoEspecialSnapshot {
   label?: string;
   valor?: string;
}

export interface OrdemSnapshot {
   numero?: string | null;
   tipo?: string | null;
   matricula_anv?: string | null;
   projeto?: string | null;
   status?: string | null;
   esf_aer?: string | null;
   data_saida?: string | null;
   /** Ausente quando vazio — o backend omite a chave, não manda null. */
   doc_ref?: string | null;
   campos_especiais?: CampoEspecialSnapshot[];
   etapas?: EtapaSnapshot[];
   tripulacao?: TripulanteSnapshot[];
   etiquetas?: string[];
}

// --- View-model consumido pelos componentes ---

export type OrdemHistoricoAction = "create" | "update" | "delete";

/** Uma linha "Rótulo: antigo → novo". `null` = valor ausente/vazio. */
export interface ValueChange {
   field: string;
   label: string;
   before: string | null;
   after: string | null;
}

/** Item de lista que sobreviveu ao pareamento e mudou em algum campo. */
export interface ChangedListItem {
   key: string;
   label: string;
   fields: ValueChange[];
}

export interface ListDiff {
   key: string;
   label: string;
   added: { key: string; text: string }[];
   removed: { key: string; text: string }[];
   changed: ChangedListItem[];
}

/** Resumo de um evento de criação/exclusão (não é diff). */
export interface OrdemHistoricoSummary {
   identificacao: string;
   counts: string[];
}

export interface OrdemHistoricoEvent {
   id: number;
   action: OrdemHistoricoAction;
   timestamp: string;
   user: LogUser | null;
   /** Preenchido em create/delete; null em update. */
   summary: OrdemHistoricoSummary | null;
   scalars: ValueChange[];
   lists: ListDiff[];
   /** false = evento sem nenhuma diferença detectável para exibir. */
   hasDetail: boolean;
}

// --- Parsing ---

export function parseOrdemSnapshot(raw: string | null): OrdemSnapshot | null {
   if (!raw) return null;
   try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
         return null;
      }
      return parsed as OrdemSnapshot;
   } catch {
      return null;
   }
}

// --- Diff genérico de listas ---

// Separadores de controle: não colidem com o conteúdo textual do snapshot
// (siglas ICAO, rótulos, nomes), então a chave composta nunca fica ambígua.
const KEY_SEP = "\u0001";
const DUP_SEP = "\u0002";

// Indexa preservando duplicatas: a 2ª ocorrência da mesma chave ganha um
// sufixo. Sem isso, dois itens de mesma identidade se sobrescreveriam.
function indexBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T> {
   const map = new Map<string, T>();
   const seen = new Map<string, number>();
   for (const item of items) {
      const base = keyOf(item);
      const occurrence = seen.get(base) ?? 0;
      seen.set(base, occurrence + 1);
      map.set(occurrence === 0 ? base : `${base}${DUP_SEP}${occurrence}`, item);
   }
   return map;
}

interface PairedItems<T> {
   pairs: { key: string; before: T; after: T }[];
   added: T[];
   removed: T[];
}

/**
 * Pareia duas versões de uma lista por **chave de identidade** (nunca por
 * posição). O `fallbackKeyOf` opcional roda num 2º passe sobre as sobras: é o
 * que faz uma etapa que só teve o horário de decolagem ajustado aparecer como
 * "alterada" em vez de um par remoção + inclusão.
 */
function pairItems<T>(
   beforeItems: T[],
   afterItems: T[],
   keyOf: (item: T) => string,
   fallbackKeyOf?: (item: T) => string
): PairedItems<T> {
   const beforeMap = indexBy(beforeItems, keyOf);
   const afterMap = indexBy(afterItems, keyOf);

   const pairs: { key: string; before: T; after: T }[] = [];
   const removed: T[] = [];

   for (const [key, beforeItem] of beforeMap) {
      const afterItem = afterMap.get(key);
      if (afterItem === undefined) {
         removed.push(beforeItem);
         continue;
      }
      pairs.push({ key, before: beforeItem, after: afterItem });
      afterMap.delete(key);
   }

   let added = [...afterMap.values()];

   if (fallbackKeyOf && removed.length > 0 && added.length > 0) {
      const leftoverAfter = indexBy(added, fallbackKeyOf);
      const stillRemoved: T[] = [];
      for (const beforeItem of removed) {
         const fallbackKey = fallbackKeyOf(beforeItem);
         const match = leftoverAfter.get(fallbackKey);
         if (match === undefined) {
            stillRemoved.push(beforeItem);
            continue;
         }
         pairs.push({
            key: `${fallbackKey}${KEY_SEP}fallback`,
            before: beforeItem,
            after: match,
         });
         leftoverAfter.delete(fallbackKey);
      }
      removed.length = 0;
      removed.push(...stillRemoved);
      added = [...leftoverAfter.values()];
   }

   return { pairs, added, removed };
}

// Compara campo a campo dois itens pareados, já formatando para exibição.
function diffFields<T extends object>(
   before: T,
   after: T,
   fields: readonly string[],
   labels: Record<string, string>
): ValueChange[] {
   const changes: ValueChange[] = [];
   for (const field of fields) {
      const beforeValue = formatSnapshotValue(
         field,
         (before as Record<string, unknown>)[field]
      );
      const afterValue = formatSnapshotValue(
         field,
         (after as Record<string, unknown>)[field]
      );
      if (beforeValue === afterValue) continue;
      changes.push({
         field,
         label: labels[field] ?? field,
         before: beforeValue,
         after: afterValue,
      });
   }
   return changes;
}

interface ListDiffConfig<T> {
   key: string;
   before: T[];
   after: T[];
   keyOf: (item: T) => string;
   fallbackKeyOf?: (item: T) => string;
   describe: (item: T) => string;
   describeShort?: (item: T) => string;
   fields?: readonly string[];
   fieldLabels?: Record<string, string>;
}

function buildListDiff<T extends object>({
   key,
   before,
   after,
   keyOf,
   fallbackKeyOf,
   describe,
   describeShort,
   fields,
   fieldLabels,
}: ListDiffConfig<T>): ListDiff | null {
   const { pairs, added, removed } = pairItems(
      before,
      after,
      keyOf,
      fallbackKeyOf
   );

   const changed: ChangedListItem[] = [];
   if (fields && fieldLabels) {
      for (const pair of pairs) {
         const fieldChanges = diffFields(
            pair.before,
            pair.after,
            fields,
            fieldLabels
         );
         if (fieldChanges.length === 0) continue;
         changed.push({
            key: pair.key,
            label: (describeShort ?? describe)(pair.before),
            fields: fieldChanges,
         });
      }
   }

   if (added.length === 0 && removed.length === 0 && changed.length === 0) {
      return null;
   }

   return {
      key,
      label: LISTA_LABELS[key] ?? key,
      added: added.map((item, index) => ({
         key: `${keyOf(item)}${DUP_SEP}${index}`,
         text: describe(item),
      })),
      removed: removed.map((item, index) => ({
         key: `${keyOf(item)}${DUP_SEP}${index}`,
         text: describe(item),
      })),
      changed,
   };
}

// --- Diff de snapshots de OM ---

function diffScalars(
   before: OrdemSnapshot,
   after: OrdemSnapshot
): ValueChange[] {
   return diffFields(before, after, ORDEM_SCALAR_FIELDS, ORDEM_SCALAR_LABELS);
}

function diffLists(before: OrdemSnapshot, after: OrdemSnapshot): ListDiff[] {
   const diffs: (ListDiff | null)[] = [
      buildListDiff<TripulanteSnapshot>({
         key: "tripulacao",
         before: before.tripulacao ?? [],
         after: after.tripulacao ?? [],
         keyOf: (t) => `${t.funcao ?? ""}${KEY_SEP}${t.tripulante_id ?? ""}`,
         fallbackKeyOf: (t) => String(t.tripulante_id ?? ""),
         describe: describeTripulante,
         describeShort: describeTripulanteCurto,
         fields: TRIPULANTE_FIELDS,
         fieldLabels: TRIPULANTE_FIELD_LABELS,
      }),
      buildListDiff<EtapaSnapshot>({
         key: "etapas",
         before: before.etapas ?? [],
         after: after.etapas ?? [],
         keyOf: (e) =>
            `${e.dt_dep ?? ""}${KEY_SEP}${e.origem ?? ""}${KEY_SEP}${e.dest ?? ""}`,
         fallbackKeyOf: (e) => `${e.origem ?? ""}${KEY_SEP}${e.dest ?? ""}`,
         describe: describeEtapa,
         describeShort: describeEtapaCurta,
         fields: ETAPA_FIELDS,
         fieldLabels: ETAPA_FIELD_LABELS,
      }),
      buildListDiff<CampoEspecialSnapshot>({
         key: "campos_especiais",
         before: before.campos_especiais ?? [],
         after: after.campos_especiais ?? [],
         keyOf: (c) => c.label ?? "",
         fallbackKeyOf: (c) => c.valor ?? "",
         describe: describeCampoEspecial,
         describeShort: describeCampoEspecialCurto,
         fields: CAMPO_ESPECIAL_FIELDS,
         fieldLabels: CAMPO_ESPECIAL_FIELD_LABELS,
      }),
      buildListDiff<{ nome: string }>({
         key: "etiquetas",
         before: (before.etiquetas ?? []).map((nome) => ({ nome })),
         after: (after.etiquetas ?? []).map((nome) => ({ nome })),
         keyOf: (e) => e.nome,
         describe: (e) => e.nome,
      }),
   ];

   return diffs.filter((diff): diff is ListDiff => diff !== null);
}

// --- Resumo de criação/exclusão ---

function buildSummary(snapshot: OrdemSnapshot): OrdemHistoricoSummary {
   const identificacao =
      [
         snapshot.numero,
         snapshot.matricula_anv,
         formatSnapshotValue("data_saida", snapshot.data_saida),
      ]
         .filter(Boolean)
         .join(" · ") || "Ordem de Missão";

   return {
      identificacao,
      counts: [
         pluralize((snapshot.etapas ?? []).length, "etapa", "etapas"),
         pluralize(
            (snapshot.tripulacao ?? []).length,
            "tripulante",
            "tripulantes"
         ),
         pluralize(
            (snapshot.campos_especiais ?? []).length,
            "ordem especial",
            "ordens especiais"
         ),
         pluralize((snapshot.etiquetas ?? []).length, "etiqueta", "etiquetas"),
      ],
   };
}

// --- Entrada pública ---

function normalizeAction(action: string): OrdemHistoricoAction {
   if (action === "create" || action === "delete") return action;
   return "update";
}

function buildEvent(log: UserActionLog): OrdemHistoricoEvent {
   const action = normalizeAction(log.action);
   const before = parseOrdemSnapshot(log.before);
   const after = parseOrdemSnapshot(log.after);

   // create só tem `after`; delete só tem `before` — nos dois casos o snapshot
   // inteiro é o evento, não uma lista de mudanças.
   if (action === "create" || action === "delete") {
      const snapshot = action === "create" ? after : before;
      return {
         id: log.id,
         action,
         timestamp: log.timestamp,
         user: log.user ?? null,
         summary: snapshot ? buildSummary(snapshot) : null,
         scalars: [],
         lists: [],
         hasDetail: snapshot !== null,
      };
   }

   const scalars = diffScalars(before ?? {}, after ?? {});
   const lists = diffLists(before ?? {}, after ?? {});

   return {
      id: log.id,
      action,
      timestamp: log.timestamp,
      user: log.user ?? null,
      summary: null,
      scalars,
      lists,
      hasDetail: scalars.length > 0 || lists.length > 0,
   };
}

/**
 * Converte os logs de auditoria da OM em eventos prontos para render, em
 * ordem cronológica (mais antigo primeiro), com `id` como desempate.
 */
export function buildOrdemHistoricoEvents(
   logs: UserActionLog[]
): OrdemHistoricoEvent[] {
   return [...logs]
      .sort((a, b) => {
         const diff =
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
         return diff !== 0 ? diff : a.id - b.id;
      })
      .map(buildEvent);
}
