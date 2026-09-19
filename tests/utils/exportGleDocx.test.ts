import { describe, expect, it } from "vitest";

import { montarCamposGle } from "@/app/(home)/cegep/gle/missoes/utils/exportGleDocx";
import type { MissaoGle } from "services/routes/cegep/gleMissoes";

function trecho(
   cidade: string,
   uf: string,
   grupo: number,
   chegada: string,
   afastamento: string
) {
   return {
      loc_esp_id: 1,
      cidade,
      uf,
      grupo,
      chegada,
      afastamento,
      dias: [],
   };
}

function missao(trechos: ReturnType<typeof trecho>[]): MissaoGle {
   return {
      id: 1,
      descricao: "OS 168-BAGL-26042026",
      obs: null,
      created_at: "2026-04-30T10:00:00",
      multiplicador: "0.21397849",
      percentual: "20%",
      trechos,
      militares: [],
   } as unknown as MissaoGle;
}

describe("montarCamposGle", () => {
   it("enumera com vírgula e reserva o 'e' para o último trecho", () => {
      // Com 3+ trechos o encadeamento de "e" produzia uma frase ilegível
      // ("A e B e C") num documento que o pagador confere linha a linha.
      const campos = montarCamposGle(
         missao([
            trecho(
               "BOA VISTA",
               "RR",
               1,
               "2026-04-26T14:15",
               "2026-04-29T02:35"
            ),
            trecho(
               "TABATINGA",
               "AM",
               1,
               "2026-05-02T08:00",
               "2026-05-08T18:00"
            ),
            trecho(
               "BOA VISTA",
               "RR",
               2,
               "2026-05-10T09:00",
               "2026-05-15T17:00"
            ),
         ])
      );

      expect(campos.frase).toBe(
         "20% de 26 a 29ABR26, 20% de 02 a 08MAI26 e 10% de 10 a 15MAI26"
      );
   });

   it("mantém 'A e B' com dois trechos e o texto puro com um só", () => {
      const dois = montarCamposGle(
         missao([
            trecho(
               "BOA VISTA",
               "RR",
               1,
               "2026-04-26T14:15",
               "2026-04-29T02:35"
            ),
            trecho("PALMAS", "TO", 2, "2026-06-20T08:00", "2026-06-22T18:00"),
         ])
      );
      expect(dois.frase).toBe("20% de 26 a 29ABR26 e 10% de 20 a 22JUN26");

      const um = montarCamposGle(
         missao([
            trecho(
               "BOA VISTA",
               "RR",
               1,
               "2026-04-26T14:15",
               "2026-04-29T02:35"
            ),
         ])
      );
      expect(um.frase).toBe("20% de 26 a 29ABR26");
   });

   it("escreve a cidade com UF, um item por trecho", () => {
      // O modelo diz "respectivamente": `frase` e `pnt` se correspondem
      // posição a posição, então a cidade repetida é intencional.
      const campos = montarCamposGle(
         missao([
            trecho(
               "BOA VISTA",
               "RR",
               1,
               "2026-04-26T14:15",
               "2026-04-29T02:35"
            ),
            trecho(
               "TABATINGA",
               "AM",
               1,
               "2026-05-02T08:00",
               "2026-05-08T18:00"
            ),
            trecho(
               "BOA VISTA",
               "RR",
               2,
               "2026-05-10T09:00",
               "2026-05-15T17:00"
            ),
         ])
      );

      expect(campos.pnt).toBe("BOA VISTA-RR, TABATINGA-AM, BOA VISTA-RR");
      // O "respectivamente" do modelo só se sustenta com as duas listas do
      // mesmo tamanho. `frase` separa o último item com " e ", não com ", ".
      const itensDaFrase = campos.frase.split(/, | e /);
      expect(itensDaFrase).toHaveLength(campos.pnt.split(", ").length);
   });

   it("compacta o período conforme mês e ano coincidam", () => {
      const casos: [string, string, string][] = [
         ["2026-04-26T14:15", "2026-04-29T02:35", "20% de 26 a 29ABR26"],
         ["2026-04-26T00:00", "2026-05-29T00:00", "20% de 26ABR26 a 29MAI26"],
         ["2026-04-26T08:00", "2026-04-26T20:00", "20% de 26ABR26"],
         ["2026-12-30T08:00", "2027-01-02T20:00", "20% de 30DEZ26 a 02JAN27"],
         // Mesmo dia e mês, anos diferentes: não pode compactar.
         ["2026-04-26T08:00", "2027-04-26T20:00", "20% de 26ABR26 a 26ABR27"],
      ];

      for (const [chegada, afastamento, esperado] of casos) {
         const campos = montarCamposGle(
            missao([trecho("BOA VISTA", "RR", 1, chegada, afastamento)])
         );
         expect(campos.frase).toBe(esperado);
      }
   });

   it("recusa data inválida em vez de emitir período vazio", () => {
      // Sem isto o documento saía com "20% de " no meio da frase, baixado
      // normalmente e sem aviso nenhum.
      expect(() =>
         montarCamposGle(
            missao([trecho("BOA VISTA", "RR", 1, "", "2026-04-29T02:35")])
         )
      ).toThrow(/data inválida/);
   });
});
