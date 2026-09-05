"use client";

import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { HiOutlineTrash } from "react-icons/hi";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ClearCartButtonProps {
   count: number;
   onConfirm: () => void;
   label: string;
   /** Substantivo do dominio, para a confirmacao nao dizer "itens". */
   noun: { one: string; many: string };
   withIcon?: boolean;
   /**
    * Avisa quando a confirmacao abre e fecha. Quem hospeda este botao dentro
    * do proprio dialogo precisa saber: o `Modal` do flowbite-react 0.12.17
    * renderiza via portal no `<body>`, entao ele fica FORA de qualquer cerca
    * de foco do hospedeiro (ver `useDialogFocus`).
    */
   onOpenChange?: (open: boolean) => void;
}

/**
 * Botao de esvaziar o carrinho, sempre com confirmacao.
 *
 * A confirmacao nao e cerimonia: a selecao pode ter levado varias paginas
 * para ser montada, o botao fica a dois botoes de distancia do "Exportar" com
 * o mesmo tamanho e a mesma cor, e nao ha desfazer. Um clique errado apagaria
 * exatamente aquilo que a feature existe para preservar.
 *
 * Mora aqui, e nao em cada chamador, porque a barra e a gaveta oferecem a
 * mesma acao e o texto tem que ser o mesmo nas duas.
 */
export function ClearCartButton({
   count,
   onConfirm,
   label,
   noun,
   withIcon = false,
   onOpenChange,
}: ClearCartButtonProps) {
   const [confirming, setConfirming] = useState(false);

   const alternar = (aberto: boolean) => {
      setConfirming(aberto);
      onOpenChange?.(aberto);
   };

   /**
    * Esc fecha a confirmacao.
    *
    * O `Modal` do flowbite-react 0.12.17 so escuta Esc com `dismissible`
    * (`useDismiss(..., { enabled: dismissible })`), e `dismissible` liga junto
    * o fechar-ao-clicar-fora — que numa confirmacao destrutiva e o clique
    * errado mais facil de dar. Dai o Esc a mao, sem o resto do pacote.
    */
   useEffect(() => {
      if (!confirming) return;
      const onKey = (e: KeyboardEvent) => {
         if (e.key !== "Escape") return;
         // Nao deixa o Esc chegar a quem hospeda este botao (a gaveta), que
         // fecharia por baixo e deixaria a confirmacao orfa.
         e.stopPropagation();
         alternar(false);
      };
      document.addEventListener("keydown", onKey, true);
      return () => document.removeEventListener("keydown", onKey, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [confirming]);

   return (
      <>
         <Button
            color="light"
            size="sm"
            onClick={() => alternar(true)}
            disabled={count === 0}
         >
            {withIcon && <HiOutlineTrash className="mr-1.5 h-4 w-4" />}
            {label}
         </Button>

         <ConfirmModal
            show={confirming}
            title="Limpar seleção"
            description={
               <>
                  Isto remove{" "}
                  <span className="font-semibold text-slate-900">{count}</span>{" "}
                  {count === 1 ? noun.one : noun.many} do carrinho, inclusive os
                  que foram marcados em outras páginas. Não há como desfazer.
               </>
            }
            confirmButtonText="Limpar tudo"
            onClose={() => alternar(false)}
            onConfirm={() => {
               onConfirm();
               alternar(false);
            }}
         />
      </>
   );
}
