"use client";

import { GoPlus } from "react-icons/go";
import { Button } from "flowbite-react";
import { useState } from "react";
import { SearchUser as UserSearchModal } from "@/app/(home)/users/components/searchUser";
import { TripRegister } from "./tripRegister";
import { UserPublic } from "services/routes/users";
import { useTripUserIds } from "@/hooks/queries";

export function SearchUser() {
   const [showSearch, setShowSearch] = useState(false);
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
   const [showRegister, setShowRegister] = useState(false);

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
            color="red"
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
