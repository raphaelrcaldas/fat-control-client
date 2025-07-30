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
               "bg-blue-200 hover:bg-blue-300": userMis.sit === "c",
               "bg-green-200 hover:bg-green-300": userMis.sit === "d",
               "bg-orange-200 hover:bg-orange-300": userMis.sit === "g",
            })}
            onClick={handleClick}
         >
            {userMis.sit} | {userMis.p_g} {userMis.user.nome_guerra}
         </span>

         {showUserForm && (
            <FormMilitar
               show={showUserForm}
               setShow={setShowUserForm}
               userMis={userMis}
               mils={mils}
               setMils={setMils}
            />
         )}
      </>
   );
}
