"use client";

import { Modal, ModalBody, ModalHeader } from "flowbite-react";

interface Props {
   show: boolean;
   onClose: () => void;
   /** Título da lista — "Etapas associadas", "Militares envolvidos"… */
   titulo: string;
   /** Nome da operação: aberto, o modal cobre o dossiê e o contexto se perde. */
   contexto: string;
   /** Busca, filtros e a ação de escrita. */
   ferramentas?: React.ReactNode;
   /** Resumo do recorte, ancorado no rodapé. */
   rodape?: React.ReactNode;
   children: React.ReactNode;
}

/**
 * Moldura das listas completas da operação.
 *
 * O dossiê é leitura e resume; a lista inteira, a busca, os filtros e as ações
 * de escrita vivem aqui. Concentrar o trabalho num formato só é o que evita os
 * três dialetos de filtro que a tela tinha — um por aba.
 *
 * A altura é fixa em `85vh` para o corpo rolar internamente: com 218 etapas, um
 * modal que cresce com o conteúdo empurra o rodapé (Σ do recorte) para fora da
 * janela justamente quando a lista é longa.
 */
export function ListaModal({
   show,
   onClose,
   titulo,
   contexto,
   ferramentas,
   rodape,
   children,
}: Props) {
   return (
      <Modal
         show={show}
         onClose={onClose}
         size="5xl"
         dismissible
         theme={{
            root: { sizes: { "5xl": "max-w-5xl" } },
            content: {
               inner: "relative flex max-h-[85vh] flex-col rounded bg-white shadow",
            },
         }}
      >
         <ModalHeader
            theme={{
               base: "flex shrink-0 items-start justify-between rounded-t border-b border-slate-200 p-4",
               title: "text-base font-bold text-slate-900",
            }}
         >
            <span className="block text-base font-bold text-slate-900">
               {titulo}
            </span>
            <span className="mt-0.5 block text-xs font-normal text-slate-500">
               {contexto}
            </span>
         </ModalHeader>

         {ferramentas}

         <ModalBody className="flex-1 overflow-y-auto p-0">
            {children}
         </ModalBody>

         {rodape && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 tabular-nums">
               {rodape}
            </div>
         )}
      </Modal>
   );
}

/** Faixa de ferramentas do modal — fica entre o cabeçalho e a lista. */
export function ModalTools({ children }: { children: React.ReactNode }) {
   return (
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
         {children}
      </div>
   );
}

/**
 * Um grupo de filtro: rótulo + segmentado.
 *
 * Ocupa a linha inteira porque o rótulo não pode se separar do controle a que
 * pertence — com dois grupos numa linha só, o segundo rótulo órfão sobra no fim
 * da primeira linha.
 */
export function FiltroGrupo({
   label,
   children,
}: {
   label: string;
   children: React.ReactNode;
}) {
   return (
      <div className="flex w-full min-w-0 items-center gap-2">
         <span className="w-14 shrink-0 font-mono text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase">
            {label}
         </span>
         <div className="min-w-0 overflow-x-auto">{children}</div>
      </div>
   );
}
