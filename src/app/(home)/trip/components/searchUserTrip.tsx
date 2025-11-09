"use client";

import { GoPlus } from "react-icons/go";
import { Button } from "flowbite-react";
import { useState } from "react";
import { SearchUser as UserSearchModal } from "../../users/components/searchUser";
import { TripRegister } from "./tripRegister";
import { UserPublic } from "services/routes/users";

export function SearchUser({ uae, trips, updateTrips }) {
   const [showSearch, setShowSearch] = useState(false);
   const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
   const [showRegister, setShowRegister] = useState(false);

   // IDs dos usuários que já são tripulantes (para ignorar na busca)
   const tripUserIds = trips.map((trip) => trip.user.id);

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
         <Button color='blue' onClick={() => setShowSearch(true)}>
            <GoPlus className='mr-2 h-5 w-5' /> Adicionar
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
               uae={uae}
               update={updateTrips}
               show={showRegister}
               onClose={handleRegisterClose}
            />
         )}
      </>
   );
}
