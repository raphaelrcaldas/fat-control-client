import clsx from "clsx";
import { UserMission } from "services/routes/cegep/missoes";
import { FormMilitar } from "./formMilitar";
import { useState } from "react";

export function MissionMilitar({
   userMis,
   edit,
   mils,
   setMils,
}: {
   userMis: UserMission;
   edit: boolean;
   mils: UserMission[];
   setMils: (mils: UserMission[]) => void;
}) {
   const [showUserForm, setShowUserForm] = useState(false);
   const [user, setUser] = useState(userMis);

   function handleClick() {
      if (edit) {
         setShowUserForm(true);
      }
   }

   return (
      <>
         <span
            className={clsx("px-2.5 rounded-lg select-none font-medium", {
               "cursor-pointer": edit,
               "bg-orange-300 hover:bg-orange-400": userMis.sit === "c",
               "bg-blue-300 hover:bg-blue-400": userMis.sit === "d",
               "bg-red-400 hover:bg-red-400": userMis.sit === "g",
            })}
            onClick={handleClick}
         >
            {userMis.sit} | {userMis.p_g} {userMis.user.nome_guerra}
         </span>

         {showUserForm && (
            <FormMilitar
               show={showUserForm}
               setShow={setShowUserForm}
               userMis={user}
               mils={mils}
               setMils={setMils}
            />
         )}
      </>
   );
}
