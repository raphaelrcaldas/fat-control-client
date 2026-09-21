// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useSessaoForm } from "@/app/(home)/instrucao/simulador/hooks/useSessaoForm";
import SessaoOrdemInstrucaoFields from "@/app/(home)/instrucao/simulador/components/SessaoOrdemInstrucaoFields";

const mocks = vi.hoisted(() => ({
   retryEsfAer: vi.fn().mockResolvedValue({}),
   retryTipos: vi.fn().mockResolvedValue({}),
   esfAerData: undefined as { id: number; descricao: string }[] | undefined,
   isEsfAerError: true,
}));

vi.mock("@/app/context/toast", () => ({
   useToast: () => ({ push: vi.fn() }),
}));
vi.mock("@/hooks/queries/useEtapas", () => {
   const mutation = () => ({ mutateAsync: vi.fn(), isPending: false });
   return {
      useCreateEtapa: mutation,
      useUpdateEtapa: mutation,
      useCreateMissaoWithEtapas: mutation,
   };
});
vi.mock("@/hooks/queries/useEsfAer", () => ({
   useEsfAerList: () => ({
      data: mocks.esfAerData,
      isLoading: false,
      isFetching: false,
      isError: mocks.isEsfAerError,
      error: mocks.isEsfAerError ? new Error("Falha de conexão") : null,
      refetch: mocks.retryEsfAer,
   }),
}));
vi.mock("@/hooks/queries/useTiposMissao", () => ({
   useTiposMissao: () => ({
      data: [{ id: 1, cod: "SIM", desc: "Simulador" }],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: mocks.retryTipos,
   }),
}));

function FormCatalogos() {
   const form = useSessaoForm({
      show: true,
      missaoId: -1,
      anoRef: 2026,
      pilots: [],
      editEtapa: null,
      onClose: () => undefined,
   });
   return <SessaoOrdemInstrucaoFields form={form} />;
}

beforeEach(() => {
   mocks.esfAerData = undefined;
   mocks.isEsfAerError = true;
});

afterEach(() => {
   cleanup();
   vi.clearAllMocks();
});

describe("catálogos do formulário do simulador", () => {
   it("explica a falha de carga e permite tentar novamente", () => {
      render(<FormCatalogos />);
      expect(screen.getByRole("alert").textContent).toMatch(/carregar/i);
      fireEvent.click(
         screen.getByRole("button", { name: /tentar novamente/i })
      );
      expect(mocks.retryEsfAer).toHaveBeenCalledOnce();
      expect(mocks.retryTipos).toHaveBeenCalledOnce();
   });

   it("distingue a configuração sem SML de uma falha de conexão", () => {
      mocks.esfAerData = [];
      mocks.isEsfAerError = false;
      render(<FormCatalogos />);
      expect(screen.getByRole("alert").textContent).toMatch(/SML/);
      expect(screen.getByRole("alert").textContent).not.toMatch(/conexão/);
   });
});
