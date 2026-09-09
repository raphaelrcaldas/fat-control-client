// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
   CemalCard,
   UltVooCard,
} from "@/app/(home)/ops/indisp/components/trip/TripStatusCards";

afterEach(() => {
   cleanup();
   vi.useRealTimers();
});

function fixarHoje() {
   vi.useFakeTimers();
   vi.setSystemTime(new Date("2026-09-08T12:00:00"));
}

describe("cartões de status operacional", () => {
   it("não antecipa a expiração de CEMAL que começa no futuro", () => {
      fixarHoje();
      render(
         <CemalCard
            cemal="2026-09-09"
            restricoesDerivadas={[
               {
                  origem: "cemal",
                  codigo: "cemal_vencido",
                  inicio: "2026-09-09",
                  fim: null,
                  efeito: "bloqueio",
               },
            ]}
         />
      );

      expect(screen.getByText("Válido")).not.toBeNull();
      expect(screen.queryByText("Expirado")).toBeNull();
   });

   it("mantém os textos de dias e ignora desadaptação futura", () => {
      fixarHoje();
      render(
         <UltVooCard
            dataUltVoo="2026-08-30"
            elegivelDesadaptacao
            restricoesDerivadas={[
               {
                  origem: "recencia_voo",
                  codigo: "desadaptacao",
                  inicio: "2026-09-10",
                  fim: null,
                  efeito: "aviso",
               },
            ]}
         />
      );

      expect(screen.getByText("9 dias atrás")).not.toBeNull();
      expect(screen.queryByText(/Desadaptado/)).toBeNull();
   });

   it("apresenta desadaptação vigente como aviso e preserva não elegível", () => {
      fixarHoje();
      const { rerender } = render(
         <UltVooCard
            dataUltVoo="2026-07-01"
            elegivelDesadaptacao
            restricoesDerivadas={[
               {
                  origem: "recencia_voo",
                  codigo: "desadaptacao",
                  inicio: "2026-08-15",
                  fim: null,
                  efeito: "aviso",
               },
            ]}
         />
      );

      expect(screen.getByText("Desadaptado (69d)")).not.toBeNull();

      rerender(
         <UltVooCard
            dataUltVoo={null}
            elegivelDesadaptacao={false}
            restricoesDerivadas={[]}
         />
      );
      expect(screen.getByText("Não elegível")).not.toBeNull();
   });
});
