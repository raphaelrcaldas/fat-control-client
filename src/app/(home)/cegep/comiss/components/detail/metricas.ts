import { ComissWithMiss } from "services/routes/cegep/comiss";

/** Menor diária usada como base para converter valores em "dias equivalentes". */
export const DIARIA_MINIMA = 335;

export interface MetricaConfig {
   label: string;
   /** Com `dias_cumprir`, a métrica é em dias (sem Popover). Sem ele, é
    *  monetária e mostra o equivalente em dias via Popover. */
   hasPopover: boolean;
   valor?: number;
   dias?: number;
}

/**
 * Deriva as 3 métricas (Previsto/Computado/Restante) de uma vez, centralizando
 * a regra de negócio. Antes a lógica estava duplicada nos 3 Popovers da view.
 */
export function buildMetricas(comiss: ComissWithMiss): MetricaConfig[] {
   if (comiss.dias_cumprir) {
      return [
         { label: "Previsto", hasPopover: false, dias: comiss.dias_cumprir },
         { label: "Computado", hasPopover: false, dias: comiss.dias_comp },
         {
            label: "Restante",
            hasPopover: false,
            dias: comiss.dias_cumprir - comiss.dias_comp,
         },
      ];
   }

   const previsto = (comiss.valor_aj_ab || 0) + (comiss.valor_aj_fc || 0);
   return [
      { label: "Previsto", hasPopover: true, valor: previsto },
      { label: "Computado", hasPopover: true, valor: comiss.vals_comp },
      {
         label: "Restante",
         hasPopover: true,
         valor: previsto - comiss.vals_comp,
      },
   ];
}
