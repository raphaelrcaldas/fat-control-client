import { Button, Popover } from "flowbite-react";
import { isoDateToString } from "@/utils/dateHandler";

export function QuadPopover({ quad }) {
   let dateStr;
   let color;
   if (quad.value) {
      dateStr = isoDateToString(quad.value);
      color = "blue";
   } else {
      dateStr = "LASTRO";
      color = "info";
   }

   return (
      // <Popover
      //    aria-labelledby='default-popover'
      //    content={
      //       <div className='text-sm text-gray-500'>
      //          <div className='border-b border-gray-200 bg-gray-100 px-3 py-2'>
      //             <h3
      //                id='default-popover'
      //                className='font-semibold text-gray-900 text-center'
      //             >
      //                {dateStr}
      //             </h3>
      //          </div>
      //          <div className='px-3 py-2'>
      //             <p>{quad.description}</p>
      //          </div>
      //       </div>
      //    }
      // {/* </Popover> */}
      // >
         <Button pill color={color} className='text-center flex-shrink-0 w-[5rem] p-0'>
            <span>{ dateStr.slice(0,5)}</span>
         </Button>
   );
}
