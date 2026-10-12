import { describe, expect, it } from "vitest";
import { CARTOES_SAUDE_EXPORT_COLUMNS } from "@/app/(home)/aeromedica/cartoes-saude/exportColumns";
import type { UserCartaoSaude } from "services/routes/aeromedica/cartoesSaude";
import type { UserPublic } from "services/routes/users";

const col = (key: string) => {
   const c = CARTOES_SAUDE_EXPORT_COLUMNS.find((c) => c.key === key);
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

const base: UserCartaoSaude = {
   user,
   cartao: null,
   tripulante: false,
   cemal_tem_ata: null,
   total_atas: 0,
};

describe("CARTOES_SAUDE_EXPORT_COLUMNS", () => {
   it("oferece a identidade pública do UserPublic e nenhuma PII", () => {
      const keys = CARTOES_SAUDE_EXPORT_COLUMNS.map((c) => c.key);

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
      expect(CARTOES_SAUDE_EXPORT_COLUMNS.some((c) => c.hydrated)).toBe(false);
   });

   it("lê a identidade do usuário aninhado", () => {
      expect(col("id_fab").get(base)).toBe("500000");
      expect(col("ult_promo").get(base)).toBe("31/12/24");
   });

   it("militar sem cartão sai com as células vazias", () => {
      expect(col("tripulante").get(base)).toBe("Não");
      expect(col("prontuario").get(base)).toBeUndefined();
      expect(col("cemal").get(base)).toBeNull();
      expect(col("farol_cemal").get(base)).toBeNull();
      expect(col("cemal_tem_ata").get(base)).toBeNull();
   });

   it("traduz farol e ata para o rótulo da tela", () => {
      const row: UserCartaoSaude = {
         ...base,
         tripulante: true,
         cemal_tem_ata: false,
         cartao: {
            id: 1,
            user_id: 10,
            prontuario: "12345",
            cemal: "2000-01-10",
            tovn: null,
            imae: null,
         },
      };

      expect(col("tripulante").get(row)).toBe("Sim");
      expect(col("cemal").get(row)).toBe("10/01/00");
      expect(col("farol_cemal").get(row)).toBe("Vencido");
      expect(col("cemal_tem_ata").get(row)).toBe("Sem ata");
      expect(col("farol_tovn").get(row)).toBeNull();
   });
});
