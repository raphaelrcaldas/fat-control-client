"use client";

import {
   useEffect,
   useRef,
   useState,
   type ReactNode,
   type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Drawer } from "flowbite-react";
import { HiMenuAlt2, HiX } from "react-icons/hi";

/** `id` do painel: o gatilho o referencia em `aria-controls`. */
export const SIDEBAR_DRAWER_ID = "simulador-sidebar-drawer";

export function SimuladorSidebarDrawer({
   open,
   onClose,
   returnFocusRef,
   children,
}: {
   open: boolean;
   onClose: () => void;
   /** Gatilho que abriu o painel: recebe o foco de volta ao fechar. */
   returnFocusRef?: RefObject<HTMLElement | null>;
   children: ReactNode;
}) {
   const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
   const closeRef = useRef<HTMLButtonElement>(null);
   const wasOpen = useRef(false);
   useEffect(() => setPortalTarget(document.body), []);
   useEffect(() => {
      if (open) closeRef.current?.focus();
      else if (wasOpen.current) returnFocusRef?.current?.focus();
      wasOpen.current = open;
   }, [open, returnFocusRef]);
   if (!portalTarget) return null;

   // Fora do wrapper de PageTransition: seu translate prenderia o drawer
   // à página. O painel usa a mesma largura da sidebar de Estatística.
   return createPortal(
      <Drawer
         open={open}
         onClose={onClose}
         position="left"
         id={SIDEBAR_DRAWER_ID}
         aria-label="Sessões da missão"
         // Fechado, o Flowbite só desloca o painel para fora da tela: ele segue
         // montado como dialog modal, com o botão de fechar focável. `inert`
         // tira o conteúdo do tab order e da árvore de acessibilidade.
         inert={!open}
         aria-hidden={!open}
         className="top-16 flex h-[calc(100dvh-4rem)] w-88 flex-col overflow-hidden p-0 lg:hidden"
      >
         <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-4 py-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
               <HiMenuAlt2 aria-hidden className="h-4 w-4" />
               Sessões da missão
            </h2>
            <button
               ref={closeRef}
               type="button"
               onClick={onClose}
               aria-label="Fechar painel de sessões"
               className="focus-visible:outline-primary-500 grid size-9 shrink-0 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-2"
            >
               <HiX className="h-5 w-5" />
            </button>
         </div>
         {open && <div className="min-h-0 flex-1">{children}</div>}
      </Drawer>,
      portalTarget
   );
}
