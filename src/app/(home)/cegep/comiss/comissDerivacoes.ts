import { ComissList } from "services/routes/cegep/comiss";
import { DIARIA_MINIMA } from "./components/detail/metricas";

export interface ComissDiasNumericos {
   previsto: number;
   computado: number;
   restante: number;
}

export interface ComissDias {
   previsto: string;
   computado: string;
   restante: string;
   restanteNegativo: boolean;
}

/**
 * Dias previstos, computados e restantes — em número.
 *
 * Comissionamento por período traz os dias fechados (`dias_cumprir`); o
 * comparativo só tem valores de ajuda de custo, e os dias saem de uma divisão
 * pela diária mínima.
 *
 * É a fonte única da regra: a tabela, a lista do mobile e o **comparador de
 * ordenação** derivam daqui. Com a conta copiada no comparador, o primeiro
 * ajuste de arredondamento faria a lista ordenar por um número diferente do
 * que ela mostra na tela — sem erro visível em lugar nenhum.
 */
export function comissDiasNumericos(comiss: ComissList): ComissDiasNumericos {
   if (comiss.dias_cumprir) {
      return {
         previsto: comiss.dias_cumprir,
         computado: comiss.dias_comp,
         restante: comiss.dias_cumprir - comiss.dias_comp,
      };
   }

   const previsto = (comiss.valor_aj_ab + comiss.valor_aj_fc) / DIARIA_MINIMA;
   const computado = comiss.vals_comp / DIARIA_MINIMA;
   return { previsto, computado, restante: previsto - computado };
}

/**
 * Os mesmos dias, formatados para exibição. O comparativo ganha o `~` porque
 * ali o número é estimado a partir do valor, não contado.
 */
export function deriveComissDias(comiss: ComissList): ComissDias {
   const { previsto, computado, restante } = comissDiasNumericos(comiss);
   const exato = !!comiss.dias_cumprir;
   const fmt = (v: number) => (exato ? String(v) : `~ ${v.toFixed(0)}`);

   return {
      previsto: fmt(previsto),
      computado: fmt(computado),
      restante: fmt(restante),
      restanteNegativo: restante < 0,
   };
}

/** Cor da barra de progresso: cinza quando fechado, senão o estado do módulo. */
export function progressColor(comiss: ComissList): string {
   if (comiss.status === "fechado") return "gray";
   return comiss.modulo ? "green" : "red";
}

/**
 * Classe da espinha (borda esquerda) da linha, na mesma regra do
 * `progressColor`: **fechado sobrepõe o módulo**.
 *
 * Num comissionamento fechado não há mais o que cumprir, então a ausência de
 * módulo deixa de ser acionável — pintar a espinha de vermelho ali mandaria o
 * olho para uma linha sobre a qual não há nada a fazer. Aberto é que carrega o
 * sinal: verde com módulo, vermelho sem.
 */
export function spineColor(comiss: ComissList): string {
   if (comiss.status === "fechado") return "border-l-slate-300";
   return comiss.modulo ? "border-l-emerald-500" : "border-l-red-500";
}
