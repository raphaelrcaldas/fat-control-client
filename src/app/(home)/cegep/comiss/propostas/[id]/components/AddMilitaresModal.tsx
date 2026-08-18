"use client";

import { useRef, useState } from "react";
import {
   Modal,
   ModalBody,
   ModalHeader,
   Spinner,
   TextInput,
} from "flowbite-react";
import clsx from "clsx";
import { FaCheckCircle, FaRegCircle, FaSearch } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { HiExclamationCircle, HiOutlineUserGroup } from "react-icons/hi";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useUserSearch } from "@/hooks/queries";
import type { UserPublic } from "services/routes/users";

const MIN_CHARS = 2;

interface AddMilitaresModalProps {
   show: boolean;
   onClose: () => void;
   /** Militares já presentes no cenário ativo. */
   selecionadosIds: Set<number>;
   /** Alterna o militar no cenário; o modal permanece aberto. */
   onToggle: (user: UserPublic, selecionado: boolean) => void;
   /**
    * Militar cuja remuneração está sendo buscada. Entrar no cenário é
    * assíncrono (a linha nasce com o valor real do militar), então o item
    * precisa mostrar que a ação está em curso.
    */
   buscandoRemunId: number | null;
   /** Militares com comissionamento aberto — avisa, não bloqueia. */
   conflitosIds: Set<number>;
   cenarioNome: string;
}

/**
 * Busca e alterna militares no cenário. Diferente do `SearchUser` comum, aqui
 * o modal fica aberto: montar um cenário é adicionar vários de uma vez.
 */
export function AddMilitaresModal({
   show,
   onClose,
   selecionadosIds,
   onToggle,
   buscandoRemunId,
   conflitosIds,
   cenarioNome,
}: AddMilitaresModalProps) {
   const [query, setQuery] = useState("");
   const searchInputRef = useRef<HTMLInputElement>(null);
   const debounced = useDebouncedValue(query, 350);
   const term = debounced.trim();
   const hasQuery = term.length >= MIN_CHARS;

   const { data, isFetching, isError } = useUserSearch(term);
   const users = data?.items ?? [];
   const loading = isFetching && hasQuery;

   function fechar() {
      setQuery("");
      onClose();
   }

   return (
      <Modal
         size="lg"
         show={show}
         onClose={fechar}
         dismissible
         initialFocus={searchInputRef}
      >
         <ModalHeader>Adicionar militares · {cenarioNome}</ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               <div className="relative">
                  <TextInput
                     ref={searchInputRef}
                     icon={IoMdSearch}
                     placeholder="Digite o nome do militar"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     autoComplete="off"
                  />
                  {loading && (
                     <div className="absolute inset-y-0 right-3 flex items-center">
                        <Spinner size="sm" color="primary" />
                     </div>
                  )}
               </div>

               <div className="h-80 overflow-y-auto rounded border border-slate-200 bg-slate-50">
                  {!hasQuery ? (
                     <EmptyState
                        icon={<FaSearch className="size-10 opacity-25" />}
                        text={`Digite ao menos ${MIN_CHARS} letras para buscar`}
                     />
                  ) : isError ? (
                     <EmptyState
                        icon={
                           <HiExclamationCircle className="size-10 text-red-400" />
                        }
                        text="Erro ao buscar militares. Tente novamente."
                     />
                  ) : loading && users.length === 0 ? (
                     <ResultadosSkeleton />
                  ) : users.length === 0 ? (
                     <EmptyState
                        icon={
                           <HiExclamationCircle className="size-10 opacity-25" />
                        }
                        text="Nenhum militar encontrado com esse nome"
                     />
                  ) : (
                     <div
                        className={clsx(
                           "transition-opacity duration-200",
                           isFetching ? "opacity-50" : "opacity-100"
                        )}
                     >
                        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
                           <HiOutlineUserGroup className="size-4" />
                           <span>
                              {users.length} militar
                              {users.length !== 1 ? "es" : ""} encontrado
                              {users.length !== 1 ? "s" : ""}
                           </span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                           {users.map((user) => {
                              const selecionado = selecionadosIds.has(user.id);
                              const buscando = buscandoRemunId === user.id;
                              return (
                                 <li key={user.id}>
                                    <button
                                       type="button"
                                       aria-pressed={selecionado}
                                       aria-busy={buscando}
                                       // Só o item em voo espera: travar a
                                       // lista inteira contraria o próprio
                                       // propósito do modal (adicionar vários)
                                       // e, se o botão travado for o que tem
                                       // foco, o `disabled` joga o foco no
                                       // body e o leitor de tela perde o lugar.
                                       aria-disabled={buscando}
                                       onClick={() => {
                                          if (buscando) return;
                                          onToggle(user, !selecionado);
                                       }}
                                       className={clsx(
                                          "group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                                          buscando && "cursor-wait",
                                          selecionado
                                             ? "bg-primary-50"
                                             : "hover:bg-primary-50/50"
                                       )}
                                    >
                                       {buscando ? (
                                          <>
                                             <Spinner
                                                size="sm"
                                                color="primary"
                                                className="size-4 shrink-0"
                                             />
                                             <span className="sr-only">
                                                Buscando remuneração
                                             </span>
                                          </>
                                       ) : selecionado ? (
                                          <FaCheckCircle className="text-primary-600 size-4 shrink-0" />
                                       ) : (
                                          <FaRegCircle className="size-4 shrink-0 text-slate-300" />
                                       )}
                                       <span className="group-hover:text-primary-900 flex-1 text-sm font-medium text-slate-700 uppercase">
                                          {user.p_g} {user.quadro} {user.esp}{" "}
                                          {user.nome_guerra}
                                       </span>
                                       {conflitosIds.has(user.id) && (
                                          <span
                                             title="Já possui comissionamento aberto"
                                             className="rounded-full bg-amber-100 px-2 py-0.5 text-xs leading-4 font-bold tracking-wide text-amber-800 uppercase"
                                          >
                                             Comiss. aberto
                                          </span>
                                       )}
                                    </button>
                                 </li>
                              );
                           })}
                        </ul>
                     </div>
                  )}
               </div>

               <p className="text-xs text-slate-500">
                  {selecionadosIds.size} militar
                  {selecionadosIds.size !== 1 ? "es" : ""} em {cenarioNome}. As
                  linhas nascem com a remuneração cadastrada do militar — ajuste
                  valores e exercícios clicando na linha da tabela.
               </p>
            </div>
         </ModalBody>
      </Modal>
   );
}

// Larguras fixas para variar as linhas sem flicker/hydration mismatch.
const SKELETON_WIDTHS = ["w-48", "w-40", "w-56", "w-44", "w-52", "w-36"];

function ResultadosSkeleton() {
   return (
      <div>
         <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
            <div className="size-4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
         </div>
         <ul className="divide-y divide-slate-100">
            {SKELETON_WIDTHS.map((w, i) => (
               <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="size-4 shrink-0 animate-pulse rounded-full bg-slate-200" />
                  <div
                     className={clsx(
                        "h-3.5 animate-pulse rounded bg-slate-200",
                        w
                     )}
                  />
               </li>
            ))}
         </ul>
      </div>
   );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
   return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-slate-500">
         {icon}
         <span className="text-sm">{text}</span>
      </div>
   );
}
