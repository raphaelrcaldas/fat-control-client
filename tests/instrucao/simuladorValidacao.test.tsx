// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
   act,
   cleanup,
   fireEvent,
   render,
   renderHook,
   screen,
   waitFor,
   within,
} from "@testing-library/react";
import { SimuladorMissaoEditor } from "@/app/(home)/instrucao/simulador/missao/components/SimuladorMissaoEditor";
import { useSimuladorMissaoDraft } from "@/app/(home)/instrucao/simulador/missao/hooks/useSimuladorMissaoDraft";
import type { MissaoComEtapasDetail } from "services/routes/estatistica/etapas";
import {
   DATA_MAX,
   DATA_MIN,
} from "@/app/(home)/estatistica/etapas/missao/context/validators";
import { etapa } from "./fixtures";

const mocks = vi.hoisted(() => ({
   replace: vi.fn(),
   push: vi.fn(),
   toast: vi.fn(),
   update: vi.fn(),
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
   useUpdateMissaoWithEtapas: () => ({
      mutateAsync: mocks.update,
      isPending: false,
   }),
   useDeleteEtapa: () => ({ mutateAsync: vi.fn(), isPending: false }),
   useDeleteMissaoComEtapas: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
   }),
}));
vi.mock("@/hooks/queries/useTrips", () => ({
   useTrips: () => ({ data: { items: [] }, isLoading: false }),
}));

const missao = (): MissaoComEtapasDetail => ({
   id: 1,
   titulo: "Simulador",
   obs: null,
   is_simulador: true,
   etapas: [etapa(1), etapa(2)],
});
const mount = () =>
   render(
      <SimuladorMissaoEditor
         missao={missao()}
         canCreate
         canDelete
         isFetching={false}
      />
   );

const sidebar = () =>
   within(
      screen.getByRole("complementary", {
         name: "Painel da missão de simulador",
      })
   );
const cards = () => sidebar().getAllByRole("button", { name: /→/ });
const selectCard = (index: number) => fireEvent.click(cards()[index]);
const changeDate = (value: string) =>
   fireEvent.change(screen.getByLabelText("Data"), { target: { value } });
const saveButton = () =>
   screen.getByRole<HTMLButtonElement>("button", { name: "Salvar alterações" });
const newSession = () =>
   fireEvent.click(screen.getByRole("button", { name: /^Nova sessão$/ }));
const fillNew = (date: string) => {
   changeDate(date);
   for (const [label, value] of [
      ["Origem", "SBGL"],
      ["Destino", "SBBR"],
      ["DEP", "12:00"],
      ["ARR", "13:00"],
   ])
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
};

beforeEach(() => {
   vi.clearAllMocks();
   HTMLElement.prototype.scrollTo = vi.fn();
   HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
   cleanup();
   vi.restoreAllMocks();
});

describe("erro de gravação legível", () => {
   it("traduz o índice create[i] da mensagem de negócio para a sessão da sidebar", async () => {
      mount();
      newSession();
      fillNew("2026-09-20");
      mocks.update.mockResolvedValue({
         ok: false,
         message: "create[0]: colisão de horário com a sessão existente",
         errors: null,
      });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
      expect(mocks.toast).toHaveBeenCalledWith({
         type: "error",
         title: "Não foi possível salvar",
         message: "Sessão 3: colisão de horário com a sessão existente",
         duration: 12000,
      });
   });

   it("traduz o caminho do 422 para 'Sessão N · Campo' pela posição na lista", async () => {
      mount();
      changeDate("2026-09-20");
      selectCard(1);
      changeDate("2026-09-21");
      mocks.update.mockResolvedValue({
         ok: false,
         message: "Erro de validação",
         errors: { "body.update.1.pousos": "Field required" },
      });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.toast).toHaveBeenCalled());
      const { title, message } = mocks.toast.mock.calls[0][0];
      expect(title).toBe("Erro de validação");
      expect(message).toMatch(/^• Sessão 2 · Qtd\. Pousos: /);
      expect(message).not.toMatch(/Etapa/);
   });
});

describe("sessão sem piloto", () => {
   it("marca a sessão como Verificar e explica o bloqueio perto do botão Salvar", () => {
      mount();
      expect(screen.queryByText(/incompleta/)).toBeNull();
      fireEvent.click(
         screen.getByRole("button", { name: "Remover CAP PILOTO" })
      );
      expect(within(cards()[0]).getByText("Verificar")).not.toBeNull();
      expect(saveButton().disabled).toBe(true);
      const reason = screen.getByText("Sessão 1 incompleta: pilotos");
      expect(reason.getAttribute("title")).toBe("Sessão 1 incompleta: pilotos");
      expect(reason.className).toContain("truncate");
      expect(reason.className).toContain("text-amber-700");
   });

   it("aponta o primeiro motivo de uma sessão nova incompleta", () => {
      mount();
      newSession();
      expect(
         screen.getByText("Sessão 3 incompleta: origem e destino")
      ).not.toBeNull();
      fireEvent.change(screen.getByLabelText("Destino"), {
         target: { value: "SBBR" },
      });
      expect(screen.getByText("Sessão 3 incompleta: horários")).not.toBeNull();
   });
});

describe("sessão nova", () => {
   it("nasce com zero pousos", () => {
      mount();
      newSession();
      expect(screen.getByLabelText<HTMLInputElement>("Pousos").value).toBe("0");
   });

   it("aceita qualquer ano e salva, enquanto a persistida segue presa ao seu", async () => {
      mount();
      newSession();
      fillNew("2027-01-02");
      const data = screen.getByLabelText<HTMLInputElement>("Data");
      expect(data.min).toBe(DATA_MIN);
      expect(data.max).toBe(DATA_MAX);
      expect(screen.queryByText("Fora do ano de referência")).toBeNull();
      expect(saveButton().disabled).toBe(false);
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.create).toEqual([
         expect.objectContaining({ data: "2027-01-02", pousos: 0 }),
      ]);
      selectCard(0);
      expect(screen.getByLabelText<HTMLInputElement>("Data").min).toBe(
         "2026-01-01"
      );
   });
});

describe("data absurda em sessão nova", () => {
   it.each(["0202-09-20", "1999-12-31"])(
      "bloqueia %s e aponta o motivo",
      (date) => {
         mount();
         newSession();
         fillNew("2026-09-20");
         expect(saveButton().disabled).toBe(false);
         fireEvent.change(screen.getByLabelText("Data"), {
            target: { value: date },
         });
         expect(saveButton().disabled).toBe(true);
         expect(
            screen.getByText("Sessão 3 incompleta: ano da data")
         ).not.toBeNull();
         expect(within(cards()[2]).getByText("Verificar")).not.toBeNull();
         fireEvent.click(saveButton());
         expect(mocks.update).not.toHaveBeenCalled();
      }
   );

   it("aceita os limites da janela", () => {
      mount();
      newSession();
      fillNew(DATA_MIN);
      expect(saveButton().disabled).toBe(false);
      changeDate(DATA_MAX);
      expect(saveButton().disabled).toBe(false);
   });

   it("bloqueia ano acima do teto da janela", () => {
      mount();
      newSession();
      fillNew("2026-09-20");
      changeDate(`${Number(DATA_MAX.slice(0, 4)) + 1}-01-01`);
      expect(saveButton().disabled).toBe(true);
   });
});

describe("data com ano de 5 dígitos", () => {
   it("bloqueia em sessão nova (passaria nas comparações de texto)", () => {
      mount();
      newSession();
      fillNew("2026-09-20");
      expect(saveButton().disabled).toBe(false);
      changeDate("20260-01-01");
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "20260-01-01"
      );
      expect(saveButton().disabled).toBe(true);
      expect(screen.getByText("Sessão 3 incompleta: data")).not.toBeNull();
      fireEvent.click(saveButton());
      expect(mocks.update).not.toHaveBeenCalled();
   });

   it("bloqueia em sessão persistida (o prefixo de 4 dígitos ainda é o ano original)", () => {
      mount();
      selectCard(0);
      expect(saveButton().disabled).toBe(true);
      changeDate("2026-09-21");
      expect(saveButton().disabled).toBe(false);
      changeDate("20260-09-21");
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "20260-09-21"
      );
      expect(saveButton().disabled).toBe(true);
      expect(screen.getByText("Sessão 1 incompleta: data")).not.toBeNull();
      fireEvent.click(saveButton());
      expect(mocks.update).not.toHaveBeenCalled();
   });
});

describe("ordem de instrução e observação", () => {
   it("cria a OI da sessão legada sem perder edições de outras sessões", async () => {
      render(
         <SimuladorMissaoEditor
            missao={{
               ...missao(),
               etapas: [{ ...etapa(1), oi_etapas: [] }, etapa(2)],
            }}
            canCreate
            canDelete
            isFetching={false}
         />
      );
      selectCard(1);
      changeDate("2026-09-22");
      selectCard(0);
      fireEvent.change(screen.getByLabelText("Regime"), {
         target: { value: "n" },
      });
      expect(sidebar().getAllByText("Modificado")).toHaveLength(2);
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      const { update } = mocks.update.mock.calls[0][0].data;
      expect(update).toEqual([
         expect.objectContaining({
            id: 1,
            oi_etapas: [
               { esf_aer_id: 1, tipo_missao_id: 1, reg: "n", tvoo: 60 },
            ],
         }),
         expect.objectContaining({ id: 2, data: "2026-09-22" }),
      ]);
   });

   it("observação digitada e apagada volta a limpa e segue null no payload", async () => {
      mount();
      const obs = screen.getByLabelText("Observações da missão");
      fireEvent.change(obs, { target: { value: "x" } });
      expect(saveButton().disabled).toBe(false);
      fireEvent.change(obs, { target: { value: "" } });
      expect(saveButton().disabled).toBe(true);
      fireEvent.change(obs, { target: { value: "y" } });
      fireEvent.change(obs, { target: { value: "" } });
      changeDate("2026-09-20");
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.obs).toBeNull();
   });
});

describe("observação apagada", () => {
   it("missão que tinha observação envia null, não string vazia", async () => {
      render(
         <SimuladorMissaoEditor
            missao={{ ...missao(), obs: "antiga" }}
            canCreate
            canDelete
            isFetching={false}
         />
      );
      const obs = screen.getByLabelText("Observações da missão");
      fireEvent.change(obs, { target: { value: "" } });
      expect(saveButton().disabled).toBe(false);
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.obs).toBeNull();
   });

   it("observação só de espaços também viaja null", async () => {
      render(
         <SimuladorMissaoEditor
            missao={{ ...missao(), obs: "antiga" }}
            canCreate
            canDelete
            isFetching={false}
         />
      );
      fireEvent.change(screen.getByLabelText("Observações da missão"), {
         target: { value: "   " },
      });
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.obs).toBeNull();
   });
});

describe("edição bloqueada durante o salvamento", () => {
   it("ignora setters e remoções enquanto o PUT está em voo", async () => {
      const deferred = Promise.withResolvers<{ ok: boolean }>();
      mocks.update.mockReturnValue(deferred.promise);
      const { result } = renderHook(() => useSimuladorMissaoDraft(missao()));
      act(() => result.current.form!.setData("2026-09-20"));
      act(() => {
         void result.current.save();
      });
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());

      const before = JSON.stringify(result.current.draft);
      act(() => {
         result.current.form!.removePilot(1);
         result.current.form!.updateFuncBordo(1, "IN");
         result.current.form!.setData("2026-09-25");
         result.current.form!.setTipoMissaoId(1);
         result.current.setObs("durante o save");
         result.current.remove(result.current.draft.etapas[1].localId);
         result.current.add();
         result.current.select(result.current.draft.etapas[1].localId);
      });
      expect(JSON.stringify(result.current.draft)).toBe(before);

      await act(async () => deferred.resolve({ ok: false }));
   });
});
