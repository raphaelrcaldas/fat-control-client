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
   /** Diretório de organizações ainda carregando */
   orgsLoading?: boolean;
   /** Diretório falhou: sem ele "Todas já são tenants" seria mentira */
   orgsError?: boolean;
   orgsFetching?: boolean;
   onRetryOrgs?: () => void;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (organizacaoId: string) => void;
}

export function TenantRegisterModal({
   show,
   availableOrgs,
   orgsLoading = false,
   orgsError = false,
   orgsFetching = false,
   onRetryOrgs,
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
                     disabled={orgsLoading}
                  >
                     <option value="">
                        {orgsLoading
                           ? "Carregando organizações…"
                           : "Selecione uma organização..."}
                     </option>
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
                  {orgsError && (
                     <p role="alert" className="text-sm text-red-600">
                        Não foi possível carregar as organizações do diretório.{" "}
                        {onRetryOrgs && (
                           <button
                              type="button"
                              onClick={onRetryOrgs}
                              disabled={orgsFetching}
                              className="min-h-[24px] font-semibold underline underline-offset-2 disabled:opacity-50"
                           >
                              Tentar novamente
                           </button>
                        )}
                     </p>
                  )}
                  {!orgsLoading && !orgsError && availableOrgs.length === 0 && (
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
                  color="dark"
                  disabled={
                     isSaving ||
                     orgsLoading ||
                     orgsError ||
                     availableOrgs.length === 0
                  }
                  aria-busy={isSaving}
               >
                  {isSaving ? (
                     <>
                        <Spinner color="white" size="sm" className="mr-2" />
                        Registrando…
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
