import { ApiError } from "services/Api";

import type { MissaoDraft } from "./types";

/**
 * Traducao dos erros de salvamento da missao (validacao Pydantic 422 e erros de
 * negocio do router) para uma forma legivel ao usuario. O backend ja envia um
 * dict `errors` com o caminho do campo (ex.: `body.etapas.0.dep`) e, nas regras
 * de negocio, mensagens com tokens como `etapa[0]` / `create[1]` /
 * `update[0](id=42)`. Aqui esses caminhos/tokens viram "Etapa N · Campo".
 */

/** Rotulos dos campos da etapa — espelham os labels do formulario. */
const ETAPA_FIELD_LABELS: Record<string, string> = {
   data: "Data",
   origem: "Origem",
   destino: "Destino",
   dep: "Decolagem",
   arr: "Pouso",
   anv: "Aeronave",
   pousos: "Qtd. Pousos",
   tow: "TOW",
   pax: "PAX",
   carga: "Carga",
   comb: "Comb",
   lub: "Lub",
   nivel: "Nível",
   obs: "Observações",
   tvoo: "Tempo de voo",
   sagem: "Sagem",
   parte1: "Parte 1",
   tripulantes: "Tripulantes",
   oi_etapas: "Ordens de instrução",
   pqd: "PQD",
   revo: "REVO",
   heavy_cds: "Heavy CDS",
};

/** Rotulos dos campos no nivel da missao. */
const MISSAO_FIELD_LABELS: Record<string, string> = {
   titulo: "Título da missão",
   obs: "Observações da missão",
   is_simulador: "Simulador",
   etapas: "Etapas",
};

/**
 * Resolve o indice de uma etapa em cada uma das 3 formas de payload para o seu
 * numero de exibicao (1-based, na ordem da sidebar).
 */
interface EtapaResolvers {
   /** create-mission: `etapas[i]` mapeia direto para a i-esima etapa. */
   fromEtapas: (i: number) => number;
   /** update-mission: `update[i]` = i-esima etapa existente e modificada. */
   fromUpdate: (i: number) => number | null;
   /** update-mission: `create[i]` = i-esima etapa nova. */
   fromCreate: (i: number) => number | null;
   /** update-mission: `update[..](id=X)` = etapa com serverId X. */
   fromServerId: (id: number) => number | null;
}

function buildResolvers(draft: MissaoDraft): EtapaResolvers {
   const displayByServerId = new Map<number, number>();
   const dirtyExisting: number[] = [];
   const newEtapas: number[] = [];

   draft.etapas.forEach((etapa, idx) => {
      const display = idx + 1;
      if (etapa.serverId !== null) {
         displayByServerId.set(etapa.serverId, display);
         if (etapa.dirty) dirtyExisting.push(display);
      } else {
         newEtapas.push(display);
      }
   });

   return {
      fromEtapas: (i) => i + 1,
      fromUpdate: (i) => dirtyExisting[i] ?? null,
      fromCreate: (i) => newEtapas[i] ?? null,
      fromServerId: (id) => displayByServerId.get(id) ?? null,
   };
}

/** Traduz as mensagens mais comuns do Pydantic v2 para PT-BR curto. */
function translatePydantic(msg: string): string {
   const m = msg.toLowerCase();
   if (m.includes("field required")) return "obrigatório";
   if (m.includes("should be a valid") || m.includes("valid")) {
      return "valor inválido";
   }
   if (m.includes("greater than or equal")) {
      const n = msg.match(/-?\d+(\.\d+)?/)?.[0];
      return n ? `deve ser ≥ ${n}` : "valor muito baixo";
   }
   if (m.includes("less than or equal")) {
      const n = msg.match(/-?\d+(\.\d+)?/)?.[0];
      return n ? `deve ser ≤ ${n}` : "valor muito alto";
   }
   if (m.includes("greater than")) return "valor muito baixo";
   if (m.includes("less than")) return "valor muito alto";
   return msg;
}

/** Constroi o rotulo do campo (com indice nested quando houver). */
function humanizeField(segs: string[]): string {
   if (segs.length === 0) return "";
   const [field, ...rest] = segs;
   const base = ETAPA_FIELD_LABELS[field] ?? field;
   // nested indexado: `tripulantes.0.trip_id` -> "Tripulantes 1"
   if (rest.length > 0 && /^\d+$/.test(rest[0])) {
      return `${base} ${Number(rest[0]) + 1}`;
   }
   return base;
}

/** Traduz uma chave de erro estruturado (ex.: `body.etapas.0.dep`). */
function humanizeKey(key: string, resolvers: EtapaResolvers): string {
   const segs = key.split(".").filter((s) => s !== "body");
   const [head, ...rest] = segs;

   if (head === "etapas" || head === "update" || head === "create") {
      const idx = Number(rest[0]);
      const fieldSegs = rest.slice(1);
      let etapaNum: number | null;
      if (head === "etapas") etapaNum = resolvers.fromEtapas(idx);
      else if (head === "update") etapaNum = resolvers.fromUpdate(idx);
      else etapaNum = resolvers.fromCreate(idx);

      const etapaLabel = etapaNum != null ? `Etapa ${etapaNum}` : "Etapa";
      const fieldLabel = humanizeField(fieldSegs);
      return fieldLabel ? `${etapaLabel} · ${fieldLabel}` : etapaLabel;
   }

   return MISSAO_FIELD_LABELS[head] ?? head;
}

/**
 * Substitui os tokens de etapa nas mensagens de erro de negocio por "Etapa N".
 * A ordem importa: `update[..](id=X)` antes de `update[..]` cru.
 */
function humanizeBusinessMessage(
   msg: string,
   resolvers: EtapaResolvers
): string {
   return msg
      .replace(/update\[\d+\]\(id=(\d+)\)/g, (_, id) => {
         const n = resolvers.fromServerId(Number(id));
         return n != null ? `Etapa ${n}` : `Etapa (#${id})`;
      })
      .replace(/create\[(\d+)\]/g, (_, i) => {
         const n = resolvers.fromCreate(Number(i));
         return n != null ? `Etapa ${n}` : "Etapa nova";
      })
      .replace(/etapa\[(\d+)\]/g, (_, i) => `Etapa ${Number(i) + 1}`);
}

export interface FormattedSaveError {
   title: string;
   message: string;
}

/**
 * Converte o erro lancado pela mutation de salvar/atualizar missao em um
 * titulo + corpo (multi-linha) prontos para o toast persistente.
 */
export function formatSaveError(
   err: unknown,
   draft: MissaoDraft
): FormattedSaveError {
   const resolvers = buildResolvers(draft);

   // 422 de validacao: dict `errors` com campo -> mensagem.
   if (
      err instanceof ApiError &&
      err.errors &&
      Object.keys(err.errors).length > 0
   ) {
      const lines = Object.entries(err.errors).map(([key, raw]) => {
         const label = humanizeKey(key, resolvers);
         const detail = translatePydantic(
            typeof raw === "string" ? raw : String(raw)
         );
         return `• ${label}: ${detail}`;
      });
      return {
         title: err.message || "Erro de validação",
         message: lines.join("\n"),
      };
   }

   // Erro de negocio (string) ou erro generico/rede.
   const raw = err instanceof Error ? err.message : "Falha ao salvar a missão.";
   return {
      title: "Não foi possível salvar",
      message: humanizeBusinessMessage(raw, resolvers),
   };
}
