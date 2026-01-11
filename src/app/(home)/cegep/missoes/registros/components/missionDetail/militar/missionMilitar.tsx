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
   simple = false,
}: {
   userMis: UserMission;
   edit?: boolean;
   mils?: UserMission[];
   simple?: boolean;
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
               "group relative flex items-center gap-3 rounded-xl border-2 px-2 py-1 shadow-sm transition-all duration-300 select-none",
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
            <div className="flex flex-1 gap-1">
               {!simple && (
                  <span
                     className={clsx(
                        "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
                        config.badgeColor,
                        "text-white"
                     )}
                  >
                     {userMis.sit}
                  </span>
               )}
               <div
                  className={clsx(
                     "flex items-center gap-1 text-xs font-medium uppercase",
                     config.textColor
                  )}
               >
                  <span className="font-bold">{userMis.p_g}</span>{" "}
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
