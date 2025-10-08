import { isoDateToString } from "utils/dateHandler";

export function QuadPopover({ quad }) {
   let dateStr;
   let color;
   if (quad.value) {
      dateStr = isoDateToString(quad.value);
      color = "bg-blue-600 hover:bg-blue-800";
   } else {
      dateStr = "LASTRO";
      color = "bg-slate-500 hover:bg-slate-700";
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
      <button
         type='button'
         className={`text-white font-medium text-center flex-shrink-0 text-sm rounded-lg size-8 md:w-[65px] md:h-9 ${color}`}
      >
         <span className='hidden md:grid'>{dateStr}</span>
      </button>

      // <Button color={color} className='text-center flex-shrink-0 size-8 md:w-[90px] md:h-9 p-0'>
      //    <span className="hidden md:flex">{ dateStr}</span>
      // </Button>
   );
}
