// @vitest-environment jsdom

import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SimuladorEditorHeader } from "@/app/(home)/instrucao/simulador/missao/components/SimuladorEditorHeader";
import {
   SIDEBAR_DRAWER_ID,
   SimuladorSidebarDrawer,
} from "@/app/(home)/instrucao/simulador/missao/components/SimuladorSidebarDrawer";

function Harness() {
   const triggerRef = useRef<HTMLButtonElement>(null);
   const [open, setOpen] = useState(false);
   return (
      <>
         <SimuladorEditorHeader
            title="SBGL → SBGL"
            subtitle="19/09/2026"
            canDelete={false}
            canSave={false}
            isSaving={false}
            onBack={vi.fn()}
            onOpenSidebar={() => setOpen(true)}
            sidebarTriggerRef={triggerRef}
            sidebarOpen={open}
            sidebarId={SIDEBAR_DRAWER_ID}
         />
         <SimuladorSidebarDrawer
            open={open}
            onClose={() => setOpen(false)}
            returnFocusRef={triggerRef}
         >
            <button type="button">Item da sidebar</button>
         </SimuladorSidebarDrawer>
      </>
   );
}

const trigger = () =>
   screen.getByRole("button", { name: "Abrir painel de sessões" });
const panel = () => screen.getByTestId("flowbite-drawer");

afterEach(cleanup);

describe("drawer de sessões", () => {
   it("fechado, fica inerte e fora da árvore de acessibilidade", () => {
      render(<Harness />);
      expect(panel().hasAttribute("inert")).toBe(true);
      expect(panel().getAttribute("aria-hidden")).toBe("true");
      expect(trigger().getAttribute("aria-expanded")).toBe("false");
      expect(trigger().getAttribute("aria-controls")).toBe(panel().id);
   });

   it("ao abrir, libera o painel e leva o foco ao botão de fechar", () => {
      render(<Harness />);
      fireEvent.click(trigger());
      expect(panel().hasAttribute("inert")).toBe(false);
      expect(panel().getAttribute("aria-hidden")).toBe("false");
      expect(trigger().getAttribute("aria-expanded")).toBe("true");
      expect(document.activeElement).toBe(
         screen.getByRole("button", { name: "Fechar painel de sessões" })
      );
   });

   it("Escape fecha e devolve o foco ao gatilho", () => {
      render(<Harness />);
      trigger().focus();
      fireEvent.click(trigger());
      fireEvent.keyDown(document, { key: "Escape" });
      expect(panel().hasAttribute("inert")).toBe(true);
      expect(trigger().getAttribute("aria-expanded")).toBe("false");
      expect(document.activeElement).toBe(trigger());
   });

   it("o botão de fechar também devolve o foco ao gatilho", () => {
      render(<Harness />);
      fireEvent.click(trigger());
      fireEvent.click(
         screen.getByRole("button", { name: "Fechar painel de sessões" })
      );
      expect(document.activeElement).toBe(trigger());
   });

   it("não rouba o foco na montagem", () => {
      render(<Harness />);
      expect(document.activeElement).toBe(document.body);
   });
});
