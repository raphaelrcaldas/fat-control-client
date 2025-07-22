import { useState, useEffect } from "react";

interface DateTimePickerProps {
   value: string; // ISOString
   setValue: (val: string) => void;
   max?: string;
   min?: string;
}

export function DateTimePicker({
   value,
   setValue,
   max,
   min,
}: DateTimePickerProps) {
   const [date, setDate] = useState("");
   const [time, setTime] = useState("");

   useEffect(() => {
      if (value) {
         setDate(value.slice(0, 10));
         setTime(value.slice(11, 16));
      }
   }, [value]);

   function handleChange(newDate: string, newTime: string) {
      if (newDate && newTime) {
         setValue(`${newDate}T${newTime}:00`);
      } else {
         setValue("");
      }
   }

   return (
      <div className='flex flex-row gap-2'>
         <input
            className='bg-gray-50 border text-center border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2.5'
            type='date'
            value={date}
            min={min ? min.split("T")[0] : ""}
            max={max ? max.split("T")[0] : ""}
            onChange={(e) => {
               setDate(e.target.value);
               handleChange(e.target.value, time);
            }}
         />
         <div className='relative'>
            <div className='absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none'>
               <svg
                  className='w-4 h-4 text-gray-500 dark:text-gray-400'
                  aria-hidden='true'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='currentColor'
                  viewBox='0 0 24 24'
               >
                  <path
                     fillRule='evenodd'
                     d='M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z'
                     clipRule='evenodd'
                  />
               </svg>
            </div>
            <input
               type='time'
               className='bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-24 p-2.5'
               value={time}
               onChange={(e) => {
                  setTime(e.target.value);
                  handleChange(date, e.target.value);
               }}
            />
         </div>
      </div>
   );
}
