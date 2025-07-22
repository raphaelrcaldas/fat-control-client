import {
   Modal,
   ModalHeader,
   ModalBody,
   TextInput,
   Button,
} from "flowbite-react";
import { useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { getUsers, UserPublic } from "services/routes/users";
import { UserMission } from "services/routes/cegep/missoes";

export function SearchUser({
   show,
   setShow,
   setUser,
   setPgMis,
   mils,
}: {
   show: boolean;
   setShow: (show: boolean) => void;
   setUser: (user: UserPublic) => void;
   setPgMis: (pg: string) => void;
   mils: UserMission[];
}) {
   const [users, setUsers] = useState<UserPublic[]>([]);
   const [searchUser, setSearchUser] = useState("");

   function searchUsers() {
      const searchData = searchUser.trim();
      if (searchData != "") {
         getUsers(searchUser).then((data) => {
            const filterData = data.filter(
               (user) => !mils.some((mil) => mil.user.id === user.id)
            );
            setUsers(filterData);
         });
      }
   }

   function onClose() {
      setSearchUser("");
      setUsers([]);
      setShow(false);
   }

   function onSetUser(user: UserPublic) {
      setPgMis(user.p_g);
      setUser(user);
      onClose();
   }

   return (
      <Modal size='md' show={show} onClose={() => setShow(false)}>
         <ModalHeader>Buscar Militar</ModalHeader>
         <ModalBody>
            <div>
               <div className='justify-evenly flex flex-row'>
                  <TextInput
                     placeholder='Insira o nome do militar'
                     className='w-2/3'
                     value={searchUser}
                     onChange={(e) => setSearchUser(e.target.value)}
                     onKeyDown={(e) => {
                        if (
                           !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                           e.key !== "Backspace" &&
                           e.key !== "Tab"
                        ) {
                           e.preventDefault();
                        }
                     }}
                  />
                  <Button onClick={searchUsers} color='light'>
                     <IoMdSearch className='size-5' />
                  </Button>
               </div>

               <div className='flex flex-col mt-2 p-2 bg-slate-100 min-h-40 rounded-lg'>
                  {users.length == 0 ? (
                     <span className='w-full text-center'>
                        Nenhum resultado encontrado
                     </span>
                  ) : (
                     users.map((user, index) => {
                        return (
                           <div
                              key={index}
                              className='flex flex-row p-1 gap-2 items-center border-b hover:bg-slate-200 hover:font-medium'
                           >
                              <FaCheckSquare
                                 onClick={() => onSetUser(user)}
                                 className='size-7 text-blue-400 hover:text-blue-600 cursor-pointer'
                              />
                              <span className='p-1 uppercase text-base'>
                                 {user.p_g} {user.nome_guerra}
                              </span>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
