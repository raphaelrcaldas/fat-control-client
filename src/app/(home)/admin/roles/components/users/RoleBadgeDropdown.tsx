import { memo, useState, useRef, useEffect } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import { getRoleTheme } from "../../config/roleThemes";

interface Role {
   id: number;
   name: string;
   description: string;
}

interface RoleBadgeDropdownProps {
   currentRole: Role;
   roles: Role[];
   onRoleChange: (roleId: string) => void;
   disabled?: boolean;
}

export const RoleBadgeDropdown = memo(function RoleBadgeDropdown({
   currentRole,
   roles,
   onRoleChange,
   disabled = false,
}: RoleBadgeDropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [openUpwards, setOpenUpwards] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const colors = getRoleTheme(currentRole.name);

   useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node)
         ) {
            setIsOpen(false);
         }
      }

      function checkDropdownPosition() {
         if (dropdownRef.current && isOpen) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 300;

            setOpenUpwards(spaceBelow < dropdownHeight);
         }
      }

      if (isOpen) {
         checkDropdownPosition();
         document.addEventListener("mousedown", handleClickOutside);
         return () =>
            document.removeEventListener("mousedown", handleClickOutside);
      }
   }, [isOpen]);

   const handleRoleSelect = (roleId: string) => {
      if (roleId !== String(currentRole.id)) {
         onRoleChange(roleId);
      }
      setIsOpen(false);
   };

   return (
      <div className="relative" ref={dropdownRef}>
         <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${colors.bg} ${colors.text} ${
               !disabled ? colors.hover : "cursor-not-allowed opacity-50"
            } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none`}
         >
            <span className="uppercase">{currentRole.name}</span>
            {!disabled && (
               <FaChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                     isOpen ? "rotate-180" : ""
                  }`}
               />
            )}
         </button>

         {isOpen && (
            <div
               className={`animate-in fade-in zoom-in-95 absolute z-50 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg duration-100 ${openUpwards ? "bottom-full mb-2" : "top-full mt-2"} `}
            >
               <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Selecionar Perfil
               </div>
               <div className="max-h-64 overflow-y-auto py-1">
                  {roles.map((role) => {
                     const isSelected = role.id === currentRole.id;
                     const roleColors = getRoleTheme(role.name);

                     return (
                        <button
                           key={role.id}
                           type="button"
                           onClick={() => handleRoleSelect(String(role.id))}
                           className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors duration-150 ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"} `}
                        >
                           <div className="flex items-center gap-2">
                              <span
                                 className={`rounded-full px-2 py-0.5 text-xs font-medium uppercase ${roleColors.bg} ${roleColors.text} `}
                              >
                                 {role.name}
                              </span>
                           </div>
                           {isSelected && (
                              <FaCheck className="h-3 w-3 shrink-0 text-blue-600" />
                           )}
                        </button>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
});
