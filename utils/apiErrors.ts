/**
 * Humanização genérica dos erros de validação (422) enviados pelo backend em
 * `ApiErrorResponse.errors` (dict caminho-do-campo → mensagem do Pydantic,
 * ex.: `body.pernoites.0.cidade_id` → "Field required").
 *
 * Este módulo não conhece nenhum payload específico: os rótulos de cada
 * domínio são injetados via {@link ApiErrorLabels}. Cada feature define seu
 * mapa de labels e chama {@link humanizeValidationErrors}.
 */

export interface ApiErrorLabels {
   /** Rótulos por nome de campo (nível topo e aninhados). */
   fields: Record<string, string>;
   /**
    * Rótulo do item para campos-array, aplicado quando o segmento seguinte é
    * um índice numérico (ex.: `pernoites` → "Pernoite" vira "Pernoite 1").
    */
   arrays?: Record<string, string>;
}

/** Traduz as mensagens mais comuns do Pydantic v2 para PT-BR curto. */
export function translatePydanticMessage(msg: string): string {
   // Validadores customizados (ValueError/AssertionError) chegam prefixados
   // por "Value error, " / "Assertion error, ". Nesses casos a mensagem já
   // foi escrita para o usuário — removemos só o prefixo técnico e a
   // preservamos como está (sem aplicar as heurísticas de tradução abaixo,
   // que achatariam textos legítimos como "Posição de piloto duplicada").
   const custom = msg.match(/^(?:value|assertion) error,\s*([\s\S]*)$/i);
   if (custom) return custom[1];

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

/** Traduz um caminho de campo: `body.pernoites.0.cidade_id` → "Pernoite 1 · Cidade". */
export function humanizeValidationKey(
   key: string,
   labels: ApiErrorLabels
): string {
   const segs = key.split(".").filter((s) => s !== "body");
   const parts: string[] = [];

   for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const next = segs[i + 1];
      if (labels.arrays?.[seg] && next !== undefined && /^\d+$/.test(next)) {
         parts.push(`${labels.arrays[seg]} ${Number(next) + 1}`);
         i++; // consome o índice do item
         continue;
      }
      if (/^\d+$/.test(seg)) continue; // índice sem rótulo de array
      parts.push(labels.fields[seg] ?? seg);
   }

   return parts.join(" · ");
}

/** Converte o dict `errors` em linhas "Rótulo: detalhe" prontas para exibição. */
export function humanizeValidationErrors(
   errors: Record<string, unknown>,
   labels: ApiErrorLabels
): string[] {
   return Object.entries(errors).map(([key, raw]) => {
      const label = humanizeValidationKey(key, labels);
      const detail = translatePydanticMessage(
         typeof raw === "string" ? raw : String(raw)
      );
      return label ? `${label}: ${detail}` : detail;
   });
}
