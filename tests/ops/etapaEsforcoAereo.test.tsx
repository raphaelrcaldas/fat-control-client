// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
   cleanup,
   fireEvent,
   render,
   screen,
   waitFor,
} from "@testing-library/react";
import { EtapaModal } from "@/app/(home)/ops/om/components/OrdemDetail/EtapaModal";
import { createNextEtapa } from "@/app/(home)/ops/om/components/OrdemDetail/utils/ordemUtils";
import { toOrdemPayload } from "@/app/(home)/ops/om/components/OrdemDetail/utils/ordemFormUtils";
import type { EtapaOut, OrdemMissaoOut } from "services/routes/om/ordens";

vi.mock(
   "@/app/(home)/ops/om/components/OrdemDetail/hooks/useRouteSuggestionAutofill",
   () => ({
      useRouteSuggestionAutofill: () => ({
         routeSuggestion: null,
         isLoadingRoute: false,
         suggestionType: "none",
         markUserChangedRoute: vi.fn(),
      }),
   })
);

afterEach(cleanup);

const etapa: EtapaOut = {
   id: 1,
   ordem_id: 1,
   dt_dep: "2026-10-02T10:00:00",
   dt_arr: "2026-10-02T11:00:00",
   origem: "SBGL",
   dest: "SBBR",
   alternativa: "SBGO",
   tvoo_etp: 60,
   tvoo_alt: 30,
   qtd_comb: 15,
   esf_aer: " \tPEO / SPMAS / FAB - TAL  \u00a0",
};

function mount() {
   const onSave = vi.fn();
   render(
      <EtapaModal
         isOpen
         onClose={vi.fn()}
         onSave={onSave}
         etapa={etapa}
         etapaIndex={0}
      />
   );
   return onSave;
}

describe("esforço aéreo da etapa", () => {
   it("abre a edição sem espaços nas extremidades e preserva os internos simples", async () => {
      mount();
      const input = await screen.findByLabelText<HTMLInputElement>(/Descrição/);
      await waitFor(() => expect(input.value).toBe("PEO / SPMAS / FAB - TAL"));
      expect(etapa.esf_aer).toBe(" \tPEO / SPMAS / FAB - TAL  \u00a0");
   });

   it("permite digitar espaços e reduz sequências internas a um espaço no blur", async () => {
      mount();
      const input = await screen.findByLabelText<HTMLInputElement>(/Descrição/);
      fireEvent.change(input, { target: { value: "  PEO\t \u00a0APOIO " } });
      expect(input.value).toBe("  PEO\t \u00a0APOIO ");
      fireEvent.blur(input);
      expect(input.value).toBe("PEO APOIO");
   });

   it("entrega a etapa limpa ao salvar mesmo sem blur", async () => {
      const onSave = mount();
      const input = await screen.findByLabelText<HTMLInputElement>(/Descrição/);
      fireEvent.change(input, { target: { value: "  PEO  APOIO \u00a0" } });
      fireEvent.click(
         screen.getByRole("button", { name: "Salvar Alterações" })
      );
      expect(onSave).toHaveBeenCalledWith(
         expect.objectContaining({ esf_aer: "PEO APOIO" })
      );
   });

   it.each(["  \u00a0", "\u0085", "\ufeff", "\u001c"])(
      "impede salvar uma descrição composta apenas por whitespace: %j",
      async (value) => {
         const onSave = mount();
         const input =
            await screen.findByLabelText<HTMLInputElement>(/Descrição/);
         fireEvent.change(input, { target: { value } });
         const save = screen.getByRole<HTMLButtonElement>("button", {
            name: "Salvar Alterações",
         });
         expect(save.disabled).toBe(true);
         fireEvent.click(save);
         expect(onSave).not.toHaveBeenCalled();
      }
   );

   it("não propaga os espaços ao pré-preencher a próxima etapa", () => {
      expect(createNextEtapa(etapa).esf_aer).toBe("PEO / SPMAS / FAB - TAL");
   });

   it.each([false, true])(
      "envia etapas limpas na OM (nova/clonada: %s)",
      (generatesNew) => {
         const ordem = {
            etapas: [etapa],
            status: "rascunho",
            esf_aer: 60,
         } as OrdemMissaoOut;
         const payload = toOrdemPayload(ordem, {}, [], {
            isApproved: false,
            generatesNew,
         });
         expect(payload.etapas?.[0].esf_aer).toBe("PEO / SPMAS / FAB - TAL");
         expect(etapa.esf_aer).toBe(" \tPEO / SPMAS / FAB - TAL  \u00a0");
      }
   );
});
