import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";
import { sanitizeText } from "utils/textFormat";
import { validarSaram } from "utils/validators";

/**
 * Espelha `UserSchema` (api/fcontrol_api/schemas/users.py): só p_g,
 * nome_guerra e saram são obrigatórios — as colunas NOT NULL do model.
 * Todos os demais aceitam vazio e viajam como null no payload.
 */
export const createUserFormSchema = z.object({
   p_g: z.string().nonempty("Obrigatório").length(2),
   nome_guerra: z.string().nonempty("Obrigatório").transform(sanitizeText),
   saram: z
      .string()
      .nonempty("Obrigatório")
      .refine(
         (v) => v.replace(/\D/g, "").length === 7,
         "SARAM deve ter 7 dígitos"
      )
      .refine(validarSaram, "SARAM inválido"),
   quadro: z.string().transform((v) => v.trim().toUpperCase()),
   esp: z.string().transform((v) => v.trim().toUpperCase()),
   nome_completo: z.string().transform(sanitizeText),
   id_fab: z.union([
      z.literal(""),
      z
         .string()
         .length(6, "ID FAB deve ter 6 dígitos")
         .regex(/^\d+$/, "ID FAB deve conter apenas dígitos"),
   ]),
   cpf: z.union([
      z.literal(""),
      z
         .string()
         .refine((userCPF) => cpf.isValid(userCPF), "Digite um CPF válido"),
   ]),
   email_fab: z.union([z.literal(""), z.email().endsWith("@fab.mil.br")]),
   email_pess: z.union([z.literal(""), z.email()]),
   telefone: z.union([
      z.literal(""),
      z.string().refine((v) => {
         const d = v.replace(/\D/g, "");
         return d.length === 10 || d.length === 11;
      }, "Telefone deve ter 10 ou 11 dígitos"),
   ]),
   nasc: z.nullable(z.string()),
   data_praca: z.nullable(z.string()),
   ult_promo: z.nullable(z.string()),
   // Input numérico em branco chega como "" — sem o preprocess o coerce o
   // transformaria em 0 e o campo (opcional) reprovaria no gt(0).
   ant_rel: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.nullable(
         z.coerce
            .number("Deve ser um número")
            .int("Deve ser um número inteiro")
            .gt(0, "Deve ser maior que zero")
      )
   ),
   active: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export const defaultUserValues: CreateUserFormData = {
   p_g: "",
   quadro: "",
   ult_promo: null,
   ant_rel: null,
   nasc: null,
   data_praca: null,
   esp: "",
   nome_completo: "",
   nome_guerra: "",
   saram: "",
   id_fab: "",
   cpf: "",
   email_fab: "",
   email_pess: "",
   telefone: "",
   active: true,
};
