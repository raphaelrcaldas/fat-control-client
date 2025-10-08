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
            className={clsx(
               "px-2.5 py-0.5 rounded-lg select-none text-sm font-medium w-52",
               {
                  "cursor-pointer": edit,
                  "bg-blue-200": userMis.sit === "c",
                  "hover:bg-blue-300": userMis.sit === "c" && edit,
                  "bg-green-200": userMis.sit === "d",
                  "hover:bg-green-300": userMis.sit === "d" && edit,
                  "bg-orange-200": userMis.sit === "g",
                  "hover:bg-orange-300": userMis.sit === "g" && edit,
               }
            )}
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
