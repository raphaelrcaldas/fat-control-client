"use client";

import { TextInput, Button } from "flowbite-react";
import React from "react";

type Props = {
   filterName: string;
   setFilterName: (v: string) => void;
   onAdd: () => void;
};

export default function UsersToolbar({
   filterName,
   setFilterName,
   onAdd,
}: Props) {
   return (
      <div className='bg-white p-3 rounded-lg shadow-sm flex flex-col lg:flex-row lg:items-center gap-3 my-4'>
         <div className='flex-1'>
            <TextInput
               className='w-full lg:w-2/3'
               placeholder='Buscar usuário...'
               value={filterName}
               onChange={(e) => setFilterName((e as any).target.value)}
            />
         </div>
         <div className='flex items-center justify-end'>
            <Button color='blue' onClick={onAdd} className='whitespace-nowrap'>
               Adicionar Usuário
            </Button>
         </div>
      </div>
   );
}
