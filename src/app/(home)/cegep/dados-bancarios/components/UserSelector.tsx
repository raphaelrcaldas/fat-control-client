import { useState } from "react";
import Link from "next/link";
import { Button } from "flowbite-react";
import { HiExternalLink, HiUser } from "react-icons/hi";
import { UserPublic } from "services/routes/users";
import { SearchUser } from "@/app/(home)/users/components/searchUser";

interface UserSelectorProps {
   value: UserPublic | null;
   onChange: (user: UserPublic | null) => void;
   readOnly?: boolean;
   error?: string;
}

function UserCard({ user }: { user: UserPublic }) {
   return (
      <div className="uppercase">
         <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {user.posto.short} {user.nome_guerra}
         </p>
         <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.nome_completo}
         </p>
      </div>
   );
}

function OpenCadastroButton({ userId }: { userId: number }) {
   return (
      <Button
         as={Link}
         href={`/users/${userId}`}
         size="xs"
         color="light"
         title="Abrir cadastro do militar"
      >
         <HiExternalLink className="mr-1 h-4 w-4" />
         Cadastro
      </Button>
   );
}

export function UserSelector({
   value,
   onChange,
   readOnly = false,
   error,
}: UserSelectorProps) {
   const [showSearch, setShowSearch] = useState(false);

   if (readOnly) {
      return value ? (
         <div className="flex items-center justify-between rounded border border-slate-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700">
            <UserCard user={value} />
            <OpenCadastroButton userId={value.id} />
         </div>
      ) : null;
   }

   return (
      <div>
         <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Selecione o militar que terá os dados bancários cadastrados
         </p>

         {value ? (
            <div className="flex items-center justify-between rounded border border-slate-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-700">
               <UserCard user={value} />
               <div className="flex items-center gap-2">
                  <OpenCadastroButton userId={value.id} />
                  <Button size="xs" color="gray" onClick={() => onChange(null)}>
                     Alterar
                  </Button>
               </div>
            </div>
         ) : (
            <>
               <Button
                  color="primary"
                  className="w-full"
                  onClick={() => setShowSearch(true)}
               >
                  <HiUser className="mr-2" />
                  Selecionar Usuário
               </Button>
               {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </>
         )}

         <SearchUser
            show={showSearch}
            setShow={setShowSearch}
            setUser={onChange}
         />
      </div>
   );
}
