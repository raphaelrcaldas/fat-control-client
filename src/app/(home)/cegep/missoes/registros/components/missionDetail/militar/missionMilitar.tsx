import clsx from "clsx";
import { UserMission } from "services/routes/cegep/missoes";
import { FormMilitar } from "./formMilitar";
import { useState } from "react";
import { HiPencil, HiUserCircle } from "react-icons/hi2";

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

   const getSituacaoConfig = () => {
      switch (userMis.sit) {
         case "c":
            return {
               label: "Comissionado",
               bgColor: "bg-blue-50",
               borderColor: "border-blue-300",
               textColor: "text-blue-800",
               badgeColor: "bg-blue-500",
               hoverBg: "hover:bg-blue-100",
               hoverBorder: "hover:border-blue-400",
            };
         case "d":
            return {
               label: "Diária",
               bgColor: "bg-green-50",
               borderColor: "border-green-300",
               textColor: "text-green-800",
               badgeColor: "bg-green-500",
               hoverBg: "hover:bg-green-100",
               hoverBorder: "hover:border-green-400",
            };
         case "g":
            return {
               label: "Grat Rep",
               bgColor: "bg-orange-50",
               borderColor: "border-orange-300",
               textColor: "text-orange-800",
               badgeColor: "bg-orange-500",
               hoverBg: "hover:bg-orange-100",
               hoverBorder: "hover:border-orange-400",
            };
         default:
            return {
               label: "",
               bgColor: "bg-gray-50",
               borderColor: "border-gray-300",
               textColor: "text-gray-800",
               badgeColor: "bg-gray-500",
               hoverBg: "hover:bg-gray-100",
               hoverBorder: "hover:border-gray-400",
            };
      }
   };

   const config = getSituacaoConfig();

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
                  "transform hover:scale-[1.02]": edit,
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
               <div className={clsx("font-medium text-sm", config.textColor)}>
                  <span className='font-bold uppercase'>{userMis.p_g}</span>{" "}
                  <span>{userMis.user.nome_guerra}</span>
               </div>
            </div>
         </div>

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
