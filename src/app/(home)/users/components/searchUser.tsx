import {
   Modal,
   ModalHeader,
   ModalBody,
   TextInput,
   Spinner,
} from "flowbite-react";
import { useMemo, useState } from "react";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { HiOutlineUserGroup, HiExclamationCircle } from "react-icons/hi";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { useUserSearch } from "@/hooks/queries";
import type { UserPublic } from "services/routes/users";

const MIN_CHARS = 2;

export function SearchUser({
   show,
   setShow,
   setUser,
   userIdsIgnr,
}: {
   show: boolean;
   setShow: (show: boolean) => void;
   setUser: (user: UserPublic) => void;
   userIdsIgnr?: number[];
}) {
   const [query, setQuery] = useState("");
   const debounced = useDebouncedValue(query, 350);
   const term = debounced.trim();
   const hasQuery = term.length >= MIN_CHARS;

   const { data, isFetching, isError } = useUserSearch(term);

   // Disponíveis primeiro, já cadastrados ao fim.
   const users = useMemo(() => {
      const items = data?.items ?? [];
      if (!userIdsIgnr?.length) return items;
      const ignr = new Set(userIdsIgnr);
      return [
         ...items.filter((u) => !ignr.has(u.id)),
         ...items.filter((u) => ignr.has(u.id)),
      ];
   }, [data, userIdsIgnr]);

   const loading = isFetching && hasQuery;

   function onClose() {
      setQuery("");
      setShow(false);
   }

   function onSetUser(user: UserPublic) {
      setUser(user);
      onClose();
   }

   return (
      <Modal size="lg" show={show} onClose={onClose} dismissible>
         <ModalHeader>Buscar Militar</ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               {/* Campo de busca — busca automática conforme digita */}
               <div className="relative">
                  <TextInput
                     icon={IoMdSearch}
                     placeholder="Digite o nome do militar"
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     onKeyDown={(e) => {
                        if (
                           e.key.length === 1 &&
                           !e.key.match(/[a-zA-ZÀ-ÿ\s]/)
                        ) {
                           e.preventDefault();
                        }
                     }}
                     autoFocus
                     autoComplete="off"
                  />
                  {loading && (
                     <div className="absolute inset-y-0 right-3 flex items-center">
                        <Spinner size="sm" color="primary" />
                     </div>
                  )}
               </div>

               {/* Painel de resultados */}
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
                     <SearchUserSkeleton />
                  ) : users.length === 0 ? (
                     <EmptyState
                        icon={
                           <HiExclamationCircle className="size-10 opacity-25" />
                        }
                        text="Nenhum militar encontrado com esse nome"
                     />
                  ) : (
                     <div
                        className={`transition-opacity duration-200 ${
                           isFetching ? "opacity-50" : "opacity-100"
                        }`}
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
                              const disabled = userIdsIgnr?.includes(user.id);
                              return (
                                 <li key={user.id}>
                                    <button
                                       type="button"
                                       disabled={disabled}
                                       onClick={() => onSetUser(user)}
                                       className="group enabled:hover:bg-primary-50 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                       <FaCheckCircle
                                          className={`size-4 shrink-0 ${
                                             disabled
                                                ? "text-slate-300"
                                                : "text-primary-500 group-hover:text-primary-700"
                                          }`}
                                       />
                                       <span className="group-hover:text-primary-900 flex-1 text-sm font-medium text-slate-700 uppercase">
                                          {user.posto.short} {user.quadro}{" "}
                                          {user.esp} {user.nome_guerra}
                                       </span>
                                       {disabled && (
                                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                                             Já cadastrado
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
            </div>
         </ModalBody>
      </Modal>
   );
}

// Larguras fixas para variar as linhas sem flicker/hydration mismatch.
const SKELETON_WIDTHS = ["w-48", "w-40", "w-56", "w-44", "w-52", "w-36"];

/** Skeleton que espelha a lista de resultados (header de contagem + linhas). */
function SearchUserSkeleton() {
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
                     className={`h-3.5 animate-pulse rounded bg-slate-200 ${w}`}
                  />
               </li>
            ))}
         </ul>
      </div>
   );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
   return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-slate-400">
         {icon}
         <span className="text-sm">{text}</span>
      </div>
   );
}
