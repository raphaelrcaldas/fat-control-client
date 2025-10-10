import { isoDateToString } from "utils/dateHandler";
import clsx from "clsx";

export function QuadPopover({ quad }) {
   return (
      <button
         type='button'
         className={clsx(
            `text-white font-medium text-center flex-shrink-0 text-sm rounded-md size-8 md:w-[65px] md:h-9`,
            {
               "bg-blue-600 hover:bg-blue-800": quad.value,
               "bg-slate-500 hover:bg-slate-700": !quad.value,
            }
         )}
      >
         <span className='hidden md:grid'>
            {quad.value ? isoDateToString(quad.value) : "LASTRO"}
         </span>
      </button>
   );
}
