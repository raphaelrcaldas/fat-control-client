"use client";

import { Spinner } from "flowbite-react";

export default function TestSpinner() {
   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
         <div className="text-center">
            <h1 className="text-2xl font-bold mb-8">Teste do Spinner</h1>

            <div className="mb-8">
               <Spinner size="xl" />
               <p className="mt-4 text-sm text-gray-600">Spinner XL do Flowbite</p>
            </div>

            <div className="mb-8">
               <Spinner size="lg" />
               <p className="mt-4 text-sm text-gray-600">Spinner LG do Flowbite</p>
            </div>

            <div className="mb-8">
               <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
               <p className="mt-4 text-sm text-gray-600">Spinner Tailwind Puro</p>
            </div>
         </div>
      </div>
   );
}
