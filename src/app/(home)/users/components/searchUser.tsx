import {
   Modal,
   ModalHeader,
   ModalBody,
   TextInput,
   Button,
   Spinner,
} from "flowbite-react";
import { useState } from "react";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { HiOutlineUserGroup, HiExclamationCircle } from "react-icons/hi";
import { getUsers, UserPublic } from "services/routes/users";

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
   const [users, setUsers] = useState<UserPublic[]>([]);
   const [searchUser, setSearchUser] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [hasSearched, setHasSearched] = useState(false);
   const [error, setError] = useState<string | null>(null);

   async function searchUsers() {
      const searchData = searchUser.trim();
      if (searchData === "") {
         setError("Por favor, digite um nome para buscar");
         return;
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
         const response = await getUsers({ search: searchUser, per_page: 10 });
         setUsers(response.items);
      } catch (err) {
         setError("Erro ao buscar usuários. Tente novamente.");
         setUsers([]);
      } finally {
         setIsLoading(false);
      }
   }

   function onClose() {
      setSearchUser("");
      setUsers([]);
      setHasSearched(false);
      setError(null);
      setShow(false);
   }

   function onSetUser(user: UserPublic) {
      setUser(user);
      onClose();
   }

   return (
      <Modal size="md" show={show} onClose={onClose} dismissible>
         <ModalHeader>Buscar Militar</ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               <div>
                  <div className="flex flex-row gap-2">
                     <TextInput
                        placeholder="Insira o nome do militar"
                        className="flex-1"
                        value={searchUser}
                        onChange={(e) => {
                           setSearchUser(e.target.value);
                           if (error) setError(null);
                        }}
                        onKeyDown={(e) => {
                           if (
                              !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                              e.key !== "Backspace" &&
                              e.key !== "ArrowLeft" &&
                              e.key !== "ArrowRight" &&
                              e.key !== "Tab" &&
                              e.key !== "Delete" &&
                              e.key !== "Home" &&
                              e.key !== "End"
                           ) {
                              e.preventDefault();
                           }

                           if (e.key === "Enter") {
                              searchUsers();
                           }
                        }}
                        color={error ? "failure" : "gray"}
                        autoFocus
                     />
                     <Button
                        onClick={searchUsers}
                        disabled={isLoading}
                        color="red"
                        className="px-4"
                     >
                        {isLoading ? (
                           <Spinner size="sm" color="white" />
                        ) : (
                           <IoMdSearch className="size-5" />
                        )}
                     </Button>
                  </div>
                  {error && (
                     <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
                        <HiExclamationCircle className="size-4" />
                        <span>{error}</span>
                     </div>
                  )}
               </div>

               <div className="relative flex h-80 flex-col overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-4 transition-all duration-300">
                  {isLoading ? (
                     <div className="animate-in fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 duration-200">
                        <Spinner size="lg" />
                        <span className="text-sm text-gray-500">
                           Buscando militares...
                        </span>
                     </div>
                  ) : !hasSearched ? (
                     <div className="animate-in fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 duration-200">
                        <FaSearch className="size-12 opacity-30" />
                        <span className="text-center text-sm">
                           Digite o nome do militar e clique em buscar
                        </span>
                     </div>
                  ) : users.length === 0 ? (
                     <div className="animate-in fade-in absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400 duration-200">
                        <HiExclamationCircle className="size-12 opacity-30" />
                        <span className="text-center text-sm">
                           Nenhum militar encontrado com esse nome
                        </span>
                     </div>
                  ) : (
                     <div className="animate-in fade-in slide-in-from-top-0 space-y-1 duration-300">
                        <div className="sticky top-0 z-10 -mx-4 mb-3 flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600">
                           <HiOutlineUserGroup className="size-4" />
                           <span>
                              {users.length} militar
                              {users.length !== 1 ? "es" : ""} encontrado
                              {users.length !== 1 ? "s" : ""}
                           </span>
                        </div>
                        {users.map((user, index) => {
                           const isAlreadySelected = userIdsIgnr?.some(
                              (id) => id === user.id
                           );
                           return (
                              <div
                                 key={user.id}
                                 onClick={() =>
                                    !isAlreadySelected && onSetUser(user)
                                 }
                                 className={`group animate-in fade-in slide-in-from-left-1 flex flex-row items-center gap-3 rounded border-b border-gray-200 p-3 transition-colors duration-200 last:border-b-0 ${
                                    isAlreadySelected
                                       ? "cursor-not-allowed bg-gray-100 opacity-60"
                                       : "cursor-pointer hover:border-blue-200 hover:bg-blue-50"
                                 }`}
                                 style={{ animationDelay: `${index * 30}ms` }}
                                 role="button"
                                 tabIndex={isAlreadySelected ? -1 : 0}
                                 onKeyDown={(e) => {
                                    if (
                                       !isAlreadySelected &&
                                       (e.key === "Enter" || e.key === " ")
                                    ) {
                                       e.preventDefault();
                                       onSetUser(user);
                                    }
                                 }}
                              >
                                 <FaCheckCircle
                                    className={`size-5 shrink-0 ${
                                       isAlreadySelected
                                          ? "text-gray-400"
                                          : "text-red-500 group-hover:text-red-700"
                                    }`}
                                 />
                                 <span
                                    className={`flex-1 text-sm font-medium uppercase ${
                                       isAlreadySelected
                                          ? "text-gray-500"
                                          : "text-gray-700 group-hover:text-red-900"
                                    }`}
                                 >
                                    {user.posto.short} {user.esp}{" "}
                                    {user.nome_guerra}
                                 </span>
                                 {isAlreadySelected && (
                                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500">
                                       Já cadastrado
                                    </span>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  )}
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
