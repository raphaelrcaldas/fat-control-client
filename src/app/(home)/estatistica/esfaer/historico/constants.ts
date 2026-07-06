/**
 * Paleta da view "Histórico de Esforço Aéreo".
 *
 * Cores cruas (hex) consumidas pelo ApexCharts em `useHistoricoSeries`. Mantidas
 * aqui — e não em classes Tailwind — porque o Apex recebe `colors: string[]`
 * posicional, não className. Tons sóbrios alinhados ao restante do sistema.
 *
 * `grupo` é string livre vinda do backend: os grupos conhecidos mantêm suas
 * cores fixas; grupos desconhecidos recebem uma cor/paleta de fallback
 * DETERMINÍSTICA (hash do nome → pool de fallback), para nunca quebrar e a cor
 * não mudar entre renders/sessões.
 */

/** Linha do Total (slate-900). */
export const TOTAL_COLOR = "#0f172a";

/** Cor de marca/realce (red-600), p. ex. destaque de série isolada/hover. */
export const BRAND_COLOR = "#dc2626";

/** Ordem canônica dos grupos conhecidos (usada por `deriveGrupos`). */
export const KNOWN_GRUPOS: readonly string[] = ["COMPREP", "COMAE", "DCTA"];

/** Cor base de cada grupo conhecido (Σ do grupo e tom dos seus programas). */
const KNOWN_GROUP_COLORS: Record<string, string> = {
   COMPREP: "#ea580c", // orange-600
   COMAE: "#2563eb", // blue-600
   DCTA: "#64748b", // slate-500
};

/**
 * Tons de cada grupo conhecido para as linhas dos programas. A cor de um
 * programa é escolhida ciclicamente pela ordem de aparição dentro do seu grupo
 * (`palette[index % palette.length]`), mantendo a linha visualmente filiada ao
 * Σ do grupo sem repetir exatamente a cor base.
 */
const KNOWN_GROUP_PALETTES: Record<string, string[]> = {
   COMPREP: ["#ea580c", "#fb923c", "#c2410c", "#f97316", "#fdba74"],
   COMAE: ["#2563eb", "#60a5fa", "#1d4ed8", "#3b82f6", "#93c5fd"],
   DCTA: ["#475569", "#94a3b8", "#64748b", "#334155", "#cbd5e1"],
};

/**
 * Pool de fallback para grupos desconhecidos (teal, violeta, rosa) — famílias
 * que não colidem com as cores dos grupos conhecidos nem com o vermelho de
 * marca. Cada entrada traz a cor base (Σ/badge) e a paleta dos programas.
 */
const FALLBACK_GROUPS: ReadonlyArray<{ color: string; palette: string[] }> = [
   {
      color: "#0d9488", // teal-600
      palette: ["#0d9488", "#2dd4bf", "#0f766e", "#14b8a6", "#99f6e4"],
   },
   {
      color: "#7c3aed", // violet-600
      palette: ["#7c3aed", "#a78bfa", "#6d28d9", "#8b5cf6", "#c4b5fd"],
   },
   {
      color: "#db2777", // pink-600
      palette: ["#db2777", "#f472b6", "#be185d", "#ec4899", "#f9a8d4"],
   },
];

/** Hash determinístico simples (djb2) → índice estável no pool de fallback. */
function fallbackIndex(grupo: string): number {
   let hash = 5381;
   for (let i = 0; i < grupo.length; i++) {
      hash = (hash * 33) ^ grupo.charCodeAt(i);
   }
   return Math.abs(hash) % FALLBACK_GROUPS.length;
}

/** Cor base de um grupo: fixa se conhecido, senão fallback determinístico. */
export function getGroupColor(grupo: string): string {
   return (
      KNOWN_GROUP_COLORS[grupo] ?? FALLBACK_GROUPS[fallbackIndex(grupo)].color
   );
}

/** Paleta de programas de um grupo: fixa se conhecido, senão fallback. */
export function getGroupPalette(grupo: string): string[] {
   return (
      KNOWN_GROUP_PALETTES[grupo] ??
      FALLBACK_GROUPS[fallbackIndex(grupo)].palette
   );
}
