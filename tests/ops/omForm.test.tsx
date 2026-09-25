// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";

import { useOrdemForm } from "@/app/(home)/ops/om/components/OrdemDetail/hooks/useOrdemForm";
import type {
   EtapaOut,
   Etiqueta,
   OrdemMissaoOut,
} from "services/routes/om/ordens";

const mocks = vi.hoisted(() => ({
   createOrdem: vi.fn(),
   updateOrdem: vi.fn(),
   principais: [] as { cod: string }[],
}));

vi.mock("@/hooks/queries", () => ({
   useCreateOrdem: () => ({ mutateAsync: mocks.createOrdem }),
   useUpdateOrdem: () => ({ mutateAsync: mocks.updateOrdem }),
   useFuncoes: () => ({ principais: mocks.principais }),
}));

afterEach(() => {
   cleanup();
   vi.clearAllMocks();
   mocks.principais = [];
});

describe("useOrdemForm — catálogo de funções vazio ou parcial", () => {
   // Regressão: até o commit que corrigiu getValidationErrors, o catálogo
   // vazio (useFuncoes().principais === [] no primeiro render, antes da
   // query assíncrona resolver) fazia buildInitialState gerar
   // `tripulacao = {}`, e o acesso a `tripulacao.pil.length` explodia com
   // TypeError logo no primeiro render — a página caía no error.tsx.
   it("não lança com o catálogo de funções vazio (F5 em /ops/om/nova antes da query resolver)", () => {
      mocks.principais = [];

      expect(() =>
         renderHook(() =>
            useOrdemForm({ ordem: null, isNew: true, onSave: vi.fn() })
         )
      ).not.toThrow();
   });

   // Regressão: unidade que não opera loadmaster não deve ter a OM bloqueada
   // por "Pelo menos 1 Loadmaster é obrigatório" — a chave "lm" nem existe em
   // `tripulacao` (ver OrdemTripulacao.tsx: a regra é a chave ausente já
   // remover a exigência da função).
   it("não exige loadmaster quando o catálogo da unidade não opera a função", () => {
      mocks.principais = [{ cod: "pil" }, { cod: "mc" }];

      const { result } = renderHook(() =>
         useOrdemForm({ ordem: null, isNew: true, onSave: vi.fn() })
      );

      expect(result.current.validationErrors.loadmaster).toBe(false);
      // As funções operadas continuam exigidas (sem tripulante selecionado)
      expect(result.current.validationErrors.piloto).toBe(true);
      expect(result.current.validationErrors.mecanico).toBe(true);
   });
});

const etiquetaA: Etiqueta = {
   id: 1,
   nome: "A",
   cor: "#111111",
   descricao: null,
};
const etiquetaB: Etiqueta = {
   id: 2,
   nome: "B",
   cor: "#222222",
   descricao: null,
};

const makeEtapa = (
   id: number,
   origem: string,
   dest: string,
   dtDep: string,
   dtArr: string
): EtapaOut => ({
   id,
   ordem_id: 10,
   dt_dep: dtDep,
   origem,
   dest,
   dt_arr: dtArr,
   alternativa: "SBSP",
   tvoo_alt: 30,
   qtd_comb: 10,
   esf_aer: "",
   tvoo_etp: 60,
});

// OM mínima válida em rascunho: o form nasce editável (isReadOnlyMode só
// liga para status != "rascunho").
const makeOrdem = (
   overrides: Partial<OrdemMissaoOut> = {}
): OrdemMissaoOut => ({
   id: 10,
   numero: "001/2026",
   matricula_anv: "2850",
   tipo: "Transporte",
   projeto: "",
   status: "rascunho",
   campos_especiais: [],
   doc_ref: null,
   data_saida: null,
   esf_aer: 120,
   created_by: 1,
   created_at: "2026-09-01T00:00:00",
   updated_at: null,
   deleted_at: null,
   etapas: [
      makeEtapa(
         1,
         "SBGL",
         "SBBR",
         "2026-09-10T10:00:00",
         "2026-09-10T11:00:00"
      ),
      makeEtapa(
         2,
         "SBBR",
         "SBSP",
         "2026-09-10T14:00:00",
         "2026-09-10T15:00:00"
      ),
   ],
   tripulacao: [],
   etiquetas: [],
   ...overrides,
});

describe("useOrdemForm — detecção de alteração e edição de etapas", () => {
   // Regressão: o LabelPicker devolve as etiquetas na ordem do catálogo, mas
   // a relação no backend não tem order_by — a mesma seleção em outra ordem
   // acusava alteração (e travava a sincronização via serverChanged).
   it("mesmas etiquetas em outra ordem não contam como alteração", () => {
      mocks.principais = [{ cod: "pil" }, { cod: "mc" }, { cod: "lm" }];
      const ordem = makeOrdem({ etiquetas: [etiquetaB, etiquetaA] });

      const { result } = renderHook(() =>
         useOrdemForm({ ordem, isNew: false, onSave: vi.fn() })
      );
      expect(result.current.hasChanges).toBe(false);

      act(() => {
         result.current.updateEtiquetas([etiquetaA, etiquetaB]);
      });

      expect(result.current.formData.etiquetas.map((e) => e.id)).toEqual([
         1, 2,
      ]);
      expect(result.current.hasChanges).toBe(false);
   });

   // Regressão: mudar o dt_dep de B para antes de A reordena as etapas; a
   // propagação usava o novo índice e reescrevia a origem de A (que ninguém
   // tocou) com o destino de B.
   it("updateEtapa que muda a posição da etapa não altera a origem da outra", () => {
      mocks.principais = [{ cod: "pil" }, { cod: "mc" }, { cod: "lm" }];
      const ordem = makeOrdem();

      const { result } = renderHook(() =>
         useOrdemForm({ ordem, isNew: false, onSave: vi.fn() })
      );

      const etapaB = {
         ...result.current.formData.etapas[1],
         dt_dep: "2026-09-10T08:00:00",
         dt_arr: "2026-09-10T09:00:00",
      };
      act(() => {
         result.current.updateEtapa(1, etapaB);
      });

      const etapas = result.current.formData.etapas;
      // B passou a ser a primeira; A continua SBGL→SBBR
      expect(etapas.map((e) => e.id)).toEqual([2, 1]);
      expect(etapas[1].origem).toBe("SBGL");
      expect(etapas[1].dest).toBe("SBBR");
   });

   it("updateEtapa sem mudança de posição propaga o destino para a origem da próxima", () => {
      mocks.principais = [{ cod: "pil" }, { cod: "mc" }, { cod: "lm" }];
      const ordem = makeOrdem();

      const { result } = renderHook(() =>
         useOrdemForm({ ordem, isNew: false, onSave: vi.fn() })
      );

      const etapaA = { ...result.current.formData.etapas[0], dest: "SBCF" };
      act(() => {
         result.current.updateEtapa(0, etapaA);
      });

      const etapas = result.current.formData.etapas;
      expect(etapas.map((e) => e.id)).toEqual([1, 2]);
      expect(etapas[1].origem).toBe("SBCF");
   });
});
