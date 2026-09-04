"use client";

import { useState } from "react";
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
}: ClearCartButtonProps) {
   const [confirming, setConfirming] = useState(false);

   return (
      <>
         <Button
            color="light"
            size="sm"
            onClick={() => setConfirming(true)}
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
            onClose={() => setConfirming(false)}
            onConfirm={() => {
               onConfirm();
               setConfirming(false);
            }}
         />
      </>
   );
}
