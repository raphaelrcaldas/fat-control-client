import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
} from "flowbite-react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ValidationModalProps {
   show: boolean;
   errors: string[];
   onClose: () => void;
}

/** Resumo dos problemas que acompanha as mensagens inline dos campos. */
export function ValidationModal({
   show,
   errors,
   onClose,
}: ValidationModalProps) {
   return (
      <Modal show={show} onClose={onClose} size="md" dismissible>
         <ModalHeader className="border-b border-amber-200 bg-linear-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
               <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full border-2 border-amber-300 bg-amber-100">
                  <FaExclamationTriangle className="text-xl text-amber-600" />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-amber-900">
                     Validação de campos
                  </h2>
                  <p className="text-sm text-amber-700">
                     Alguns campos precisam ser corrigidos
                  </p>
               </div>
            </div>
         </ModalHeader>

         <ModalBody className="py-6">
            <div className="space-y-3">
               <p className="text-sm font-medium text-slate-700">
                  Verifique os seguintes itens:
               </p>
               <div className="space-y-2">
                  {errors.map((error, index) => (
                     <div
                        key={`${error}-${index}`}
                        className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 p-3"
                     >
                        <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-amber-100">
                           <span className="text-xs font-bold text-amber-700">
                              {index + 1}
                           </span>
                        </div>
                        <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-700">
                           {error.replace(/^- /, "")}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </ModalBody>

         <ModalFooter className="border-t border-slate-200 bg-slate-50">
            <Button color="primary" onClick={onClose} className="w-full">
               Entendi
            </Button>
         </ModalFooter>
      </Modal>
   );
}
