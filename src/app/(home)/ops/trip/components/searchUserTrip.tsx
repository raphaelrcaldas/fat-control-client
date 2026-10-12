"use client";

import { GoPlus } from "react-icons/go";
import { Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { SearchUser as UserSearchModal } from "@/app/(home)/users/components/searchUser";
import { TripRegister } from "./tripRegister";
import { UserPublic } from "services/routes/users";
import { useTripUserIds } from "@/hooks/queries";

interface SearchUserProps {
   onOpenChange?: (open: boolean) => void;
}

export function SearchUser({ onOpenChange }: SearchUserProps) {
   const [showSearch, setShowSearch] = useState(false);
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
   const [showRegister, setShowRegister] = useState(false);

   // Avisa a pagina quando um dos modais abre: a barra do carrinho precisa
   // sumir, senao fica escurecida sob o backdrop e alcancavel pelo Tab.
   useEffect(() => {
      onOpenChange?.(showSearch || showRegister);
   }, [showSearch, showRegister, onOpenChange]);

   // IDs de todos os usuários que já são tripulantes (ativos e inativos)
   const { data: tripUserIds = [] } = useTripUserIds();

   function handleUserSelected(user: UserPublic) {
      setSelectedUser(user);
      setShowRegister(true);
   }

   function handleRegisterClose() {
      setShowRegister(false);
      setSelectedUser(null);
   }

   return (
      <>
         <Button
            color="primary"
            className="font-semibold"
            onClick={() => setShowSearch(true)}
         >
            <GoPlus className="mr-2 h-5 w-5" /> Adicionar
         </Button>

         <UserSearchModal
            show={showSearch}
            setShow={setShowSearch}
            setUser={handleUserSelected}
            userIdsIgnr={tripUserIds}
         />

         {selectedUser && (
            <TripRegister
               user={selectedUser}
               show={showRegister}
               onClose={handleRegisterClose}
            />
         )}
      </>
   );
}
