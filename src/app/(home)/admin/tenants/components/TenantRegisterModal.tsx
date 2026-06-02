"use client";

import { useState, useEffect } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Label,
   Select,
   Spinner,
} from "flowbite-react";
import type { Organizacao } from "services/routes/organizacoes";

interface TenantRegisterModalProps {
   show: boolean;
   /** Organizações do diretório que ainda não são tenants. */
   availableOrgs: Organizacao[];
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (organizacaoId: string) => void;
}

export function TenantRegisterModal({
   show,
   availableOrgs,
   isSaving,
   onClose,
   onSubmit,
}: TenantRegisterModalProps) {
   const [selectedOrg, setSelectedOrg] = useState<string>("");
   const [error, setError] = useState<string | undefined>();

   useEffect(() => {
      if (show) {
         setSelectedOrg("");
         setError(undefined);
      }
   }, [show]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedOrg === "") {
         setError("Selecione uma organização");
         return;
      }
      onSubmit(selectedOrg);
   };

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   return (
      <Modal show={show} onClose={handleClose} size="md">
         <ModalHeader>Registrar Tenant</ModalHeader>
         <form onSubmit={handleSubmit}>
            <ModalBody>
               <div className="space-y-2">
                  <Label htmlFor="tenant-org">Organização do diretório</Label>
                  <Select
                     id="tenant-org"
                     value={selectedOrg}
                     onChange={(e) => {
                        setSelectedOrg(e.target.value);
                        setError(undefined);
                     }}
                     color={error ? "failure" : undefined}
                  >
                     <option value="">Selecione uma organização...</option>
                     {availableOrgs.map((org) => (
                        <option key={org.sigla} value={org.sigla}>
                           {org.sigla.toUpperCase()} — {org.sigla_3}
                        </option>
                     ))}
                  </Select>
                  {error && (
                     <p className="text-sm text-red-600" role="alert">
                        {error}
                     </p>
                  )}
                  {availableOrgs.length === 0 && (
                     <p className="text-sm text-gray-500">
                        Todas as organizações já são tenants. Cadastre uma nova
                        organização no diretório para registrá-la.
                     </p>
                  )}
               </div>
            </ModalBody>
            <ModalFooter>
               <Button
                  type="submit"
                  color="blue"
                  disabled={isSaving || availableOrgs.length === 0}
               >
                  {isSaving ? (
                     <>
                        <Spinner color="info" size="sm" className="mr-2" />
                        Registrando...
                     </>
                  ) : (
                     "Registrar"
                  )}
               </Button>
               <Button color="gray" onClick={onClose} disabled={isSaving}>
                  Cancelar
               </Button>
            </ModalFooter>
         </form>
      </Modal>
   );
}
