"use client";

import { GoPlus } from "react-icons/go";
import {
   Button,
   Modal,
   ModalBody,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableRow,
   TextInput,
} from "flowbite-react";
import { useState, useEffect } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { getUsers } from "services/routes/users";
import { TripRegister } from "./tripRegister";

export function SearchUser({ uae, trips, updateTrips }) {
   const [openAddTrip, setAddTrip] = useState(false);
   const [usersTrip, setUsersTrip] = useState([]);
   const [userSearchInput, setSearchInput] = useState("");

   async function searchUserForTrip() {
      function getTripFromUserID(userID) {
         return trips.filter((trip) => trip.user.id == userID);
      }

      if (userSearchInput.length > 0) {
         let users = await getUsers();

         // FILTRAR USUARIOS QUE NÃO SÃO TRIPULANTES
         users = users.filter((user) => {
            const search = getTripFromUserID(user.id);
            if (search.length > 0) {
               return false;
            } else {
               return true;
            }
         });

         // FILTRAR USUARIOS DE ACORDO COM O TEXT_INPUT
         users = users.filter((user) => {
            const filterInput = userSearchInput.toLowerCase();
            const guerra = user.nome_guerra.includes(filterInput);
            const completo = user.nome_completo.includes(filterInput);

            return guerra || completo;
         });

         setUsersTrip(users);
      } else {
         alert("Insira o nome do Usuário que deseja procurar");
      }
   }

   function closeTripRegister() {
      setSearchInput("");
      setUsersTrip([]);
      setAddTrip(false);
   }

   return (
      <>
         <Button color='blue' onClick={() => setAddTrip(true)}>
            <GoPlus className='mr-2 h-5 w-5' /> Adicionar
         </Button>

         {openAddTrip && (
            <Modal
               show={openAddTrip}
               size='md'
               onClose={closeTripRegister}
               popup
            >
               <ModalHeader />
               <ModalBody>
                  <h3 className='mb-7 text-xl text-center font-semibold'>
                     Adicionar Tripulante
                  </h3>
                  <div className='flex gap-2 justify-between'>
                     <TextInput
                        className='w-full'
                        placeholder='Nome de guerra'
                        value={userSearchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                     />
                     <Button color='blue' onClick={searchUserForTrip}>
                        <IoSearchSharp className='size-5' />
                     </Button>
                  </div>
                  <div className='mt-8 overflow shadow-lg h-72 bg-gray-100 rounded-lg'>
                     <Table hoverable>
                        <TableBody>
                           {usersTrip.map((user) => {
                              const pg = user.posto.short;
                              const esp = user.esp;
                              const guerra = user.nome_guerra;

                              return (
                                 <TableRow
                                    className='hover:font-semibold'
                                    key={user.id}
                                 >
                                    <TableCell className='text-center uppercase'>
                                       {`${pg} ${esp} ${guerra}`}
                                    </TableCell>
                                    <TableCell className='w-20'>
                                       <TripRegister
                                          user={user}
                                          uae={uae}
                                          update={updateTrips}
                                       />
                                    </TableCell>
                                 </TableRow>
                              );
                           })}
                        </TableBody>
                     </Table>
                  </div>
               </ModalBody>
            </Modal>
         )}
      </>
   );
}
