// @vitest-environment jsdom

// Fixa o render padrão dos componentes de Estatística que o simulador também
// usa: sem as opções do simulador, o texto é o de sempre.

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EtapaSidebarItem } from "@/app/(home)/estatistica/etapas/missao/components/EtapaSidebarItem";
import { MissaoSidebar } from "@/app/(home)/estatistica/etapas/missao/components/MissaoSidebar";
import { SESSAO_LABEL } from "@/app/(home)/instrucao/simulador/helpers/itemLabel";
import { SimuladorEditorSkeleton } from "@/app/(home)/instrucao/simulador/missao/components/SimuladorEditorSkeleton";

afterEach(cleanup);

const base = {
   numero: "01",
   data: "2026-03-05",
   origem: "SBBR",
   destino: "SBGL",
   anv: "2850",
   depHora: "10:00",
   arrHora: "11:00",
   tvooMin: 60,
   status: "ok" as const,
   sagem: true,
   parte1: true,
   selected: false,
   onClick: vi.fn(),
};

describe("EtapaSidebarItem — padrão de Estatística", () => {
   it("selo de Parte 1 pendente mantém rótulo e tooltip", () => {
      render(<EtapaSidebarItem {...base} parte1={false} />);
      const selo = screen.getByText("PARTE 1");
      expect(selo.closest("[title]")?.getAttribute("title")).toBe(
         "Relatório Parte 1 pendente"
      );
   });

   it("selos de nova e modificada falam em etapa", () => {
      const { rerender } = render(
         <EtapaSidebarItem {...base} isNew isModified />
      );
      expect(
         screen.getByText("Nova").closest("[title]")?.getAttribute("title")
      ).toBe("Esta etapa é nova e ainda não foi salva");
      expect(
         screen
            .getByText("Modificado")
            .closest("[title]")
            ?.getAttribute("title")
      ).toBe("Esta etapa foi modificada e ainda não foi salva");
      rerender(<EtapaSidebarItem {...base} />);
      expect(
         screen.getByTitle("OK · SAGEM e Parte 1 verificados")
      ).not.toBeNull();
   });

   it("não fica desabilitado por padrão", () => {
      render(<EtapaSidebarItem {...base} />);
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
         false
      );
   });

   it("desabilitado ganha cursor e opacidade próprios", () => {
      render(<EtapaSidebarItem {...base} disabled />);
      const botao = screen.getByRole("button") as HTMLButtonElement;
      expect(botao.disabled).toBe(true);
      expect(botao.className).toContain("disabled:cursor-not-allowed");
      expect(botao.className).toContain("disabled:opacity-60");
      expect(botao.className).toContain("enabled:hover:bg-gray-50");
   });
});

describe("MissaoSidebar — opções do simulador", () => {
   const etapa = {
      ...base,
      localId: "a",
      parte1: false,
      isNew: true,
   };

   it("padrão: Parte 1 e etapa", () => {
      render(
         <MissaoSidebar
            tituloMissao="Missão"
            etapas={[etapa]}
            onSelectEtapa={vi.fn()}
            onAddEtapa={vi.fn()}
         />
      );
      expect(
         screen.getByText("PARTE 1").closest("[title]")?.getAttribute("title")
      ).toBe("Relatório Parte 1 pendente");
      expect(
         screen.getByText("Nova").closest("[title]")?.getAttribute("title")
      ).toBe("Esta etapa é nova e ainda não foi salva");
   });

   it("simulador: Ficha e sessão", () => {
      render(
         <MissaoSidebar
            tituloMissao="Missão"
            etapas={[etapa]}
            onSelectEtapa={vi.fn()}
            parte1Label="Ficha"
            parte1Title="Ficha pendente"
            itemLabel={SESSAO_LABEL}
         />
      );
      expect(
         screen.getByText("FICHA").closest("[title]")?.getAttribute("title")
      ).toBe("Ficha pendente");
      expect(
         screen.getByText("Nova").closest("[title]")?.getAttribute("title")
      ).toBe("Esta sessão é nova e ainda não foi salva");
   });
});

describe("SimuladorEditorSkeleton — rodapé da sidebar", () => {
   const botoes = () =>
      screen.queryAllByTestId("skeleton-sidebar-action").length;

   it("sem permissões não desenha botões nem rodapé", () => {
      render(<SimuladorEditorSkeleton />);
      expect(botoes()).toBe(0);
      expect(screen.queryByTestId("skeleton-sidebar-footer")).toBeNull();
   });

   it("espelha cada permissão com um botão", () => {
      render(<SimuladorEditorSkeleton canCreate />);
      expect(botoes()).toBe(1);
      cleanup();
      render(<SimuladorEditorSkeleton canDelete />);
      expect(botoes()).toBe(1);
      cleanup();
      render(<SimuladorEditorSkeleton canCreate canDelete />);
      expect(botoes()).toBe(2);
      expect(screen.getByTestId("skeleton-sidebar-footer")).not.toBeNull();
   });
});
