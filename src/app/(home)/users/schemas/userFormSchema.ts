import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";
import { sanitizeText } from "utils/textFormat";
import { validarSaram } from "utils/validators";

export const createUserFormSchema = z.object({
   p_g: z.string().nonempty("Obrigatório").length(2),
   esp: z.string().transform(sanitizeText),
   nome_guerra: z.string().nonempty("Obrigatório").transform(sanitizeText),
   nome_completo: z.string().transform(sanitizeText),
   unidade: z.string().nonempty("Obrigatório"),
   saram: z
      .string()
      .refine(
         (v) => v.replace(/\D/g, "").length === 7,
         "SARAM deve ter 7 dígitos",
      )
      .refine(validarSaram, "SARAM inválido"),
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
      z.string().refine(
         (v) => {
            const d = v.replace(/\D/g, "");
            return d.length === 10 || d.length === 11;
         },
         "Telefone deve ter 10 ou 11 dígitos",
      ),
   ]),
   nasc: z.nullable(z.string()),
   ult_promo: z.nullable(z.string()),
   ant_rel: z.nullable(z.coerce.number().gt(0)),
   active: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export const defaultUserValues: CreateUserFormData = {
   p_g: "",
   unidade: "",
   ult_promo: null,
   ant_rel: null,
   nasc: null,
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
