import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
} from "flowbite-react";
import { FaExclamationTriangle } from "react-icons/fa";

interface ValidationModalProps {
   show: boolean;
   errors: string[];
   onClose: () => void;
}

export function ValidationModal({
   show,
   errors,
   onClose,
}: ValidationModalProps) {
   return (
      <Modal show={show} onClose={onClose} size="md" dismissible>
         <ModalHeader className="border-b border-amber-200 bg-linear-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
               <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-300 bg-amber-100">
                  <FaExclamationTriangle className="text-xl text-amber-600" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-amber-900">
                     Validação de Campos
                  </h3>
                  <p className="text-sm text-amber-700">
                     Alguns campos precisam ser corrigidos
                  </p>
               </div>
            </div>
         </ModalHeader>
         <ModalBody className="py-6">
            <div className="space-y-3">
               <p className="mb-4 text-sm font-medium text-slate-700">
                  Por favor, verifique os seguintes itens:
               </p>
               <div className="space-y-2">
                  {errors.map((error, index) => (
                     <div
                        key={index}
                        className="flex items-start gap-3 rounded border border-amber-200 bg-amber-50 p-3"
                     >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
                           <span className="text-xs font-bold text-amber-700">
                              {index + 1}
                           </span>
                        </div>
                        <p className="flex-1 text-sm leading-relaxed text-slate-700">
                           {error.replace(/^- /, "")}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         </ModalBody>
         <ModalFooter className="border-t border-slate-200 bg-slate-50">
            <Button
               color="blue"
               onClick={onClose}
               className="w-full font-semibold"
            >
               Entendi
            </Button>
         </ModalFooter>
      </Modal>
   );
}
