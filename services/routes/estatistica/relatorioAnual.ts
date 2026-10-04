import { z } from "zod";
import request, { readApiData } from "../../Api";
import type { ApiResponse } from "@/types/api";

// Espelha schemas/estatistica/relatorio_anual.py. Tempos em minutos;
// Diurno, noturno e NVG sao regimes independentes.
export const metricasAnuaisSchema = z.object({
   tvoo: z.number().int().nonnegative(),
   diurno: z.number().int().nonnegative(),
   noturno: z.number().int().nonnegative(),
   nvg: z.number().int().nonnegative(),
   sem_regime: z.number().int().nonnegative(),
   pousos: z.number().int().nonnegative(),
   etapas: z.number().int().nonnegative(),
   ultimo_voo: z.iso.date().nullable(),
});

export const aeronaveFuncaoAnualSchema = metricasAnuaisSchema.extend({
   func: z.string(),
   modelo: z.string(),
});
export const resumoAnualSchema = z.object({
   total: metricasAnuaisSchema,
   por_aeronave_funcao: z.array(aeronaveFuncaoAnualSchema),
});
export const relatorioAnualSchema = z.object({
   ano: z.number().int(),
   tripulante: z.object({
      id: z.number().int(),
      user_id: z.number().int(),
      p_g: z.string(),
      nome_guerra: z.string(),
      nome_completo: z.string().nullable().default(null),
      trig: z.string(),
   }),
   aeronaves: resumoAnualSchema,
   simuladores: resumoAnualSchema,
});

export type MetricasAnuais = z.infer<typeof metricasAnuaisSchema>;
export type AeronaveFuncaoAnual = z.infer<typeof aeronaveFuncaoAnualSchema>;
export type ResumoAnual = z.infer<typeof resumoAnualSchema>;
export type RelatorioAnual = z.infer<typeof relatorioAnualSchema>;

export async function getRelatorioAnual(
   tripId: number,
   ano: number,
   signal?: AbortSignal
): Promise<RelatorioAnual> {
   const response = await request(
      "GET",
      `estatistica/tripulantes/${tripId}/relatorio-anual`,
      null,
      { ano },
      signal
   );
   const json = await readApiData<ApiResponse<RelatorioAnual>>(response);
   return relatorioAnualSchema.parse(json.data);
}
