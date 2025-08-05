import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Label,
   Select,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { useState, useMemo, useEffect } from "react";
import { SearchUser } from "../../../../../../users/components/searchUser";
import { UserMission } from "services/routes/cegep/missoes";

type FormMilitarProps = {
   show: boolean;
   setShow: (show: boolean) => void;
   userMis?: UserMission | null;
   mils: UserMission[];
   setMils: (mils: UserMission[]) => void;
};

export function FormMilitar({
   show,
   setShow,
   userMis,
   mils,
   setMils,
}: FormMilitarProps) {
   const [showUserSearch, setShowUserSearch] = useState(false);
   // Valores padrões do militar
   const defaultValues = useMemo(
      () => ({
         pgMis: userMis ? userMis.p_g : null,
         user: userMis ? userMis.user : null,
         sit: userMis ? userMis.sit : "",
      }),
      [userMis]
   );

   const [pgMis, setPgMis] = useState(defaultValues.pgMis);
   const [user, setUser] = useState(defaultValues.user);
   const [sit, setSit] = useState(defaultValues.sit);

   const userIDsIgnr = mils.map((mil) => mil.user_id);

   useEffect(() => {
      if (user) {
         setPgMis(user.p_g);
      }
   }, [user]);

   // Verifica se houve alteração em relação aos valores padrões
   const isChanged =
      pgMis !== defaultValues.pgMis ||
      (user && defaultValues.user
         ? user.id !== defaultValues.user.id
         : user !== defaultValues.user) ||
      sit !== defaultValues.sit;

   function onClose() {
      setUser(null);
      setPgMis(null);
      setSit("");
      setShow(false);
   }

   interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}
   function handleSubmit(e: HandleSubmitEvent): void {
      e.preventDefault();

      let errors = [];
      if (!user) errors.push("- Selecione um militar");
      if (!sit) errors.push("- Selecione a situação");

      if (errors.length > 0) {
         alert("Preencha corretamente:\n" + errors.join("\n"));
         return;
      }

      onSave();
   }

   function onSave() {
      const newUserMis: UserMission = {
         sit: sit,
         p_g: pgMis,
         user_id: user.id,
         user: user,
      };

      if (userMis) {
         setMils(
            mils.map((mil) =>
               mil.user.id === userMis.user.id ? newUserMis : mil
            )
         );
      } else {
         setMils([...mils, newUserMis]);
      }
      onClose();
   }

   function onDelete() {
      if (userMis && confirm("Confirma Exclusão do Militar?")) {
         setMils(mils.filter((mil) => mil.user.id !== userMis.user.id));
         onClose();
      }
   }

   return (
      <Modal size='md' show={show} onClose={() => setShow(false)}>
         <ModalHeader>Militar</ModalHeader>
         <ModalBody>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
               <div className='bg-slate-100 p-2 rounded-lg flex flex-col justify-center items-center'>
                  <div className='flex flex-row gap-2 p-2 mt-4 justify-center items-center text-base'>
                     {user ? (
                        <span className='uppercase font-medium bg-white shadow-md px-4 py-1 rounded-lg'>
                           {pgMis} {user.nome_guerra}
                        </span>
                     ) : (
                        <span className='text-red-600 text-sm'>
                           Insira uma Militar
                        </span>
                     )}

                     <Button
                        pill
                        onClick={() => setShowUserSearch(true)}
                        color='light'
                     >
                        <IoMdSearch className='size-5' />
                     </Button>
                  </div>

                  <div className='grid justify-items-center'>
                     <Label>Situação</Label>
                     <Select
                        className='mt-1'
                        value={sit}
                        onChange={(e) => setSit(e.target.value)}
                     >
                        <option disabled value=''></option>
                        <option value='c'>Comissionado</option>
                        <option value='d'>Diária</option>
                        <option value='g'>Grat Rep</option>
                     </Select>
                  </div>

                  <SearchUser
                     show={showUserSearch}
                     setShow={setShowUserSearch}
                     setUser={setUser}
                     userIdsIgnr={userIDsIgnr}
                  />
               </div>

               <div className='flex gap-3 mt-4 justify-center'>
                  <Button className='w-28' type='submit' disabled={!isChanged}>
                     Salvar
                  </Button>

                  {userMis && (
                     <Button
                        onClick={onDelete}
                        className='w-28'
                        color='failure'
                     >
                        Excluir
                     </Button>
                  )}
               </div>
            </form>
         </ModalBody>
      </Modal>
   );
}
