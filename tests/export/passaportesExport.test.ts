import { describe, expect, it } from "vitest";
import { PASSAPORTES_EXPORT_COLUMNS } from "@/app/(home)/inteligencia/passaportes/exportColumns";
import type { TripPassaporteOut } from "services/routes/inteligencia/passaportes";

const col = (key: string) => {
   const c = PASSAPORTES_EXPORT_COLUMNS.find((c) => c.key === key);
   if (!c) throw new Error(`coluna ${key} ausente`);
   return c;
};

const base: TripPassaporteOut = {
   trip_id: 1,
   user_id: 10,
   p_g: "1s",
   quadro: "qss",
   esp: "sad",
   nome_guerra: "fulano",
   nome_completo: "fulano da silva",
   nasc: "1990-03-03",
   saram: "4000000",
   telefone: "21900000000",
   passaporte: null,
};

describe("PASSAPORTES_EXPORT_COLUMNS", () => {
   it("oferece só identidade pública e nada que precise de hidratação", () => {
      const keys = PASSAPORTES_EXPORT_COLUMNS.map((c) => c.key);

      expect(keys.slice(0, 6)).toEqual([
         "p_g",
         "quadro",
         "esp",
         "nome_guerra",
         "nome_completo",
         "saram",
      ]);
      for (const pii of ["telefone", "nasc", "cpf", "email_fab"]) {
         expect(keys).not.toContain(pii);
      }
      expect(PASSAPORTES_EXPORT_COLUMNS.some((c) => c.hydrated)).toBe(false);
   });

   it("militar sem registro de passaporte sai com as células vazias", () => {
      expect(col("status_passaporte").get(base)).toBeNull();
      expect(col("validade_passaporte").get(base)).toBeNull();
      expect(col("farol_visa").get(base)).toBeNull();
   });

   it("traduz situação e farol para o rótulo da tela", () => {
      const row: TripPassaporteOut = {
         ...base,
         passaporte: {
            id: 5,
            user_id: 10,
            passaporte: "FA000001",
            data_expedicao_passaporte: "2020-01-10",
            validade_passaporte: "2000-01-10",
            visa: null,
            data_expedicao_visa: null,
            validade_visa: null,
            status_passaporte: "missao",
            passaporte_url: null,
            visa_url: null,
         },
      };

      expect(col("status_passaporte").get(row)).toBe("Em missão");
      expect(col("validade_passaporte").get(row)).toBe("10/01/00");
      expect(col("farol_passaporte").get(row)).toBe("Vencido");
      expect(col("farol_visa").get(row)).toBeNull();
   });
});
