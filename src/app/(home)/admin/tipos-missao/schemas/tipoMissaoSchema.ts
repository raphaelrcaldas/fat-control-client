import { z } from "zod";

/** Espelho de `TipoMissaoCreate.validar_cod` (api/.../schemas/estatistica/tipo_missao.py). */
export const TIPO_MISSAO_COD_REGEX = /^\d{2}[A-Za-z]{2}$/;

export const tipoMissaoFormSchema = z.object({
   cod: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "Informe o código")
      .regex(TIPO_MISSAO_COD_REGEX, "Use 2 dígitos e 2 letras (ex.: 01AB)"),
   // O backend aceita qualquer string; espaço em branco puro não é descrição.
   desc: z.string().trim().min(1, "Informe a descrição"),
});

export type TipoMissaoFormData = z.infer<typeof tipoMissaoFormSchema>;

export const TIPO_MISSAO_FORM_VAZIO: TipoMissaoFormData = { cod: "", desc: "" };
