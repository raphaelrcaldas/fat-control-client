// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
   act,
   cleanup,
   fireEvent,
   render,
   screen,
   waitFor,
   within,
} from "@testing-library/react";
import { SimuladorMissaoEditor } from "@/app/(home)/instrucao/simulador/missao/components/SimuladorMissaoEditor";
import { NovaMissaoSimulador } from "@/app/(home)/instrucao/simulador/missao/components/NovaMissaoSimulador";
import type {
   EtapaItem,
   MissaoComEtapasDetail,
} from "services/routes/estatistica/etapas";

const mocks = vi.hoisted(() => ({
   replace: vi.fn(),
   push: vi.fn(),
   toast: vi.fn(),
   update: vi.fn(),
   create: vi.fn(),
   updateMissao: vi.fn(),
   esfAer: [{ id: 1, descricao: "SML" }],
   tipos: [{ id: 1, cod: "SIM", desc: "Simulador" }],
}));
vi.mock("next/navigation", () => ({
   useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));
vi.mock("@/app/context/toast", () => ({
   useToast: () => ({ push: mocks.toast }),
}));
vi.mock("@/hooks/queries/useEsfAer", () => ({
   useEsfAerList: () => ({ data: mocks.esfAer, isLoading: false }),
}));
vi.mock("@/hooks/queries/useTiposMissao", () => ({
   useTiposMissao: () => ({ data: mocks.tipos, isLoading: false }),
}));
vi.mock("@/hooks/queries/useEtapas", () => ({
   useUpdateEtapa: () => ({ mutateAsync: mocks.update, isPending: false }),
   useCreateEtapa: () => ({ mutateAsync: mocks.create, isPending: false }),
   useCreateMissaoWithEtapas: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
   }),
   useDeleteEtapa: () => ({ mutateAsync: vi.fn(), isPending: false }),
   useUpdateMissao: () => ({
      mutateAsync: mocks.updateMissao,
      isPending: false,
   }),
}));
// A busca remota de pilotos não participa destes cenários de edição.
vi.mock(
   "@/app/(home)/instrucao/simulador/components/PilotSearchDropdown",
   () => ({ default: () => null })
);

function etapa(id = 1): EtapaItem {
   return {
      id,
      data: "2026-09-19",
      origem: "SBGL",
      destino: "SBGL",
      dep: "10:00:00",
      arr: "11:00:00",
      tvoo: 60,
      anv: "SIM",
      pousos: 1,
      sagem: false,
      parte1: false,
      obs: null,
      tow: null,
      pax: null,
      carga: null,
      comb: null,
      lub: null,
      nivel: null,
      oi_etapas: [
         {
            esf_aer_id: 1,
            tipo_missao_id: 1,
            esf_aer: "SML",
            tipo_missao_cod: "SIM",
            reg: "d",
            tvoo: 60,
         },
      ],
      tripulantes: [
         {
            trip_id: 1,
            trig: "ABC",
            nome_guerra: "Piloto",
            p_g: "CAP",
            func: "pil",
            func_bordo: "1P",
            ant: 1,
            ult_promo: null,
            ant_rel: null,
         },
      ],
      pqd: [],
      revo: [],
      heavy_cds: [],
   };
}
function setup(firstEtapa = etapa()) {
   let missao: MissaoComEtapasDetail = {
      id: 1,
      titulo: "Simulador",
      obs: null,
      is_simulador: true,
      etapas: [firstEtapa, etapa(2)],
   };
   const onRefetch = vi.fn(async () => missao);
   const props = () => ({
      missao,
      canCreate: true,
      canDelete: true,
      isFetching: false,
      onRefetch,
   });
   const view = render(<SimuladorMissaoEditor {...props()} />);
   mocks.update.mockImplementation(async ({ id, data }) => {
      missao = {
         ...missao,
         etapas: missao.etapas.map((item) =>
            item.id === id ? { ...item, ...data } : item
         ),
      };
      view.rerender(<SimuladorMissaoEditor {...props()} />);
      return { ok: true, data: missao.etapas.find((item) => item.id === id) };
   });
   mocks.create.mockImplementation(async (data) => {
      const created = { ...etapa(3), ...data };
      missao = { ...missao, etapas: [...missao.etapas, created] };
      view.rerender(<SimuladorMissaoEditor {...props()} />);
      return { ok: true, data: created };
   });
   return {
      onRefetch,
      refetch: () =>
         view.rerender(
            <SimuladorMissaoEditor
               {...props()}
               missao={structuredClone(missao)}
            />
         ),
   };
}
const saveButton = () =>
   screen.getByRole<HTMLButtonElement>("button", { name: "Salvar sessão" });
const sidebar = () =>
   within(
      screen.getByRole("complementary", {
         name: "Painel da missão de simulador",
      })
   );
const changeDate = (value: string) =>
   fireEvent.change(screen.getByLabelText("Data"), { target: { value } });

beforeEach(() => {
   vi.clearAllMocks();
   HTMLElement.prototype.scrollTo = vi.fn();
});
afterEach(() => {
   cleanup();
   vi.restoreAllMocks();
});

describe("edição de sessões do simulador", () => {
   it("não troca de sessão quando um refetch de salvamento antigo termina", async () => {
      const { onRefetch } = setup();
      const deferred = Promise.withResolvers<MissaoComEtapasDetail>();
      onRefetch.mockReturnValue(deferred.promise);
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(onRefetch).toHaveBeenCalledOnce());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      fireEvent.click(
         sidebar()
            .getAllByRole("button", { name: /SBGL/ })
            .find((button) => !button.hasAttribute("aria-current"))!
      );
      changeDate("2026-09-22");
      await act(async () =>
         deferred.resolve({
            id: 1,
            titulo: "Simulador",
            obs: null,
            is_simulador: true,
            etapas: [{ ...etapa(), data: "2026-09-20" }, etapa(2)],
         })
      );
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-22"
      );
      expect(sidebar().getByText("Alterada")).not.toBeNull();
      expect(saveButton().disabled).toBe(false);
   });

   it("não interpreta o tipo de missão padrão de uma sessão legada como edição", () => {
      setup({ ...etapa(), oi_etapas: [] });
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      expect(saveButton().disabled).toBe(true);
      fireEvent.click(
         screen.getByRole("button", { name: "Voltar para o simulador" })
      );
      expect(confirm).not.toHaveBeenCalled();
   });

   it("preserva campos em edição quando os dados da missão são recarregados", () => {
      const { refetch } = setup();
      changeDate("2026-09-20");
      refetch();
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-20"
      );
      expect(sidebar().getByText("Alterada")).not.toBeNull();
      expect(saveButton().disabled).toBe(false);
   });

   it("salva somente a observação quando a sessão está intacta", async () => {
      setup();
      mocks.updateMissao.mockResolvedValue({ ok: true });
      fireEvent.change(screen.getByLabelText("Observações da missão"), {
         target: { value: "Observação de teste" },
      });
      fireEvent.click(
         screen.getByRole("button", { name: "Salvar observação" })
      );
      await waitFor(() => expect(mocks.updateMissao).toHaveBeenCalledOnce());
      expect(mocks.update).not.toHaveBeenCalled();
   });

   it("substitui o rascunho pela sessão salva e permite editá-la", async () => {
      setup();
      fireEvent.click(screen.getByRole("button", { name: /^Nova sessão$/ }));
      changeDate("2026-09-20");
      for (const [label, value] of [
         ["Origem", "SBGL"],
         ["Destino", "SBBR"],
         ["DEP", "12:00"],
         ["ARR", "13:00"],
      ]) {
         fireEvent.change(screen.getByLabelText(label), { target: { value } });
      }
      fireEvent.click(saveButton());
      await waitFor(() => expect(sidebar().queryByText("Rascunho")).toBeNull());
      expect(mocks.create).toHaveBeenCalledOnce();
      expect(saveButton().disabled).toBe(true);
      changeDate("2026-09-21");
      expect(saveButton().disabled).toBe(false);
      expect(sidebar().getByText("Alterada")).not.toBeNull();
   });

   it("a nova dupla mostra rascunho e protege alterações mesmo fora dos campos de data", () => {
      render(<NovaMissaoSimulador anoRef={2026} />);
      expect(screen.getByText("Rascunho")).not.toBeNull();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      fireEvent.change(screen.getByLabelText("Regime"), {
         target: { value: "n" },
      });
      fireEvent.click(
         screen.getByRole("button", { name: "Voltar para o simulador" })
      );
      expect(confirm).toHaveBeenCalledOnce();
      expect(mocks.push).not.toHaveBeenCalled();
   });
   it("volta sem confirmar descarte quando a sessão não foi alterada", () => {
      setup();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      fireEvent.click(
         screen.getByRole("button", { name: "Voltar para o simulador" })
      );
      expect(confirm).not.toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/instrucao/simulador");
   });

   it("mantém salvar habilitado ao clicar na sessão atual e alterar somente a data", () => {
      setup();
      fireEvent.click(sidebar().getAllByRole("button", { name: /SBGL/ })[0]);
      changeDate("2026-09-20");
      expect(saveButton().disabled).toBe(false);
   });

   it("detecta e desfaz uma alteração de data, sem marcar a sessão intacta", () => {
      setup();
      expect(saveButton().disabled).toBe(true);
      expect(sidebar().queryByText("Alterada")).toBeNull();
      changeDate("2026-09-20");
      expect(saveButton().disabled).toBe(false);
      expect(sidebar().getByText("Alterada")).not.toBeNull();
      expect(sidebar().getByText(/20\/09/)).not.toBeNull();
      changeDate("2026-09-19");
      expect(saveButton().disabled).toBe(true);
      expect(sidebar().queryByText("Alterada")).toBeNull();
   });

   it("limpa o aviso após salvar e permite uma segunda edição", async () => {
      const { onRefetch } = setup();
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(onRefetch).toHaveBeenCalled());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(sidebar().queryByText("Alterada")).toBeNull();
      changeDate("2026-09-21");
      expect(saveButton().disabled).toBe(false);
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(2));
      expect(mocks.update.mock.calls[1][0].data.data).toBe("2026-09-21");
   });

   it("sinaliza edição inválida e protege a troca de sessão", () => {
      setup();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      changeDate("");
      expect(saveButton().disabled).toBe(true);
      expect(sidebar().getByText("Alterada")).not.toBeNull();
      fireEvent.click(sidebar().getAllByRole("button", { name: /SBGL/ })[1]);
      expect(confirm).toHaveBeenCalledOnce();
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe("");
   });

   it("mostra o rascunho ao criar uma sessão, mesmo incompleta", () => {
      setup();
      fireEvent.click(screen.getByRole("button", { name: /^Nova sessão$/ }));
      expect(sidebar().getByText("Rascunho")).not.toBeNull();
      changeDate("2026-09-20");
      expect(saveButton().disabled).toBe(true);
      expect(sidebar().getByText(/20\/09/)).not.toBeNull();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      fireEvent.click(sidebar().getAllByRole("button", { name: /SBGL/ })[0]);
      expect(confirm).toHaveBeenCalledOnce();
   });

   it("preserva o aviso e permite tentar novamente quando salvar falha", async () => {
      setup();
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
      expect(sidebar().getByText("Alterada")).not.toBeNull();
      expect(saveButton().disabled).toBe(false);
   });
});
