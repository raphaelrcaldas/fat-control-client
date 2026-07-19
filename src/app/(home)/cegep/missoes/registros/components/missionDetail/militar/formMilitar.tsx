import {
   Modal,
   ModalBody,
   ModalHeader,
   Button,
   Label,
   Select,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import {
   HiUserCircle,
   HiTrash,
   HiCheckCircle,
   HiXCircle,
} from "react-icons/hi2";
import { useState, useMemo, useEffect } from "react";
import { SearchUser } from "../../../../../../users/components/searchUser";
import { UserMission } from "services/routes/cegep/missoes";
import { DeleteMilitarModal } from "./deleteMilitarModal";
import { ValidationModal } from "../../../../components/ValidationModal";
import { postoGradRecords } from "services/routes/postos";

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
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [validationErrors, setValidationErrors] = useState<string[]>([]);
   // Valores padrões do militar
   const defaultValues = useMemo(
      () => ({
         pgMis: userMis ? userMis.p_g : "",
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
      if (user && !pgMis) {
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
      setPgMis("");
      setSit("");
      setShow(false);
   }

   interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}
   function handleSubmit(e: HandleSubmitEvent): void {
      e.preventDefault();

      const errors: string[] = [];
      if (!user) errors.push("- Selecione um militar");
      if (!pgMis) errors.push("- Selecione o posto/graduação");
      if (!sit) errors.push("- Selecione a situação");

      if (errors.length > 0) {
         setValidationErrors(errors);
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

   function handleDeleteClick() {
      setShowDeleteModal(true);
   }

   function onConfirmDelete() {
      if (userMis) {
         setMils(mils.filter((mil) => mil.user.id !== userMis.user.id));
         onClose();
      }
   }

   return (
      <Modal size="lg" show={show} onClose={() => setShow(false)} dismissible>
         <ModalHeader className="border-b border-slate-200">
            <div className="flex items-center gap-3">
               <div className="bg-primary-100 rounded-md p-2 shadow-sm">
                  <HiUserCircle className="text-primary-600 h-6 w-6" />
               </div>
               <span className="text-xl font-semibold text-gray-800">
                  {userMis ? "Editar Militar" : "Adicionar Militar"}
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
               {/* Card de Seleção do Militar */}
               <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
                  <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                           <HiUserCircle className="text-primary-600 h-5 w-5" />
                           Militar Selecionado
                        </Label>
                        <Button
                           pill
                           color="primary"
                           onClick={() => setShowUserSearch(true)}
                           size="sm"
                        >
                           <IoMdSearch className="mr-2 h-4 w-4" />
                           Buscar
                        </Button>
                     </div>

                     <div className="flex items-center justify-center p-2">
                        {user ? (
                           <div className="border-primary-200 rounded border bg-white px-6 py-3 shadow-sm">
                              <span className="text-base font-semibold text-gray-800 uppercase">
                                 <span className="text-primary-600">
                                    {user.p_g}
                                 </span>{" "}
                                 <span className="text-gray-500">
                                    {user.esp}
                                 </span>{" "}
                                 <span>{user.nome_guerra}</span>
                              </span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-2 text-red-500">
                              <HiXCircle className="h-5 w-5" />
                              <span className="text-sm font-medium">
                                 Nenhum militar selecionado
                              </span>
                           </div>
                        )}
                     </div>
                  </div>

                  <SearchUser
                     show={showUserSearch}
                     setShow={setShowUserSearch}
                     setUser={setUser}
                     userIdsIgnr={userIDsIgnr}
                  />
               </div>

               {/* Grid de Campos */}
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Posto/Graduação */}
                  <div className="flex flex-col gap-2">
                     <Label className="text-sm font-semibold text-gray-700">
                        Posto/Graduação
                     </Label>
                     <Select
                        value={pgMis}
                        onChange={(e) => setPgMis(e.target.value)}
                     >
                        <option value="" disabled>
                           Selecione...
                        </option>
                        {postoGradRecords.map((p) => (
                           <option key={p.short} value={p.short}>
                              {p.short.toUpperCase()}
                           </option>
                        ))}
                     </Select>
                     <span className="-mt-1 mb-1 text-xs text-gray-500">
                        Posto/Graduação que o militar estava no dia da missão
                     </span>
                  </div>

                  {/* Situação */}
                  <div className="flex flex-col gap-2">
                     <Label className="text-sm font-semibold text-gray-700">
                        Situação
                     </Label>
                     <Select
                        value={sit}
                        onChange={(e) => setSit(e.target.value)}
                     >
                        <option disabled value="">
                           Selecione...
                        </option>
                        <option value="c">Comissionado</option>
                        <option value="d">Diária</option>
                        <option value="g">Grat Rep</option>
                     </Select>
                  </div>
               </div>

               {/* Botões de Ação */}
               <div className="mt-4 flex justify-center gap-3 border-t border-slate-200 pt-6">
                  {userMis && (
                     <Button
                        color="red"
                        onClick={handleDeleteClick}
                        className="min-w-32"
                     >
                        <HiTrash className="mr-2 h-4 w-4" />
                        Excluir
                     </Button>
                  )}
                  <Button
                     type="submit"
                     color="green"
                     disabled={!isChanged}
                     className="min-w-32"
                  >
                     <HiCheckCircle className="mr-2 h-4 w-4" />
                     Salvar
                  </Button>
               </div>
            </form>
         </ModalBody>

         <ValidationModal
            show={validationErrors.length > 0}
            errors={validationErrors}
            onClose={() => setValidationErrors([])}
         />

         {/* Modal de Confirmação de Exclusão */}
         {userMis && (
            <DeleteMilitarModal
               show={showDeleteModal}
               setShow={setShowDeleteModal}
               userMis={userMis}
               onConfirm={onConfirmDelete}
            />
         )}
      </Modal>
   );
}
