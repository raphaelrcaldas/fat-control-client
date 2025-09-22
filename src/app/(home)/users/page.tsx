"use client";

import { Spinner } from "flowbite-react";
import { useState, useEffect } from "react";
import useDebouncedValue from "./hooks/useDebouncedValue";
import useUsers from "./hooks/useUsers";
import UsersToolbar from "./components/UsersToolbar";
import UsersTable from "./components/UsersTable";
import { UserRegister } from "./components/userForm";
import { useToast } from "../../../context/toast";

export default function UsersPage() {
   const { push } = useToast();
   const { usuarios, updateListUsers, loading } = useUsers();

   const [filterName, setFilterName] = useState("");
   const debouncedFilter = useDebouncedValue(filterName, 220);

   const [showUserModal, setShowUserModal] = useState(false);
   const [userId, setUserId] = useState<number | null>(null);

   const handleUserForm = (id?: number | null) => {
      setUserId(id ?? null);
      setShowUserModal(true);
   };

   useEffect(() => {
      const ac = new AbortController();
      updateListUsers(ac.signal, (msg: string) =>
         push({ message: msg, type: "error" })
      );
      return () => ac.abort();
   }, []);

   const filteredUsers = ((): any[] => {
      const input = debouncedFilter.trim().toLowerCase();
      if (!input) return usuarios;
      return usuarios.filter((user) => {
         const nomeCompleto = (user.nome_completo || "").toLowerCase();
         const nomeGuerra = (user.nome_guerra || "").toLowerCase();
         return nomeCompleto.includes(input) || nomeGuerra.includes(input);
      });
   })();

   return (
      <>
         <UserRegister
            userId={userId}
            updateUsers={() => updateListUsers()}
            show={showUserModal}
            setShow={setShowUserModal}
         />

         <div className='w-full h-full'>
            <UsersToolbar
               filterName={filterName}
               setFilterName={setFilterName}
               onAdd={() => handleUserForm(null)}
            />

            {loading ? (
               <div className='flex justify-center items-center h-40'>
                  <Spinner size='xl' />
               </div>
            ) : (
               <UsersTable
                  users={filteredUsers}
                  onOpen={(id?: number) => handleUserForm(id)}
               />
            )}
         </div>
      </>
   );
}
