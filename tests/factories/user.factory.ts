import { CreateUserFormData } from "../../src/app/(home)/users/schemas/userFormSchema";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

/**
 * Calcula o dígito verificador (DV) do SARAM
 */
function calcularDvSaram(numeroBase: string): number {
   const pesos = [2, 3, 4, 5, 6, 7];
   let soma = 0;
   const digitos = numeroBase.split("").reverse();
   for (let i = 0; i < digitos.length; i++) {
      const peso = pesos[i % pesos.length];
      soma += parseInt(digitos[i], 10) * peso;
   }
   const resto = soma % 11;
   let dv = 11 - resto;
   if (dv === 10 || dv === 11) dv = 0;
   return dv;
}

/**
 * Gera um SARAM válido
 */
export function generateValidSaram(
   seed: number = Date.now() % 1000000
): string {
   const numeroBase = String(seed).padStart(6, "0").slice(-6);
   const dv = calcularDvSaram(numeroBase);
   return `${numeroBase}${dv}`;
}

/**
 * Gera um CPF válido (simplificado para teste)
 */
export function generateValidCpf(): string {
   return cpfValidator.generate();
}

/**
 * Factory para criar dados de usuário
 */
export const UserFactory = {
   build(overrides: Partial<CreateUserFormData> = {}): CreateUserFormData {
      const id = Math.floor(Math.random() * 10000);

      return {
         p_g: "2t",
         esp: "INF",
         nome_guerra: `USER${id}`,
         nome_completo: `USUARIO TESTE ${id}`,
         unidade: "bagl",
         saram: generateValidSaram(id),
         id_fab: String(100000 + id).slice(-6),
         cpf: generateValidCpf(),
         email_fab: `user${id}@fab.mil.br`,
         email_pess: `user${id}@gmail.com`,
         nasc: "1990-01-01",
         ult_promo: "2023-12-01",
         ant_rel: 50,
         active: true,
         ...overrides,
      };
   },

   buildInvalid(
      type: "saram" | "cpf" | "email_fab"
   ): Partial<CreateUserFormData> {
      switch (type) {
         case "saram":
            return this.build({ saram: "1234560" }); // DV provavelmente errado
         case "cpf":
            return this.build({ cpf: "12345678901" }); // CPF inválido
         case "email_fab":
            return this.build({ email_fab: "teste@gmail.com" }); // Não termina em fab.mil.br
         default:
            return this.build();
      }
   },
};
