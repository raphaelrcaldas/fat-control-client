"use client";

import type { ComponentType } from "react";
import { Button, Spinner } from "flowbite-react";
import {
   HiX,
   HiArrowLeft,
   HiPencil,
   HiBan,
   HiCheckCircle,
   HiSave,
} from "react-icons/hi";
import clsx from "clsx";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import {
   STATUS_CONFIG,
   getStatusTransitions,
   type StatusType,
} from "@/constants/ops/ordens-missao/status";

interface OrdemFormHeaderProps {
   title: string;
   isNew: boolean;
   isCloning: boolean;
   ordemIdentificacao: string;
   ordemBasedIdentificacao: string;
   status: string;
   isReadOnlyMode: boolean;
   isEditable: boolean;
   hasChanges: boolean;
   hasCamposEspeciaisVazios: boolean;
   isSaving: boolean;
   isApproving: boolean;
   isCancelling: boolean;
   onClose: () => void;
   onToggleReadOnly: () => void;
   onCancelEdit: () => void;
   onApprove: () => void;
   onCancelOm: () => void;
}

// Botão de transição de status (Aprovar/Cancelar OM) com divisor e spinner —
// mesmo markup nos modos leitura e edição
function LifecycleButton({
   onClick,
   disabled,
   busy,
   busyLabel,
   icon: Icon,
   label,
}: {
   onClick: () => void;
   disabled: boolean;
   busy: boolean;
   busyLabel: string;
   icon: ComponentType<{ className?: string; size?: number }>;
   label: string;
}) {
   return (
      <div className="flex items-center gap-3">
         <div className="hidden h-8 w-px bg-gray-300 md:block" />
         <Button
            color="red"
            type="button"
            onClick={onClick}
            disabled={disabled}
         >
            {busy ? (
               <>
                  <Spinner color="primary" size="sm" className="sm:mr-2" />
                  <span className="hidden sm:inline">{busyLabel}</span>
               </>
            ) : (
               <>
                  <Icon className="sm:mr-2" size={16} />
                  <span className="hidden sm:inline">{label}</span>
               </>
            )}
         </Button>
      </div>
   );
}

// Cabeçalho fixo do formulário de OM: voltar, título/identificação, badge de
// status e as ações de edição e de ciclo de vida (máquina de estados)
export function OrdemFormHeader({
   title,
   isNew,
   isCloning,
   ordemIdentificacao,
   ordemBasedIdentificacao,
   status,
   isReadOnlyMode,
   isEditable,
   hasChanges,
   hasCamposEspeciaisVazios,
   isSaving,
   isApproving,
   isCancelling,
   onClose,
   onToggleReadOnly,
   onCancelEdit,
   onApprove,
   onCancelOm,
}: OrdemFormHeaderProps) {
   // Ações de ciclo de vida disponíveis para o status atual (máquina de estados)
   const transicoesStatus = getStatusTransitions(status);
   const statusCfg = STATUS_CONFIG[status as StatusType];

   return (
      <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
         <div className="flex min-w-0 flex-1 items-center gap-4">
            <button
               onClick={onClose}
               className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
               title="Voltar"
            >
               <HiArrowLeft size={24} />
            </button>
            <div className="hidden min-w-0 md:block">
               <h1 className="truncate text-xl font-semibold text-gray-900">
                  {title} Ordem de Missão
               </h1>
               {!isNew && !isCloning && ordemIdentificacao && (
                  <p className="truncate font-mono text-sm text-gray-500 uppercase">
                     {ordemIdentificacao}
                  </p>
               )}
               {isCloning && ordemBasedIdentificacao && (
                  <p className="truncate text-sm text-gray-500">
                     Baseado em:{" "}
                     <span className="font-mono uppercase">
                        {ordemBasedIdentificacao}
                     </span>
                  </p>
               )}
            </div>
         </div>

         {/* Badge de status do objeto centralizado */}
         {statusCfg && (
            <div className="hidden flex-1 justify-center md:flex">
               <span
                  className={clsx(
                     "rounded-full border px-3 py-1.5 text-xs font-bold tracking-wider uppercase",
                     statusCfg.bg,
                     statusCfg.text,
                     statusCfg.border
                  )}
               >
                  {statusCfg.label}
               </span>
            </div>
         )}

         <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
            {isReadOnlyMode && (
               <>
                  {status !== "cancelada" && (
                     <PermBased
                        resource={"ordem_missao"}
                        requiredPerm={"update"}
                     >
                        <Button color="light" onClick={onToggleReadOnly}>
                           <HiPencil className="sm:mr-2" size={16} />
                           <span className="hidden sm:inline">Editar</span>
                        </Button>
                     </PermBased>
                  )}
                  {/* Zona de ciclo de vida: transições derivadas do status */}
                  {transicoesStatus.includes("aprovar") && (
                     <PermBased
                        resource={"ordem_missao.status"}
                        requiredPerm={"update"}
                     >
                        <LifecycleButton
                           onClick={onApprove}
                           disabled={isApproving}
                           busy={isApproving}
                           busyLabel="Aprovando..."
                           icon={HiCheckCircle}
                           label="Aprovar OM"
                        />
                     </PermBased>
                  )}
                  {transicoesStatus.includes("cancelar") && (
                     <PermBased
                        resource={"ordem_missao.status"}
                        requiredPerm={"update"}
                     >
                        <LifecycleButton
                           onClick={onCancelOm}
                           disabled={isCancelling}
                           busy={isCancelling}
                           busyLabel="Cancelando..."
                           icon={HiBan}
                           label="Cancelar OM"
                        />
                     </PermBased>
                  )}
               </>
            )}

            {isEditable && (
               <>
                  {/* "Descartar alterações" só aparece quando há mudanças reais.
                     Sem mudanças, numa OM existente o botão vira "Cancelar" (apenas
                     sai do modo de edição, sem confirmação). Numa OM nova/clonada sem
                     mudanças não há nada a descartar — sair é pelo botão voltar do
                     cabeçalho. */}
                  {(hasChanges || (!isNew && !isCloning)) && (
                     <Button
                        color="gray"
                        onClick={onCancelEdit}
                        disabled={isSaving || isApproving}
                     >
                        <HiX className="sm:mr-2" size={16} />
                        <span className="hidden sm:inline">
                           {hasChanges ? "Descartar alterações" : "Cancelar"}
                        </span>
                     </Button>
                  )}
                  <Button
                     color="light"
                     type="submit"
                     form="ordem-form"
                     disabled={
                        !hasChanges ||
                        hasCamposEspeciaisVazios ||
                        isSaving ||
                        isApproving
                     }
                  >
                     {isSaving ? (
                        <>
                           <Spinner
                              color="primary"
                              size="sm"
                              className="sm:mr-2"
                           />
                           <span className="hidden sm:inline">Salvando...</span>
                        </>
                     ) : (
                        <>
                           <HiSave className="sm:mr-2" size={16} />
                           <span className="hidden sm:inline">Salvar</span>
                        </>
                     )}
                  </Button>
                  {/* Zona de ciclo de vida: transições derivadas do status */}
                  {!isCloning && transicoesStatus.includes("aprovar") && (
                     <PermBased
                        resource={"ordem_missao.status"}
                        requiredPerm={"update"}
                     >
                        <LifecycleButton
                           onClick={onApprove}
                           disabled={
                              hasCamposEspeciaisVazios ||
                              isSaving ||
                              isApproving
                           }
                           busy={isApproving}
                           busyLabel="Aprovando..."
                           icon={HiCheckCircle}
                           label="Aprovar OM"
                        />
                     </PermBased>
                  )}
               </>
            )}
         </div>
      </header>
   );
}
