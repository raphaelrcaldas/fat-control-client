import clsx from "clsx";
import { UserMission } from "services/routes/cegep/missoes";
import { FormMilitar } from "./formMilitar";
import { useState } from "react";
import { useSituacaoConfig } from "../../useSituacaoConfig";

export function MissionMilitar({
   userMis,
   edit = false,
   mils,
   setMils,
}: {
   userMis: UserMission;
   edit?: boolean;
   mils?: UserMission[];
   setMils?: (mils: UserMission[]) => void;
}) {
   const [showUserForm, setShowUserForm] = useState(false);
   const config = useSituacaoConfig(userMis.sit);

   function handleClick() {
      if (edit) {
         setShowUserForm(true);
      }
   }

   return (
      <>
         <div
            className={clsx(
               "group relative flex items-center gap-3 px-2 py-1 rounded-xl border-2 transition-all duration-300 select-none shadow-sm",
               config.bgColor,
               config.borderColor,
               {
                  "cursor-pointer": edit,
                  [config.hoverBg]: edit,
                  [config.hoverBorder]: edit,
                  "hover:shadow-md": edit,
               }
            )}
            onClick={handleClick}
         >
            {/* Informações do militar */}
            <div className='flex-1 flex gap-1'>
               <div className='flex items-center gap-2'>
                  <span
                     className={clsx(
                        "text-xs font-semibold uppercase px-2 py-0.5 rounded-md",
                        config.badgeColor,
                        "text-white"
                     )}
                  >
                     {userMis.sit}
                  </span>
               </div>
               <div
                  className={clsx(
                     "flex font-medium items-center text-xs gap-1 uppercase",
                     config.textColor
                  )}
               >
                  <span className='font-bold'>{userMis.p_g}</span>{" "}
                  <span>{userMis.user.nome_guerra}</span>
               </div>
            </div>
         </div>

         {showUserForm && mils && setMils && (
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
