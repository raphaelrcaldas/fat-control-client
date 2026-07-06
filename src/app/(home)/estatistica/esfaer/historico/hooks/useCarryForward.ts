import { useMemo } from "react";
import { carryForwardSum, deriveGrupos } from "../utils";
import type {
   HistPoint,
   HistPrograma,
} from "services/routes/estatistica/esfAer";

export interface CarryForward {
   /** Grupos derivados dos dados (conhecidos em ordem canônica + demais). */
   grupos: string[];
   /** Carry-forward dos programas de cada grupo (séries Σ). */
   porGrupo: Record<string, HistPoint[]>;
   /** Soma dos `atual` de cada grupo, em MINUTOS (chips Σ da toolbar). */
   somaAtualPorGrupo: Record<string, number>;
}

/**
 * Deriva, de forma memoizada, os grupos presentes nos dados, as séries Σ
 * carry-forward por grupo e a soma de `atual` por grupo. O Total NÃO é
 * recomputado aqui: a fonte da timeline do Total é o backend
 * (`historico.total.timeline`).
 */
export function useCarryForward(programas: HistPrograma[]): CarryForward {
   return useMemo(() => {
      const grupos = deriveGrupos(programas);
      const porGrupo: Record<string, HistPoint[]> = {};
      const somaAtualPorGrupo: Record<string, number> = {};

      for (const grupo of grupos) {
         const doGrupo = programas.filter((p) => p.grupo === grupo);
         porGrupo[grupo] = carryForwardSum(doGrupo);
         somaAtualPorGrupo[grupo] = doGrupo.reduce(
            (sum, p) => sum + p.atual,
            0
         );
      }

      return { grupos, porGrupo, somaAtualPorGrupo };
   }, [programas]);
}
