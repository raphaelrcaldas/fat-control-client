import type { AnvHorasResponse } from "services/routes/estatistica/horasAnv";

export interface HorasAnvStats {
   /** Aeronaves com qualquer registro (voo ou pouso) no ano. */
   aeronavesAtivas: number;
   /** Total de aeronaves na frota retornada. */
   totalFrota: number;
   /** Índice (0-11) do mês de maior tempo de voo, ou -1 se não houver. */
   picoIdx: number;
   /** Tempo de voo (min) do mês de pico. */
   picoTvoo: number;
   /** Matrícula da aeronave que mais voou no ano, ou null. */
   topMatricula: string | null;
   /** Tempo de voo (min) da aeronave que mais voou. */
   topTvoo: number;
}

export function getHorasAnvStats(data: AnvHorasResponse): HorasAnvStats {
   const aeronavesAtivas = data.items.filter(
      (i) => i.total_tvoo > 0 || i.total_pousos > 0
   ).length;

   let picoIdx = -1;
   let picoTvoo = 0;
   data.total_meses.forEach((mes, i) => {
      if (mes.tvoo > picoTvoo) {
         picoTvoo = mes.tvoo;
         picoIdx = i;
      }
   });

   let topMatricula: string | null = null;
   let topTvoo = 0;
   data.items.forEach((i) => {
      if (i.total_tvoo > topTvoo) {
         topTvoo = i.total_tvoo;
         topMatricula = i.matricula;
      }
   });

   return {
      aeronavesAtivas,
      totalFrota: data.items.length,
      picoIdx,
      picoTvoo,
      topMatricula,
      topTvoo,
   };
}
