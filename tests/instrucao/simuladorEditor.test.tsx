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
import { etapa } from "./fixtures";

const mocks = vi.hoisted(() => ({
   replace: vi.fn(),
   push: vi.fn(),
   toast: vi.fn(),
   update: vi.fn(),
   create: vi.fn(),
   delete: vi.fn(),
   deleteMissao: vi.fn(),
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
   useUpdateMissaoWithEtapas: () => ({
      mutateAsync: mocks.update,
      isPending: false,
   }),
   useUpdateEtapa: () => ({ mutateAsync: mocks.update, isPending: false }),
   useCreateEtapa: () => ({ mutateAsync: mocks.create, isPending: false }),
   useCreateMissaoWithEtapas: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
   }),
   useDeleteEtapa: () => ({ mutateAsync: mocks.delete, isPending: false }),
   useDeleteMissaoComEtapas: () => ({
      mutateAsync: mocks.deleteMissao,
      isPending: false,
   }),
   useUpdateMissao: () => ({
      mutateAsync: mocks.updateMissao,
      isPending: false,
   }),
}));
vi.mock("@/hooks/queries/useTrips", () => ({
   useTrips: () => ({
      data: {
         items: [
            {
               id: 1,
               trig: "ABC",
               user: { nome_guerra: "Piloto", p_g: "CAP", posto: { ant: 2 } },
            },
            {
               id: 2,
               trig: "DEF",
               user: { nome_guerra: "Segundo", p_g: "TEN", posto: { ant: 3 } },
            },
         ],
      },
      isLoading: false,
   }),
}));

function setup(
   firstEtapa = etapa(),
   permissions = { canCreate: true, canDelete: true },
   // `false` simula o refetch que ainda não chegou: só a resposta do PUT vale.
   autoRerender = true
) {
   let missao: MissaoComEtapasDetail = {
      id: 1,
      titulo: "Simulador",
      obs: null,
      is_simulador: true,
      etapas: [firstEtapa, etapa(2)],
   };
   const props = () => ({
      missao,
      ...permissions,
      isFetching: false,
   });
   const view = render(<SimuladorMissaoEditor {...props()} />);
   mocks.update.mockImplementation(async ({ data }) => {
      const hydrate = (item: EtapaItem) => ({
         ...item,
         tripulantes: item.tripulantes.map((trip) => ({
            ...etapa().tripulantes[0],
            ...trip,
            nome_guerra: trip.trip_id === 1 ? "Piloto" : "Segundo",
            p_g: trip.trip_id === 1 ? "CAP" : "TEN",
         })),
      });
      missao = {
         ...missao,
         obs: data.obs,
         etapas: [
            ...missao.etapas.map((item) =>
               hydrate({
                  ...item,
                  ...data.update.find(
                     (update: EtapaItem) => update.id === item.id
                  ),
               })
            ),
            ...data.create.map((create: EtapaItem, index: number) =>
               hydrate({ ...etapa(3 + index), ...create, id: 3 + index })
            ),
         ],
      };
      if (autoRerender) view.rerender(<SimuladorMissaoEditor {...props()} />);
      return { ok: true, data: missao };
   });
   mocks.delete.mockImplementation(async ({ id }: { id: number }) => {
      missao = {
         ...missao,
         etapas: missao.etapas.filter((item) => item.id !== id),
      };
      view.rerender(<SimuladorMissaoEditor {...props()} />);
      return { ok: true, data: { missao_removida: false } };
   });
   const inicial = structuredClone(missao);
   return {
      inicial,
      /** Entrega ao editor uma leitura arbitrária da missão. */
      deliver: (next: MissaoComEtapasDetail) =>
         view.rerender(<SimuladorMissaoEditor {...props()} missao={next} />),
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
   screen.getByRole<HTMLButtonElement>("button", { name: "Salvar alterações" });
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
   HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
   cleanup();
   vi.restoreAllMocks();
});

const cards = () => sidebar().getAllByRole("button", { name: /→/ });
const selectCard = (index: number) => fireEvent.click(cards()[index]);
const newSession = () =>
   fireEvent.click(screen.getByRole("button", { name: /^Nova sessão$/ }));
const fillNew = (date: string, dep = "12:00", arr = "13:00") => {
   changeDate(date);
   for (const [label, value] of [
      ["Origem", "SBGL"],
      ["Destino", "SBBR"],
      ["DEP", dep],
      ["ARR", arr],
   ])
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
};
const currentCard = () =>
   cards().find((button) => button.hasAttribute("aria-current"))!;

describe("rascunhos da missão de simulador", () => {
   it("exclui a missão inteira pelo rodapé após confirmar a perda dos rascunhos", async () => {
      setup();
      changeDate("2026-09-20");
      newSession();
      mocks.deleteMissao.mockResolvedValue({ ok: true });
      fireEvent.click(
         sidebar().getByRole("button", { name: "Excluir missão" })
      );
      const dialog = within(screen.getByRole("dialog"));
      expect(
         dialog.getByText(/rascunhos ainda não salvos serão perdidos/)
      ).not.toBeNull();
      expect(mocks.deleteMissao).not.toHaveBeenCalled();
      fireEvent.click(dialog.getByRole("button", { name: "Excluir missão" }));
      await waitFor(() => expect(mocks.deleteMissao).toHaveBeenCalledWith(1));
      expect(mocks.delete).not.toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/instrucao/simulador");
   });

   it("preserva rascunhos e seleção se a exclusão da missão falhar", async () => {
      setup();
      changeDate("2026-09-20");
      newSession();
      mocks.deleteMissao.mockResolvedValue({
         ok: false,
         message: "Falha ao excluir",
      });
      fireEvent.click(
         sidebar().getByRole("button", { name: "Excluir missão" })
      );
      fireEvent.click(
         within(screen.getByRole("dialog")).getByRole("button", {
            name: "Excluir missão",
         })
      );
      await waitFor(() =>
         expect(mocks.toast).toHaveBeenCalledWith(
            expect.objectContaining({
               type: "error",
               message: "Falha ao excluir",
            })
         )
      );
      expect(cards()).toHaveLength(3);
      expect(sidebar().getByText("Modificado")).not.toBeNull();
      expect(within(currentCard()).getByText("Nova")).not.toBeNull();
      expect(mocks.push).not.toHaveBeenCalled();
   });

   it("oculta as ações de criar e excluir da sidebar sem as permissões", () => {
      setup(etapa(), { canCreate: false, canDelete: false });
      expect(
         sidebar().queryByRole("button", { name: "Nova sessão" })
      ).toBeNull();
      expect(
         sidebar().queryByRole("button", { name: "Excluir missão" })
      ).toBeNull();
      expect(cards()).toHaveLength(2);
   });

   it("conclui pendência antiga e salva outra sessão de ano diferente no mesmo lote", async () => {
      setup({ ...etapa(1), data: "2024-09-19" });
      selectCard(0);
      expect(screen.getByLabelText("Data").getAttribute("min")).toBe(
         "2024-01-01"
      );
      fireEvent.click(
         screen.getByRole("switch", { name: "Registrado no SAGEM" })
      );
      fireEvent.click(screen.getByRole("switch", { name: "Ficha recolhida" }));
      selectCard(1);
      expect(screen.getByLabelText("Data").getAttribute("min")).toBe(
         "2026-01-01"
      );
      fireEvent.change(screen.getByLabelText("Pousos"), {
         target: { value: "2" },
      });
      expect(saveButton().disabled).toBe(false);
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.update).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               id: 1,
               data: "2024-09-19",
               sagem: true,
               parte1: true,
            }),
            expect.objectContaining({ id: 2, data: "2026-09-19", pousos: 2 }),
         ])
      );
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      selectCard(0);
      expect(within(currentCard()).queryByText("Verificar")).toBeNull();
      expect(
         within(currentCard()).getByLabelText("OK, SAGEM e Ficha verificados")
      ).not.toBeNull();
   });

   it("continua impedindo mudança acidental do ano original de uma sessão antiga", () => {
      setup({ ...etapa(1), data: "2024-09-19" });
      selectCard(0);
      changeDate("2026-09-19");
      expect(screen.getByText("Fora do ano de referência")).not.toBeNull();
      expect(saveButton().disabled).toBe(true);
   });

   it("bloqueia o lote com pousos acima do limite em uma sessão fora da seleção", () => {
      setup();
      fireEvent.change(screen.getByLabelText("Pousos"), {
         target: { value: "21" },
      });
      selectCard(1);
      expect(sidebar().getByText("Verificar")).not.toBeNull();
      expect(saveButton().disabled).toBe(true);
      fireEvent.click(saveButton());
      expect(mocks.update).not.toHaveBeenCalled();
   });

   it("mantém a edição de outra sessão ao excluir uma sessão salva", async () => {
      setup();
      selectCard(1);
      changeDate("2026-09-22");
      selectCard(0);
      fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
      fireEvent.click(
         within(screen.getByRole("dialog")).getByRole("button", {
            name: "Excluir sessão",
         })
      );
      await waitFor(() =>
         expect(mocks.delete).toHaveBeenCalledWith({ id: 1, missaoId: 1 })
      );
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-22"
      );
      expect(sidebar().getByText("Modificado")).not.toBeNull();
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data).toMatchObject({
         delete_ids: [],
         update: [expect.objectContaining({ id: 2 })],
      });
   });

   const confirmarExclusao = async (botao: string) => {
      fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
      fireEvent.click(
         within(screen.getByRole("dialog")).getByRole("button", {
            name: botao,
         })
      );
   };
   const renderUmaSessao = () =>
      render(
         <SimuladorMissaoEditor
            missao={{
               id: 1,
               titulo: "Simulador",
               obs: null,
               is_simulador: true,
               etapas: [etapa()],
            }}
            canCreate
            canDelete
            isFetching={false}
         />
      );

   it("avisa e sai da missão ao excluir a última sessão salva", async () => {
      renderUmaSessao();
      mocks.delete.mockResolvedValue({
         ok: true,
         data: { missao_removida: true },
      });
      changeDate("2026-09-22");
      fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
      const dialog = within(screen.getByRole("dialog"));
      expect(dialog.getByText(/apaga a dupla inteira/)).not.toBeNull();
      expect(dialog.getByText(/rascunhos ainda não salvos/)).not.toBeNull();
      fireEvent.click(dialog.getByRole("button", { name: "Excluir a dupla" }));
      await waitFor(() =>
         expect(mocks.push).toHaveBeenCalledWith("/instrucao/simulador")
      );
      expect(mocks.delete).toHaveBeenCalledWith({ id: 1, missaoId: 1 });
   });

   it("navega quando a API diz que a missão foi removida, mesmo com contagem local defasada", async () => {
      setup();
      mocks.delete.mockResolvedValue({
         ok: true,
         data: { missao_removida: true },
      });
      await confirmarExclusao("Excluir sessão");
      await waitFor(() =>
         expect(mocks.push).toHaveBeenCalledWith("/instrucao/simulador")
      );
   });

   it("trava o editor após excluir a última sessão: Salvar não manda PUT contra a missão apagada", async () => {
      renderUmaSessao();
      mocks.delete.mockResolvedValue({
         ok: true,
         data: { missao_removida: true },
      });
      changeDate("2026-09-22");
      expect(saveButton().disabled).toBe(false);
      await confirmarExclusao("Excluir a dupla");
      await waitFor(() =>
         expect(mocks.push).toHaveBeenCalledWith("/instrucao/simulador")
      );
      // travado como ocupado: o botão vira "Salvando..." e fica desabilitado
      const salvando = screen.getByRole<HTMLButtonElement>("button", {
         name: "Salvando...",
      });
      expect(salvando.disabled).toBe(true);
      expect(
         screen.getByRole<HTMLButtonElement>("button", {
            name: /^Nova sessão$/,
         }).disabled
      ).toBe(true);
      fireEvent.click(salvando);
      expect(mocks.update).not.toHaveBeenCalled();
   });

   it("não navega quando a API não removeu a missão, mesmo com uma só sessão local", async () => {
      renderUmaSessao();
      mocks.delete.mockResolvedValue({
         ok: true,
         data: { missao_removida: false },
      });
      await confirmarExclusao("Excluir a dupla");
      await waitFor(() => expect(mocks.delete).toHaveBeenCalledOnce());
      await waitFor(() =>
         expect(screen.getByText("Nenhuma sessão cadastrada")).not.toBeNull()
      );
      expect(mocks.push).not.toHaveBeenCalled();
   });

   it("mantém edições de várias sessões e grava todas numa única chamada", async () => {
      const { refetch } = setup();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      changeDate("2026-09-20");
      selectCard(1);
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-19"
      );
      changeDate("2026-09-22");
      refetch();
      expect(sidebar().getAllByText("Modificado")).toHaveLength(2);
      selectCard(0);
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-20"
      );
      expect(confirm).not.toHaveBeenCalled();
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.update).toEqual([
         expect.objectContaining({ id: 1, data: "2026-09-20" }),
         expect.objectContaining({ id: 2, data: "2026-09-22" }),
      ]);
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(sidebar().queryByText("Modificado")).toBeNull();
      selectCard(1);
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-22"
      );
   });

   it("mantém vários rascunhos e salva etapas novas e modificadas juntas", async () => {
      setup();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      changeDate("2026-09-21");
      newSession();
      fillNew("2026-09-20");
      newSession();
      fillNew("2026-09-22", "14:00", "15:00");
      expect(sidebar().getAllByText("Nova")).toHaveLength(2);
      selectCard(2);
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-20"
      );
      expect(confirm).not.toHaveBeenCalled();
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      const payload = mocks.update.mock.calls[0][0].data;
      expect(payload.update).toEqual([
         expect.objectContaining({ id: 1, data: "2026-09-21" }),
      ]);
      expect(payload.create).toEqual([
         expect.objectContaining({ data: "2026-09-20", dep: "12:00:00" }),
         expect.objectContaining({ data: "2026-09-22", dep: "14:00:00" }),
      ]);
      await waitFor(() => expect(sidebar().queryByText("Nova")).toBeNull());
      expect(cards()).toHaveLength(4);
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-20"
      );
   });

   it("adiciona outro piloto a uma missão salva, filtra duplicados e respeita o limite", async () => {
      setup();
      fireEvent.change(screen.getByRole("textbox", { name: "Buscar piloto" }), {
         target: { value: "Piloto" },
      });
      const candidate = await screen.findByRole("button", { name: /Segundo/ });
      expect(screen.queryByRole("button", { name: /\(ABC\)/ })).toBeNull();
      fireEvent.click(candidate);
      expect(
         screen.queryByRole("textbox", { name: "Buscar piloto" })
      ).toBeNull();
      selectCard(1);
      selectCard(0);
      expect(
         screen.getByLabelText("Função a bordo de TEN SEGUNDO")
      ).not.toBeNull();
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.update[0].tripulantes).toEqual([
         { trip_id: 1, func: "pil", func_bordo: "1P" },
         { trip_id: 2, func: "pil", func_bordo: "2P" },
      ]);
   });

   it("permite substituir um piloto e mantém a remoção ao trocar de sessão", () => {
      setup();
      fireEvent.click(
         screen.getByRole("button", { name: "Remover CAP PILOTO" })
      );
      selectCard(1);
      selectCard(0);
      expect(
         screen.queryByLabelText("Função a bordo de CAP PILOTO")
      ).toBeNull();
      expect(saveButton().disabled).toBe(true);
   });

   it("remover e re-adicionar o mesmo piloto não deixa a sessão modificada", async () => {
      setup();
      fireEvent.click(
         screen.getByRole("button", { name: "Remover CAP PILOTO" })
      );
      expect(sidebar().getByText("Modificado")).not.toBeNull();
      fireEvent.change(screen.getByRole("textbox", { name: "Buscar piloto" }), {
         target: { value: "Piloto" },
      });
      fireEvent.click(await screen.findByRole("button", { name: /Piloto/ }));
      expect(sidebar().queryByText("Modificado")).toBeNull();
      expect(saveButton().disabled).toBe(true);
   });

   it("mantém SAGEM e Parte 1 ao navegar e grava as marcações", async () => {
      setup();
      expect(within(currentCard()).getByText("SAGEM")).not.toBeNull();
      expect(within(currentCard()).getByText("FICHA")).not.toBeNull();
      fireEvent.click(
         screen.getByRole("switch", { name: "Registrado no SAGEM" })
      );
      fireEvent.click(screen.getByRole("switch", { name: "Ficha recolhida" }));
      expect(within(currentCard()).queryByText("SAGEM")).toBeNull();
      expect(within(currentCard()).queryByText("FICHA")).toBeNull();
      selectCard(1);
      selectCard(0);
      expect(
         screen
            .getByRole("switch", { name: "Registrado no SAGEM" })
            .getAttribute("aria-checked")
      ).toBe("true");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.update[0]).toMatchObject({
         sagem: true,
         parte1: true,
      });
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(
         within(currentCard()).getByLabelText("OK, SAGEM e Ficha verificados")
      ).not.toBeNull();
   });

   it("envia SAGEM e Parte 1 também nas etapas novas", async () => {
      setup();
      newSession();
      fillNew("2026-09-20");
      fireEvent.click(
         screen.getByRole("switch", { name: "Registrado no SAGEM" })
      );
      fireEvent.click(screen.getByRole("switch", { name: "Ficha recolhida" }));
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.create[0]).toMatchObject({
         sagem: true,
         parte1: true,
      });
   });

   it("bloqueia o lote quando outra sessão está incompleta", () => {
      setup();
      newSession();
      changeDate("2026-09-20");
      selectCard(0);
      changeDate("2026-09-21");
      expect(saveButton().disabled).toBe(true);
      fireEvent.click(saveButton());
      expect(mocks.update).not.toHaveBeenCalled();
      expect(sidebar().getByText("Rascunho")).not.toBeNull();
   });

   it("preserva todos os rascunhos quando o salvamento falha", async () => {
      setup();
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      changeDate("2026-09-20");
      newSession();
      fillNew("2026-09-21");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(sidebar().getByText("Modificado")).not.toBeNull();
      expect(sidebar().getByText("Nova")).not.toBeNull();
      expect(saveButton().disabled).toBe(false);
      selectCard(0);
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-20"
      );
   });

   it("não duplica etapas novas enquanto o refetch não chega", async () => {
      setup(etapa(), { canCreate: true, canDelete: true }, false);
      newSession();
      fillNew("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      await waitFor(() => expect(sidebar().queryByText("Nova")).toBeNull());
      changeDate("2026-09-21");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(2));
      expect(mocks.update.mock.calls[1][0].data.create).toEqual([]);
      expect(mocks.update.mock.calls[1][0].data.update).toEqual([
         expect.objectContaining({ id: 3, data: "2026-09-21" }),
      ]);
   });

   it("não perde a edição seguinte quando o refetch posterior ao save traz o dado gravado", async () => {
      const { refetch } = setup();
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      selectCard(1);
      changeDate("2026-09-22");
      refetch();
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-22"
      );
      expect(sidebar().getByText("Modificado")).not.toBeNull();
   });

   it("descarta a leitura anterior que chega durante o save bem-sucedido", async () => {
      const { deliver, inicial } = setup(etapa(), undefined, false);
      const salvo = mocks.update.getMockImplementation()!;
      let liberar!: () => void;
      mocks.update.mockImplementationOnce(
         (args) =>
            new Promise((resolve) => {
               liberar = () => resolve(salvo(args));
            })
      );
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      // Leitura do servidor anterior ao PUT, entregue com o save em curso.
      act(() => deliver(structuredClone(inicial)));
      await act(async () => liberar());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(screen.getByLabelText<HTMLInputElement>("Data").value).toBe(
         "2026-09-20"
      );
      expect(sidebar().queryByText("Modificado")).toBeNull();
   });

   it("salvar grava uma única vez e limpa o estado modificado", async () => {
      setup();
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      await waitFor(() => expect(saveButton().disabled).toBe(true));
      expect(mocks.update).toHaveBeenCalledOnce();
   });

   it("avisa ao sair quando há edição em outra sessão", () => {
      setup();
      changeDate("2026-09-20");
      selectCard(1);
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      fireEvent.click(
         screen.getByRole("button", { name: "Voltar para o simulador" })
      );
      expect(confirm).toHaveBeenCalledOnce();
      expect(mocks.push).not.toHaveBeenCalled();
   });

   it("não pede confirmação ao sair sem alterações e limpa a marcação após desfazer", () => {
      setup();
      changeDate("2026-09-20");
      changeDate("2026-09-19");
      expect(saveButton().disabled).toBe(true);
      expect(sidebar().queryByText("Modificado")).toBeNull();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      fireEvent.click(
         screen.getByRole("button", { name: "Voltar para o simulador" })
      );
      expect(confirm).not.toHaveBeenCalled();
      expect(mocks.push).toHaveBeenCalledWith("/instrucao/simulador");
   });

   it("grava somente a observação sem reescrever etapas intactas", async () => {
      setup();
      fireEvent.change(screen.getByLabelText("Observações da missão"), {
         target: { value: "Observação" },
      });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data).toMatchObject({
         obs: "Observação",
         update: [],
         create: [],
         delete_ids: [],
      });
   });

   it("preserva os dados não expostos pelo formulário", async () => {
      setup({
         ...etapa(),
         obs: "Não apagar",
         tow: 7,
         pax: 3,
         sagem: true,
         parte1: true,
      });
      changeDate("2026-09-20");
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.update[0]).toMatchObject({
         obs: "Não apagar",
         tow: 7,
         pax: 3,
         sagem: true,
         parte1: true,
      });
   });

   it("não trata o tipo padrão de uma etapa legada como alteração", () => {
      setup({ ...etapa(), oi_etapas: [] });
      expect(saveButton().disabled).toBe(true);
      expect(sidebar().queryByText("Modificado")).toBeNull();
   });

   it("permite remover um rascunho sem chamar a API", () => {
      setup();
      newSession();
      fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
      fireEvent.click(
         within(screen.getByRole("dialog")).getByRole("button", {
            name: "Excluir sessão",
         })
      );
      expect(mocks.delete).not.toHaveBeenCalled();
      expect(cards()).toHaveLength(2);
      expect(saveButton().disabled).toBe(true);
   });

   it("a nova dupla mantém proteção de saída", () => {
      render(<NovaMissaoSimulador anoRef={2026} />);
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
});
