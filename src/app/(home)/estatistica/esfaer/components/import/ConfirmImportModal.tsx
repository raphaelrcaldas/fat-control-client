import { Modal, ModalBody, ModalHeader, Button, Spinner } from "flowbite-react";

interface ConfirmImportModalProps {
   show: boolean;
   anoRef: number;
   count: number;
   isPending: boolean;
   onConfirm: () => void;
   onCancel: () => void;
}

export function ConfirmImportModal({
   show,
   anoRef,
   count,
   isPending,
   onConfirm,
   onCancel,
}: ConfirmImportModalProps) {
   return (
      <Modal show={show} size="md" onClose={onCancel} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <h3 className="mb-2 text-lg font-semibold text-gray-800">
                  Confirmar importação
               </h3>
               <p className="mb-1 text-sm text-gray-600">
                  Deseja importar <span className="font-bold">{count}</span>{" "}
                  registro(s) para o ano{" "}
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800">
                     {anoRef}
                  </span>
                  ?
               </p>
               <p className="mb-5 text-xs text-gray-400">
                  Esta ação pode sobrescrever dados existentes.
               </p>
               <div className="flex justify-center gap-3">
                  <Button
                     color="green"
                     onClick={onConfirm}
                     disabled={isPending}
                  >
                     {isPending ? (
                        <>
                           <Spinner
                              size="sm"
                              color="failure"
                              className="mr-2"
                           />
                           Enviando...
                        </>
                     ) : (
                        "Confirmar"
                     )}
                  </Button>
                  <Button color="gray" onClick={onCancel} disabled={isPending}>
                     Cancelar
                  </Button>
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
