import { Modal, ModalBody, ModalHeader, Button } from "flowbite-react";

interface ImportNoChangesModalProps {
   show: boolean;
   anoRef: number | undefined;
   onClose: () => void;
}

export function ImportNoChangesModal({
   show,
   anoRef,
   onClose,
}: ImportNoChangesModalProps) {
   return (
      <Modal show={show} size="md" onClose={onClose} popup>
         <ModalHeader />
         <ModalBody>
            <div className="text-center">
               <div className="mx-auto my-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100">
                  <svg
                     className="h-7 w-7 text-emerald-600"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                     />
                  </svg>
               </div>
               <h3 className="mb-1 text-lg font-bold text-gray-900">
                  Importação concluída
               </h3>
               <p className="mb-4 text-sm text-gray-500">
                  As horas alocadas para{" "}
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                     {anoRef}
                  </span>{" "}
                  já estão atualizadas — nenhuma alteração necessária.
               </p>
               <div className="mx-auto mb-5 flex items-start gap-2.5 rounded border border-blue-200 bg-blue-50 px-3 py-2.5 text-left">
                  <svg
                     className="mt-0.5 h-4 w-4 shrink-0 text-blue-500"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                     />
                  </svg>
                  <p className="text-xs leading-relaxed text-blue-700">
                     Apenas os meses voados (SAGEM) foram atualizados.
                  </p>
               </div>
               <Button color="gray" className="mx-auto" onClick={onClose}>
                  Entendido
               </Button>
            </div>
         </ModalBody>
      </Modal>
   );
}
