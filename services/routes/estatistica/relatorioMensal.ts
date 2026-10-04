import { z } from "zod";
import request, { readApiData } from "../../Api";
import type { ApiResponse } from "@/types/api";
import {
   aeronaveFuncaoAnualSchema,
   metricasAnuaisSchema,
   relatorioAnualSchema,
} from "./relatorioAnual";

export const funcaoEtapaMensalSchema = z.object({
   func: z.string(),
   nome: z.string(),
   func_bordo: z.string(),
});

// Uma linha por etapa. Tempos em minutos; diurno, noturno e NVG independentes.
export const etapaMensalSchema = z.object({
   id: z.number().int(),
   data: z.iso.date(),
   missao_id: z.number().int(),
   missao: z.string().nullable().default(null),
   anv: z.string(),
   modelo: z.string(),
   origem: z.string(),
   destino: z.string(),
   dep: z.iso.time(),
   arr: z.iso.time(),
   tvoo: z.number().int().nonnegative(),
   diurno: z.number().int().nonnegative(),
   noturno: z.number().int().nonnegative(),
   nvg: z.number().int().nonnegative(),
   sem_regime: z.number().int().nonnegative(),
   pousos: z.number().int().nonnegative(),
   funcoes: z.array(funcaoEtapaMensalSchema),
});

export const resumoMensalSchema = z.object({
   total: metricasAnuaisSchema,
   acumulado_ano: metricasAnuaisSchema,
   acumulado_geral: metricasAnuaisSchema,
   por_aeronave_funcao: z.array(aeronaveFuncaoAnualSchema),
   etapas: z.array(etapaMensalSchema),
});

export const relatorioMensalSchema = z.object({
   ano: z.number().int(),
   mes: z.number().int().min(1).max(12),
   tripulante: relatorioAnualSchema.shape.tripulante,
   aeronaves: resumoMensalSchema,
   simuladores: resumoMensalSchema,
});

export type FuncaoEtapaMensal = z.infer<typeof funcaoEtapaMensalSchema>;
export type EtapaMensal = z.infer<typeof etapaMensalSchema>;
export type ResumoMensal = z.infer<typeof resumoMensalSchema>;
export type RelatorioMensal = z.infer<typeof relatorioMensalSchema>;

export async function getRelatorioMensal(
   tripId: number,
   ano: number,
   mes: number,
   signal?: AbortSignal
): Promise<RelatorioMensal> {
   const response = await request(
      "GET",
      `estatistica/tripulantes/${tripId}/relatorio-mensal`,
      null,
      { ano, mes },
      signal
   );
   const json = await readApiData<ApiResponse<RelatorioMensal>>(response);
   return relatorioMensalSchema.parse(json.data);
}
