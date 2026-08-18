"use client";

import { useMemo } from "react";
import { Button, Label, Select, Spinner } from "flowbite-react";
import clsx from "clsx";
import { FaSave } from "react-icons/fa";
import { HiArrowLeft } from "react-icons/hi";
import { ComissSubheader } from "../../../components/ComissSubheader";
import { getFiscalYears } from "../../../fiscalYears";
import { InlineNameInput } from "./InlineNameInput";

interface SandboxSubheaderProps {
   nome: string;
   onRename: (nome: string) => void;
   /** Exercício em análise (pode diferir do `ano_ref` da proposta). */
   ano: number;
   anoRef: number;
   onAnoChange: (ano: number) => void;
   isDirty: boolean;
   isSaving: boolean;
   onSave: () => void;
   /**
    * Navegação para fora do sandbox. Sempre pela página, que é quem sabe se há
    * rascunho pendente e mostra a confirmação de saída.
    */
   onNavigate: (href: string) => void;
   /** `comiss.propostas:update`. Sem ela o sandbox é só de leitura. */
   podeEditar: boolean;
}

const VOLTAR_HREF = "/cegep/comiss?tab=propostas";

/**
 * Faixa de contexto e ações do sandbox: identidade da proposta (nome editável),
 * exercício em análise, atalho para o teto e o botão de salvar.
 */
export function SandboxSubheader({
   nome,
   onRename,
   ano,
   anoRef,
   onAnoChange,
   isDirty,
   isSaving,
   onSave,
   onNavigate,
   podeEditar,
}: SandboxSubheaderProps) {
   const anos = useMemo(() => getFiscalYears(), []);

   return (
      <ComissSubheader
         actions={
            <>
               <div className="flex items-center gap-2">
                  <Label
                     htmlFor="sandbox-exercicio"
                     className="text-sm text-slate-600"
                  >
                     Exercício
                  </Label>
                  <Select
                     id="sandbox-exercicio"
                     sizing="sm"
                     value={ano}
                     onChange={(e) => onAnoChange(Number(e.target.value))}
                     className="min-w-28"
                  >
                     {anos.map((y) => (
                        <option key={y} value={y}>
                           {y}
                        </option>
                     ))}
                  </Select>
               </div>

               {podeEditar && (
                  <Button
                     size="sm"
                     color="primary"
                     onClick={onSave}
                     disabled={!isDirty || isSaving}
                     title={
                        isDirty
                           ? "Salvar as alterações da proposta"
                           : "Nenhuma alteração pendente"
                     }
                  >
                     {isSaving ? (
                        <span className="flex items-center gap-2">
                           <Spinner size="sm" color="primary" />
                           Salvando…
                        </span>
                     ) : (
                        <>
                           <FaSave className="mr-2 h-4 w-4" />
                           Salvar
                        </>
                     )}
                  </Button>
               )}
            </>
         }
      >
         {/* Coluna flex com gap: o breadcrumb encostava no título. */}
         <div className="flex min-w-0 flex-col items-start gap-2">
            <button
               type="button"
               onClick={() => onNavigate(VOLTAR_HREF)}
               className="text-primary-700 inline-flex items-center gap-1 text-xs leading-4 font-medium hover:underline"
            >
               <HiArrowLeft aria-hidden className="h-3.5 w-3.5" />
               Propostas
            </button>

            {/* Título da tela: o editor inline mora dentro do h1 — em modo
                leitura vira texto, para não convidar a uma edição que não
                pode ser gravada. */}
            <h1 className="max-w-full min-w-0">
               {podeEditar ? (
                  <InlineNameInput
                     value={nome}
                     onCommit={onRename}
                     ariaLabel="Nome da proposta"
                     /* Mesmo teto do schema (`nome: str max_length=120`). */
                     maxLength={120}
                  />
               ) : (
                  <span className="block truncate text-lg font-semibold text-slate-900">
                     {nome}
                  </span>
               )}
            </h1>

            {!podeEditar && (
               <p className="text-sm text-slate-500">
                  Somente leitura — você não tem permissão para alterar
                  propostas.
               </p>
            )}

            {/* Linha de estado: só aparece quando há o que dizer — o exercício
                da proposta já está no seletor ao lado. */}
            {(ano !== anoRef || isDirty) && (
               <p className="text-sm text-slate-500">
                  {ano !== anoRef && `Analisando ${ano}`}
                  {isDirty && (
                     <span
                        className={clsx(
                           "font-medium text-amber-600",
                           ano !== anoRef && "ml-2"
                        )}
                     >
                        alterações não salvas
                     </span>
                  )}
               </p>
            )}
         </div>
      </ComissSubheader>
   );
}
