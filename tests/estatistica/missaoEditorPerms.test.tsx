// @vitest-environment jsdom

// O PUT transacional da missão exige `update` na rota, mais `create` quando o
// lote cria etapa e `delete` quando exclui uma persistida. O editor de
// Estatística esconde as ações que o servidor recusaria e só habilita o salvar
// quando o rascunho cabe nas permissões do usuário.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mocks = vi.hoisted(() => ({
   push: vi.fn(),
   replace: vi.fn(),
   toast: vi.fn(),
   update: vi.fn(),
   save: vi.fn(),
   auth: { role: "user", perms: [] as { resource: string; name: string }[] },
}));
vi.mock("next/navigation", () => ({
   useRouter: () => ({
      push: mocks.push,
      replace: mocks.replace,
      back: vi.fn(),
   }),
}));
vi.mock("@/app/context/toast", () => ({
   useToast: () => ({ push: mocks.toast }),
}));
vi.mock("@/app/context/auth", () => ({
   useAuth: () => mocks.auth,
}));
vi.mock(
   "@/app/(home)/estatistica/etapas/missao/hooks/useUpdateMissaoDraft",
   () => ({
      useUpdateMissaoDraft: () => ({ mutate: mocks.update, isPending: false }),
   })
);
vi.mock(
   "@/app/(home)/estatistica/etapas/missao/hooks/useSaveMissaoDraft",
   () => ({
      useSaveMissaoDraft: () => ({ mutate: mocks.save, isPending: false }),
   })
);
// O formulário da etapa puxa dezenas de queries e não entra neste contrato
vi.mock(
   "@/app/(home)/estatistica/etapas/missao/components/EtapaContent",
   () => ({
      EtapaContent: () => <div data-testid="etapa-content" />,
   })
);

import { MissaoEditor } from "@/app/(home)/estatistica/etapas/missao/components/MissaoEditor";
import { MissaoDraftProvider } from "@/app/(home)/estatistica/etapas/missao/context/MissaoDraftContext";
import type {
   DraftEtapa,
   MissaoDraft,
} from "@/app/(home)/estatistica/etapas/missao/context/types";
import { DEFAULT_ETAPA_FORM } from "@/app/(home)/estatistica/etapas/missao/context/factories";

function etapa(serverId: number | null, localId: string): DraftEtapa {
   return {
      localId,
      serverId,
      status: "ok",
      form: {
         ...DEFAULT_ETAPA_FORM,
         data: "2026-03-05",
         origem: "SBBR",
         destino: "SBGL",
         dep: "10:00",
         arr: "11:00",
         anv: "2850",
      },
      oiItems: [],
      assignedTrips: [],
      pqd: [],
      revo: [],
      heavyCds: [],
      dirty: false,
   };
}

/** Missão persistida com as etapas 1 e 2; `initial` são os ids carregados. */
function draft(
   etapas: DraftEtapa[],
   selected: string,
   initial = [1, 2]
): MissaoDraft {
   return {
      serverId: 10,
      titulo: "Missão teste",
      obs: null,
      is_simulador: false,
      etapas,
      selectedLocalId: selected,
      initialEtapaServerIds: initial,
      // null: o rascunho conta como alterado e o Salvar fica à mostra
      initialSnapshot: null,
   };
}

const persistidas = () => [etapa(1, "a"), etapa(2, "b")];

function perms(...names: string[]) {
   mocks.auth.perms = names.map((name) => ({
      resource: "estatistica.etapas",
      name,
   }));
}

function renderEditor(
   initialDraft: MissaoDraft,
   mode: "new" | "edit" = "edit"
) {
   return render(
      <QueryClientProvider client={new QueryClient()}>
         <MissaoDraftProvider initialDraft={initialDraft}>
            <MissaoEditor mode={mode} />
         </MissaoDraftProvider>
      </QueryClientProvider>
   );
}

const addButton = () => screen.queryByRole("button", { name: /Nova etapa/ });
const deleteButton = () =>
   screen.queryByRole("button", { name: "Excluir etapa" });
const deleteMissaoButton = () =>
   screen.queryByRole("button", { name: /Excluir missão/ });
const save = () => screen.getByRole("button", { name: "Salvar" });

beforeEach(() => {
   // jsdom não implementa a rolagem que o editor dispara ao selecionar
   Element.prototype.scrollIntoView = vi.fn();
   Element.prototype.scrollTo = vi.fn();
   mocks.auth.role = "user";
   mocks.auth.perms = [];
});
afterEach(() => {
   cleanup();
   vi.clearAllMocks();
});

describe("MissaoEditor — só update", () => {
   beforeEach(() => perms("update"));

   it("esconde adicionar e excluir etapa persistida", () => {
      renderEditor(draft(persistidas(), "a"));
      expect(addButton()).toBeNull();
      expect(deleteButton()).toBeNull();
   });

   it("esconde Excluir missão (o DELETE da missão exige delete)", () => {
      renderEditor(draft(persistidas(), "a"));
      expect(deleteMissaoButton()).toBeNull();
   });

   it("salva a edição de etapas existentes", () => {
      renderEditor(draft(persistidas(), "a"));
      fireEvent.click(save());
      expect(mocks.update).toHaveBeenCalledTimes(1);
      expect(mocks.toast).not.toHaveBeenCalled();
   });

   it("recusa salvar quando o rascunho exclui etapa persistida", () => {
      renderEditor(draft(persistidas(), "a", [1, 2, 3]));
      fireEvent.click(save());
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.toast).toHaveBeenCalledWith(
         expect.objectContaining({
            type: "warning",
            message: expect.stringContaining("criar ou excluir etapas"),
         })
      );
   });

   it("recusa salvar quando o rascunho tem etapa nova", () => {
      renderEditor(draft([...persistidas(), etapa(null, "c")], "a"));
      fireEvent.click(save());
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.toast).toHaveBeenCalledWith(
         expect.objectContaining({ type: "warning" })
      );
   });
});

describe("MissaoEditor — update + create", () => {
   beforeEach(() => perms("update", "create"));

   it("oferece adicionar; a etapa nova pode ser excluída sem delete", () => {
      renderEditor(draft(persistidas(), "a"));
      expect(deleteButton()).toBeNull();
      fireEvent.click(addButton()!);
      // a etapa recém-criada vira a selecionada
      expect(deleteButton()).not.toBeNull();
   });

   it("salva o lote com etapa nova", () => {
      renderEditor(draft([...persistidas(), etapa(null, "c")], "a"));
      fireEvent.click(save());
      expect(mocks.update).toHaveBeenCalledTimes(1);
      expect(mocks.toast).not.toHaveBeenCalled();
   });

   it("não oferece excluir a etapa persistida, mas sim a nova", () => {
      renderEditor(draft([...persistidas(), etapa(null, "c")], "a"));
      expect(deleteButton()).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: /^03/ }));
      expect(deleteButton()).not.toBeNull();
   });

   it("ainda recusa salvar quando exclui etapa persistida", () => {
      renderEditor(draft(persistidas(), "a", [1, 2, 3]));
      fireEvent.click(save());
      expect(mocks.update).not.toHaveBeenCalled();
   });
});

describe("MissaoEditor — update + delete", () => {
   beforeEach(() => perms("update", "delete"));

   it("oferece excluir a etapa persistida, sem adicionar", () => {
      renderEditor(draft(persistidas(), "a"));
      expect(deleteButton()).not.toBeNull();
      expect(addButton()).toBeNull();
   });

   it("mostra Excluir missão", () => {
      renderEditor(draft(persistidas(), "a"));
      expect(deleteMissaoButton()).not.toBeNull();
   });

   it("salva quando o rascunho exclui etapa persistida", () => {
      renderEditor(draft(persistidas(), "a", [1, 2, 3]));
      fireEvent.click(save());
      expect(mocks.update).toHaveBeenCalledTimes(1);
   });

   it("recusa salvar quando o rascunho tem etapa nova", () => {
      renderEditor(draft([...persistidas(), etapa(null, "c")], "a"));
      fireEvent.click(save());
      expect(mocks.update).not.toHaveBeenCalled();
   });
});

describe("MissaoEditor — sem update", () => {
   it("create + delete não salvam a edição (a rota exige update)", () => {
      perms("create", "delete");
      renderEditor(draft(persistidas(), "a"));
      fireEvent.click(save());
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.toast).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "Você não tem permissão para salvar missões.",
         })
      );
   });
});

describe("MissaoEditor — missão nova", () => {
   it("exige create, não update", () => {
      perms("create");
      renderEditor(
         { ...draft([etapa(null, "a")], "a", []), serverId: null },
         "new"
      );
      fireEvent.click(save());
      expect(mocks.save).toHaveBeenCalledTimes(1);
   });

   it("só update não cria", () => {
      perms("update");
      renderEditor(
         { ...draft([etapa(null, "a")], "a", []), serverId: null },
         "new"
      );
      fireEvent.click(save());
      expect(mocks.save).not.toHaveBeenCalled();
   });
});

describe("MissaoEditor — admin", () => {
   it("vê tudo e salva qualquer lote", () => {
      mocks.auth.role = "admin";
      renderEditor(draft([...persistidas(), etapa(null, "c")], "a", [1, 2, 3]));
      expect(addButton()).not.toBeNull();
      expect(deleteButton()).not.toBeNull();
      fireEvent.click(save());
      expect(mocks.update).toHaveBeenCalledTimes(1);
   });
});
