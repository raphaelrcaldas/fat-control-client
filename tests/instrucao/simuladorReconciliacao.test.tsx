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
   delete: vi.fn(),
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
   useDeleteEtapa: () => ({ mutateAsync: mocks.delete, isPending: false }),
   useDeleteMissaoComEtapas: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
   }),
}));
vi.mock("@/hooks/queries/useTrips", () => ({
   useTrips: () => ({ data: { items: [] }, isLoading: false }),
}));

const sessao = (id: number, patch: Partial<EtapaItem> = {}): EtapaItem => ({
   ...etapa(id),
   ...patch,
});
const missaoCom = (
   etapas: EtapaItem[],
   patch: Partial<MissaoComEtapasDetail> = {}
): MissaoComEtapasDetail => ({
   id: 1,
   titulo: "Simulador",
   obs: null,
   is_simulador: true,
   etapas,
   ...patch,
});

/** `server(next)` entrega ao editor uma nova leitura da missão. */
function mount(initial: MissaoComEtapasDetail) {
   const props = (missao: MissaoComEtapasDetail) => ({
      missao,
      canCreate: true,
      canDelete: true,
      isFetching: false,
   });
   const view = render(<SimuladorMissaoEditor {...props(initial)} />);
   return {
      server: (next: MissaoComEtapasDetail) =>
         view.rerender(<SimuladorMissaoEditor {...props(next)} />),
   };
}

const sidebar = () =>
   within(
      screen.getByRole("complementary", {
         name: "Painel da missão de simulador",
      })
   );
const cards = () => sidebar().getAllByRole("button", { name: /→/ });
const selectCard = (index: number) => fireEvent.click(cards()[index]);
const dataInput = () => screen.getByLabelText<HTMLInputElement>("Data");
const changeDate = (value: string) =>
   fireEvent.change(screen.getByLabelText("Data"), { target: { value } });
const saveButton = () =>
   screen.getByRole<HTMLButtonElement>("button", { name: "Salvar alterações" });

beforeEach(() => {
   vi.clearAllMocks();
   HTMLElement.prototype.scrollTo = vi.fn();
   HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
   cleanup();
   vi.restoreAllMocks();
});

describe("reconciliação do rascunho com o servidor", () => {
   it("remove em silêncio a sessão limpa excluída por outra pessoa", () => {
      const { server } = mount(missaoCom([sessao(1), sessao(2)]));
      server(missaoCom([sessao(1)]));
      expect(cards()).toHaveLength(1);
      expect(mocks.toast).not.toHaveBeenCalled();
      expect(saveButton().disabled).toBe(true);
   });

   it("descarta a sessão modificada excluída por outra pessoa, avisa e não a reenvia", async () => {
      const { server } = mount(missaoCom([sessao(1), sessao(2)]));
      selectCard(1);
      changeDate("2026-09-22");
      server(missaoCom([sessao(1)]));
      expect(cards()).toHaveLength(1);
      expect(mocks.toast).toHaveBeenCalledWith(
         expect.objectContaining({
            type: "warning",
            message:
               "Sessão 19/09 excluída por outro usuário; suas alterações nela foram descartadas",
         })
      );
      expect(sidebar().queryByText("Modificado")).toBeNull();
      expect(saveButton().disabled).toBe(true);
      // A sessão 1 passa a ser a selecionada e editável.
      expect(dataInput().value).toBe("2026-09-19");
      changeDate("2026-09-20");
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data).toMatchObject({
         delete_ids: [],
         update: [expect.objectContaining({ id: 1 })],
      });
   });

   it("incorpora limpa a sessão criada por outra pessoa, na ordem cronológica", () => {
      const { server } = mount(missaoCom([sessao(1), sessao(3)]));
      server(
         missaoCom([
            sessao(1),
            sessao(2, { data: "2026-09-20" }),
            sessao(3, { data: "2026-09-21" }),
         ])
      );
      expect(cards()).toHaveLength(3);
      expect(sidebar().queryByText("Modificado")).toBeNull();
      expect(saveButton().disabled).toBe(true);
      selectCard(1);
      expect(dataInput().value).toBe("2026-09-20");
   });

   it("mantém as sessões novas ao incorporar a do servidor", () => {
      const { server } = mount(missaoCom([sessao(1)]));
      fireEvent.click(screen.getByRole("button", { name: /^Nova sessão$/ }));
      server(missaoCom([sessao(1), sessao(2, { data: "2026-09-25" })]));
      expect(cards()).toHaveLength(3);
      expect(sidebar().getByText("Nova")).not.toBeNull();
   });

   it("atualiza a sessão limpa que mudou no servidor, preservando a seleção", () => {
      const { server } = mount(missaoCom([sessao(1), sessao(2)]));
      selectCard(1);
      server(
         missaoCom([
            sessao(1, { data: "2026-09-10" }),
            sessao(2, { data: "2026-09-21", pousos: 4 }),
         ])
      );
      expect(dataInput().value).toBe("2026-09-21");
      expect(screen.getByLabelText<HTMLInputElement>("Pousos").value).toBe("4");
      selectCard(0);
      expect(dataInput().value).toBe("2026-09-10");
      expect(sidebar().queryByText("Modificado")).toBeNull();
      expect(saveButton().disabled).toBe(true);
   });

   it("preserva a sessão modificada quando o servidor a altera", async () => {
      const { server } = mount(missaoCom([sessao(1), sessao(2)]));
      changeDate("2026-09-20");
      server(
         missaoCom([
            sessao(1, { data: "2026-09-10", origem: "SBBR" }),
            sessao(2),
         ])
      );
      expect(dataInput().value).toBe("2026-09-20");
      expect(sidebar().getAllByText("Modificado")).toHaveLength(1);
      expect(saveButton().disabled).toBe(false);
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      // A próxima gravação sobrescreve a sessão com o rascunho.
      expect(mocks.update.mock.calls[0][0].data.update).toEqual([
         expect.objectContaining({ id: 1, data: "2026-09-20", origem: "SBGL" }),
      ]);
   });

   it("leitura idêntica não altera nada nem suja o rascunho", () => {
      const initial = missaoCom([sessao(1), sessao(2)]);
      const { server } = mount(initial);
      selectCard(1);
      server(structuredClone(initial));
      server(structuredClone(initial));
      expect(sidebar().queryByText("Modificado")).toBeNull();
      expect(saveButton().disabled).toBe(true);
      expect(dataInput().value).toBe("2026-09-19");
      expect(
         cards().find((button) => button.hasAttribute("aria-current"))
            ?.textContent
      ).toContain("02");
   });

   it("atualiza a observação limpa e preserva a que o usuário editou", () => {
      const { server } = mount(missaoCom([sessao(1)], { obs: "antiga" }));
      const obs = () =>
         screen.getByLabelText<HTMLTextAreaElement>("Observações da missão");
      server(missaoCom([sessao(1)], { obs: "do servidor" }));
      expect(obs().value).toBe("do servidor");
      expect(saveButton().disabled).toBe(true);
      fireEvent.change(obs(), { target: { value: "minha" } });
      server(missaoCom([sessao(1)], { obs: "outra" }));
      expect(obs().value).toBe("minha");
      expect(saveButton().disabled).toBe(false);
   });

   describe("PUT recusado", () => {
      /** Edita a sessão 2 e deixa o PUT em voo; `settle` o resolve. */
      async function saveEmVoo() {
         const view = mount(missaoCom([sessao(1), sessao(2)]));
         selectCard(1);
         changeDate("2026-09-22");
         const deferred = Promise.withResolvers<object>();
         mocks.update.mockReturnValueOnce(deferred.promise);
         fireEvent.click(saveButton());
         await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
         return {
            ...view,
            settle: (result: object) =>
               act(async () => deferred.resolve(result)),
         };
      }
      const recusado = {
         ok: false,
         message: "Etapa(s) não pertencem à missão",
      };
      const avisoDescarte = expect.objectContaining({
         type: "warning",
         message:
            "Sessão 19/09 excluída por outro usuário; suas alterações nela foram descartadas",
      });

      it("aplica, depois do erro, a leitura que chegou durante o save e descarta a sessão excluída", async () => {
         const { server, settle } = await saveEmVoo();
         const lida = missaoCom([sessao(1)]);
         // Leitura sem a sessão 2 chega com o PUT em voo: fica guardada.
         server(lida);
         expect(cards()).toHaveLength(2);
         expect(mocks.toast).not.toHaveBeenCalled();
         await settle(recusado);
         await waitFor(() => expect(cards()).toHaveLength(1));
         expect(mocks.toast).toHaveBeenCalledWith(avisoDescarte);
         expect(sidebar().queryByText("Modificado")).toBeNull();
         expect(saveButton().disabled).toBe(true);
         // Uma nova leitura idêntica (mesma referência, por structural
         // sharing, ou cópia) não repete o aviso nem altera o rascunho.
         const avisos = () =>
            mocks.toast.mock.calls.filter(([t]) => t.type === "warning");
         server(lida);
         server(structuredClone(lida));
         expect(avisos()).toHaveLength(1);
         expect(cards()).toHaveLength(1);
      });

      it("reconcilia com a leitura que só chega depois do erro (invalidação do PUT)", async () => {
         const { server, settle } = await saveEmVoo();
         await settle(recusado);
         expect(cards()).toHaveLength(2);
         server(missaoCom([sessao(1)]));
         expect(cards()).toHaveLength(1);
         expect(mocks.toast).toHaveBeenCalledWith(avisoDescarte);
      });

      it("no erro por exceção (catch) também aplica a leitura recebida durante o save", async () => {
         const view = mount(missaoCom([sessao(1), sessao(2)]));
         selectCard(1);
         changeDate("2026-09-22");
         const deferred = Promise.withResolvers<object>();
         mocks.update.mockReturnValueOnce(deferred.promise);
         fireEvent.click(saveButton());
         await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
         view.server(missaoCom([sessao(1)]));
         await act(async () => deferred.reject(new Error("rede")));
         await waitFor(() => expect(cards()).toHaveLength(1));
         expect(mocks.toast).toHaveBeenCalledWith(avisoDescarte);
      });

      it("depois de reconciliar, o save seguinte não reenvia a sessão excluída", async () => {
         const { server, settle } = await saveEmVoo();
         server(missaoCom([sessao(1)]));
         await settle(recusado);
         await waitFor(() => expect(cards()).toHaveLength(1));
         changeDate("2026-09-20");
         mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
         fireEvent.click(saveButton());
         await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(2));
         expect(mocks.update.mock.calls[1][0].data).toMatchObject({
            delete_ids: [],
            update: [expect.objectContaining({ id: 1 })],
         });
      });
   });

   it("PUT aceito: a leitura pré-PUT que chegou no meio é descartada e as sessões criadas permanecem", async () => {
      const inicial = missaoCom([sessao(1), sessao(2)]);
      const { server } = mount(inicial);
      fireEvent.click(screen.getByRole("button", { name: /^Nova sessão$/ }));
      changeDate("2026-09-25");
      for (const [label, value] of [
         ["Origem", "SBGL"],
         ["Destino", "SBBR"],
         ["DEP", "12:00"],
         ["ARR", "13:00"],
      ])
         fireEvent.change(screen.getByLabelText(label), {
            target: { value },
         });
      expect(cards()).toHaveLength(3);
      const deferred = Promise.withResolvers<object>();
      mocks.update.mockReturnValueOnce(deferred.promise);
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.create).toHaveLength(1);
      // Leitura anterior ao PUT (sem a sessão nova) chega com ele em voo.
      server(structuredClone(inicial));
      expect(cards()).toHaveLength(3);
      await act(async () =>
         deferred.resolve({
            ok: true,
            data: missaoCom([
               sessao(1),
               sessao(2),
               sessao(3, { data: "2026-09-25" }),
            ]),
         })
      );
      await waitFor(() =>
         expect(mocks.toast).toHaveBeenCalledWith(
            expect.objectContaining({ type: "success" })
         )
      );
      // A leitura antiga não pode "excluir" a sessão que o PUT acabou de criar.
      expect(cards()).toHaveLength(3);
      expect(sidebar().queryByText("Nova")).toBeNull();
      expect(
         mocks.toast.mock.calls.filter(([t]) => t.type === "warning")
      ).toHaveLength(0);
      expect(saveButton().disabled).toBe(true);
   });

   it("trata como removida a sessão que o servidor já não tem (404 ao excluir)", async () => {
      const { server } = mount(missaoCom([sessao(1), sessao(2)]));
      selectCard(1);
      mocks.delete.mockResolvedValue({
         ok: false,
         notFound: true,
         message: "Etapa não encontrada",
      });
      fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
      fireEvent.click(
         within(screen.getByRole("dialog")).getByRole("button", {
            name: "Excluir sessão",
         })
      );
      await waitFor(() => expect(cards()).toHaveLength(1));
      expect(mocks.toast).toHaveBeenCalledWith(
         expect.objectContaining({
            type: "success",
            message: "A sessão já havia sido excluída por outro usuário",
         })
      );
      // O refetch posterior, já sem a sessão, não a reincorpora nem suja.
      server(missaoCom([sessao(1)]));
      expect(cards()).toHaveLength(1);
      changeDate("2026-09-20");
      mocks.update.mockResolvedValue({ ok: false, message: "Falha" });
      fireEvent.click(saveButton());
      await waitFor(() => expect(mocks.update).toHaveBeenCalledOnce());
      expect(mocks.update.mock.calls[0][0].data.delete_ids).toEqual([]);
   });

   it("mantém a sessão e mostra o erro quando a exclusão falha por outro motivo", async () => {
      mount(missaoCom([sessao(1), sessao(2)]));
      mocks.delete.mockResolvedValue({
         ok: false,
         notFound: false,
         message: "Sem permissão",
      });
      fireEvent.click(screen.getByRole("button", { name: "Excluir sessão" }));
      fireEvent.click(
         within(screen.getByRole("dialog")).getByRole("button", {
            name: "Excluir sessão",
         })
      );
      await waitFor(() =>
         expect(mocks.toast).toHaveBeenCalledWith(
            expect.objectContaining({ type: "error", message: "Sem permissão" })
         )
      );
      expect(cards()).toHaveLength(2);
   });
});
