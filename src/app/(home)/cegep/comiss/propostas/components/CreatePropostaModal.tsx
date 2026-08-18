"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   Select,
   Spinner,
   TextInput,
} from "flowbite-react";
import { useCreateProposta } from "@/hooks/queries/usePropostas";
import { useToast } from "@/app/context/toast";
import { getDefaultFiscalYear, getFiscalYears } from "../../fiscalYears";

interface CreatePropostaModalProps {
   show: boolean;
   /** Exercício já selecionado na lista — vira o default do formulário. */
   anoInicial?: number;
   /** Nome sugerido no placeholder (ex.: "Proposta 4"). */
   sugestaoNome: string;
   onClose: () => void;
   /** Recebe o id da proposta recém-criada (a lista navega para o sandbox). */
   onCreated: (id: number) => void;
}

/**
 * Criação de proposta: só nome e exercício de referência. Os cenários e as
 * linhas são montados depois, dentro do sandbox.
 */
export function CreatePropostaModal({
   show,
   anoInicial,
   sugestaoNome,
   onClose,
   onCreated,
}: CreatePropostaModalProps) {
   const { push } = useToast();
   const yearsRange = useMemo(() => getFiscalYears(), []);
   const anoPadrao = anoInicial ?? getDefaultFiscalYear();

   const [nome, setNome] = useState("");
   const [anoRef, setAnoRef] = useState<number>(anoPadrao);
   const [erroNome, setErroNome] = useState<string | null>(null);
   const nomeInputRef = useRef<HTMLInputElement>(null);

   const createMutation = useCreateProposta();
   const isSaving = createMutation.isPending;

   // Reabrir o modal recomeça o formulário do zero.
   useEffect(() => {
      if (show) {
         setNome("");
         setAnoRef(anoPadrao);
         setErroNome(null);
      }
   }, [show, anoPadrao]);

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const nomeLimpo = nome.trim();
      if (!nomeLimpo) {
         setErroNome("Informe um nome para a proposta.");
         return;
      }

      try {
         const result = await createMutation.mutateAsync({
            nome: nomeLimpo,
            ano_ref: anoRef,
         });
         if (result.data) onCreated(result.data.id);
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao criar a proposta";
         push({ title: "Erro", message, type: "error" });
      }
   }

   return (
      // `dismissible`: Esc e clique fora fecham (e é ele quem renderiza o X do
      // cabeçalho). O rótulo desse X é "Close", cravado no ModalHeader do
      // Flowbite 0.12.17 — não há prop para traduzi-lo; trocar exigiria mexer
      // no tema global de modal, fora do escopo desta tela.
      <Modal
         show={show}
         size="md"
         dismissible
         initialFocus={nomeInputRef}
         onClose={() => {
            if (!isSaving) onClose();
         }}
      >
         <ModalHeader>Nova Proposta</ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <Label htmlFor="proposta-nome" className="text-sm">
                     Nome
                  </Label>
                  <TextInput
                     id="proposta-nome"
                     ref={nomeInputRef}
                     className="mt-1"
                     value={nome}
                     /* Mesmo teto do schema (`nome: str max_length=120`). */
                     maxLength={120}
                     placeholder={sugestaoNome}
                     onChange={(e) => {
                        setNome(e.target.value);
                        if (erroNome) setErroNome(null);
                     }}
                  />
                  {erroNome && (
                     <p className="mt-1 text-sm text-red-600">{erroNome}</p>
                  )}
               </div>

               <div>
                  <Label htmlFor="proposta-ano" className="text-sm">
                     Exercício de referência
                  </Label>
                  <Select
                     id="proposta-ano"
                     className="mt-1"
                     value={anoRef}
                     onChange={(e) => setAnoRef(Number(e.target.value))}
                  >
                     {yearsRange.map((y) => (
                        <option key={y} value={y}>
                           {y}
                        </option>
                     ))}
                  </Select>
                  <p className="mt-1 text-xs text-slate-500">
                     Exercício aberto por padrão no sandbox — pode ser trocado
                     na comparação.
                  </p>
               </div>

               <div className="flex justify-end gap-2">
                  <Button color="light" onClick={onClose} disabled={isSaving}>
                     Cancelar
                  </Button>
                  <Button type="submit" color="primary" disabled={isSaving}>
                     {isSaving ? (
                        <>
                           <Spinner
                              size="sm"
                              color="primary"
                              className="mr-2"
                           />
                           Criando...
                        </>
                     ) : (
                        "Criar proposta"
                     )}
                  </Button>
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
