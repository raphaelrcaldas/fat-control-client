"use client";

import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { useEsfAerImport, hasChanges } from "../../hooks/useEsfAerImport";
import { ImportInputPanel } from "./ImportInputPanel";
import { ConfirmImportModal } from "./ConfirmImportModal";
import { ImportNoChangesModal } from "./ImportNoChangesModal";
import { ImportResultModal } from "./ImportResultModal";

interface ImportModalProps {
   show: boolean;
   setShow: (v: boolean) => void;
   anoRef: number;
}

export function ImportModal({ show, setShow, anoRef }: ImportModalProps) {
   const {
      rawText,
      setRawText,
      parsedRows,
      errors,
      showConfirm,
      setShowConfirm,
      importResult,
      setImportResult,
      isPending,
      reset,
      parse,
      confirmSend,
   } = useEsfAerImport(anoRef);

   const handleClose = () => {
      if (showConfirm || isPending) return;
      setShow(false);
      reset();
   };

   const handleConfirm = async () => {
      const ok = await confirmSend();
      if (ok) setShow(false);
   };

   const resultHasChanges = !!importResult && hasChanges(importResult);

   return (
      <>
         <Modal
            show={show}
            size="7xl"
            onClose={handleClose}
            dismissible={!showConfirm && !isPending}
         >
            <ModalHeader>
               Importar Esforço Aéreo —{" "}
               <span className="bg-primary-100 text-primary-800 rounded px-2 py-0.5 font-bold">
                  {anoRef}
               </span>
            </ModalHeader>
            <ModalBody>
               <ImportInputPanel
                  rawText={rawText}
                  onRawTextChange={setRawText}
                  parsedRows={parsedRows}
                  errors={errors}
                  onParse={parse}
                  onSend={() => setShowConfirm(true)}
               />
            </ModalBody>
         </Modal>

         <ConfirmImportModal
            show={showConfirm}
            anoRef={anoRef}
            count={parsedRows.length}
            isPending={isPending}
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
         />

         <ImportNoChangesModal
            show={!!importResult && !resultHasChanges}
            anoRef={importResult?.ano_ref}
            onClose={() => setImportResult(null)}
         />

         <ImportResultModal
            result={resultHasChanges ? importResult : null}
            onClose={() => setImportResult(null)}
         />
      </>
   );
}
