/**
 * Retorna classes Tailwind para visibilidade de colunas baseado no índice.
 * Colunas são progressivamente reveladas em telas maiores.
 *
 * | Colunas   | Breakpoint | Largura   |
 * |-----------|------------|-----------|
 * | 0-4       | default    | sempre    |
 * | 5-6       | sm         | ≥640px    |
 * | 7-9       | md         | ≥768px    |
 * | 10-13     | lg         | ≥1024px   |
 * | 14-17     | xl         | ≥1280px   |
 * | 18-21     | 2xl        | ≥1536px   |
 */
export function getColumnVisibilityClass(index: number): string {
   if (index < 7) return "";
   if (index < 10) return "hidden md:table-cell";
   if (index < 14) return "hidden lg:table-cell";
   if (index < 17) return "hidden xl:table-cell";
   return "hidden 2xl:table-cell";
}
