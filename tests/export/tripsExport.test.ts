import { describe, expect, it } from "vitest";
import { tripsExportColumns } from "@/app/(home)/ops/trip/exportColumns";
import type { CrewMember } from "services/routes/trips";
import type { UserPublic } from "services/routes/users";

const COLUMNS = tripsExportColumns((cod) => `nome de ${cod}`);

const col = (key: string) => {
   const c = COLUMNS.find((c) => c.key === key);
   if (!c) throw new Error(`coluna ${key} ausente`);
   return c;
};

const user = {
   id: 10,
   p_g: "1s",
   quadro: "qss",
   esp: "sad",
   id_fab: "500000",
   nome_guerra: "fulano",
   saram: "4000000",
   nome_completo: "fulano da silva",
   unidade: "11gt",
   active: true,
   ult_promo: "2024-12-31",
   ant_rel: null,
   telefone: "21900000000",
   promocoes: [],
} as unknown as UserPublic;

const base: CrewMember = {
   id: 1,
   trig: "ful",
   user,
   active: true,
   func: "mc",
   oper: "op",
   proj: "kc-390",
   data_op: null,
};

describe("tripsExportColumns", () => {
   it("oferece a identidade pública do UserPublic e nenhuma PII", () => {
      const keys = COLUMNS.map((c) => c.key);

      expect(keys.slice(0, 5)).toEqual([
         "p_g",
         "quadro",
         "esp",
         "nome_guerra",
         "nome_completo",
      ]);
      for (const publico of ["saram", "id_fab", "unidade", "ult_promo"]) {
         expect(keys).toContain(publico);
      }
      for (const pii of ["telefone", "nasc", "cpf", "email_fab"]) {
         expect(keys).not.toContain(pii);
      }
      expect(COLUMNS.some((c) => c.hydrated)).toBe(false);
   });

   it("mantém a ordem das colunas: identidade militar, depois o domínio do tripulante", () => {
      expect(COLUMNS.map((c) => c.key)).toEqual([
         "p_g",
         "quadro",
         "esp",
         "nome_guerra",
         "nome_completo",
         "saram",
         "id_fab",
         "unidade",
         "ult_promo",
         "trig",
         "func",
         "func_nome",
         "oper",
         "proj",
         "data_op",
      ]);
   });

   it("agrupa as colunas próprias do tripulante em Tripulante", () => {
      for (const key of [
         "trig",
         "func",
         "func_nome",
         "oper",
         "proj",
         "data_op",
      ]) {
         expect(col(key).group).toBe("Tripulante");
      }
   });

   it("trigrama e projeto saem em maiúsculas", () => {
      expect(col("trig").uppercase).toBe(true);
      expect(col("proj").uppercase).toBe(true);
   });

   it("lê a identidade do usuário aninhado", () => {
      expect(col("id_fab").get(base)).toBe("500000");
      expect(col("ult_promo").get(base)).toBe("31/12/24");
   });

   it("traduz função e operacionalidade para o rótulo da tela", () => {
      expect(col("func").get(base)).toBe("mc");
      expect(col("func_nome").get(base)).toBe("nome de mc");
      expect(col("oper").get(base)).toBe("Operacional");
   });

   it("data de OP em DD/MM/AA; sem data, célula vazia", () => {
      expect(col("data_op").get(base)).toBeNull();
      expect(col("data_op").get({ ...base, data_op: "2023-08-22" })).toBe(
         "22/08/23"
      );
   });
});
