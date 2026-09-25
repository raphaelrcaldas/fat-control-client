"use client";

import { useRef } from "react";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import type { RelatorioVoo } from "services/routes/estatistica/relatoriosVoo";
import { formatDiaSemana } from "utils/dateHandler";

interface Props {
   relatorio: RelatorioVoo;
   aberto: boolean;
   excluindo: boolean;
   onFechar: () => void;
   onConfirmar: () => void;
}

export function ExcluirRelatorioModal(props: Props) {
   const { relatorio } = props;
   const cancelarRef = useRef<HTMLButtonElement>(null);
   return (
      <Modal
         show={props.aberto}
         size="md"
         dismissible
         initialFocus={cancelarRef}
         onClose={props.onFechar}
      >
         <ModalHeader>Excluir relatório</ModalHeader>
         <ModalBody>
            <p className="text-sm text-slate-700">
               O relatório da{" "}
               <strong className="font-mono">{relatorio.anv}</strong> de{" "}
               {formatDiaSemana(relatorio.data)} será apagado do arquivo e do
               armazenamento. Isso não pode ser desfeito.
            </p>
         </ModalBody>
         <ModalFooter>
            <Button
               color="red"
               onClick={props.onConfirmar}
               disabled={props.excluindo}
            >
               {props.excluindo ? "Excluindo…" : "Excluir"}
            </Button>
            <Button ref={cancelarRef} color="light" onClick={props.onFechar}>
               Cancelar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
