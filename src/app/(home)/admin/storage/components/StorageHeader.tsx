"use client";

import { Badge, Button } from "flowbite-react";
import { MdStorage } from "react-icons/md";
import { HiRefresh } from "react-icons/hi";
import clsx from "clsx";

interface StorageHeaderProps {
   bucketCount?: number;
   lastUpdated?: number;
   isFetching: boolean;
   onRefresh: () => void;
}

export function StorageHeader({
   bucketCount,
   lastUpdated,
   isFetching,
   onRefresh,
}: StorageHeaderProps) {
   const updatedAt = lastUpdated
      ? new Date(lastUpdated).toLocaleTimeString("pt-BR", {
           hour: "2-digit",
           minute: "2-digit",
        })
      : null;
   const buckets =
      bucketCount === undefined
         ? null
         : `${bucketCount} ${bucketCount === 1 ? "bucket" : "buckets"}`;

   return (
      <header className="relative overflow-hidden rounded border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-5">
         {/* Espinha neutra — escopo de admin de sistema, sem cor de marca */}
         <span
            aria-hidden
            className="absolute top-0 left-0 h-full w-1 bg-slate-600"
         />

         <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
               <div className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 ring-1 ring-slate-200 ring-inset sm:size-12">
                  <MdStorage className="size-5 sm:size-6" />
               </div>
               <div className="min-w-0">
                  <span className="block font-mono text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
                     Administração
                  </span>
                  <h1 className="text-2xl leading-none font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
                     Storage
                  </h1>
                  {/* No mobile esta linha é o único indicador de volume e
                      frescor — o Badge só aparece a partir de sm */}
                  <span className="mt-0.5 block truncate text-sm text-gray-500">
                     {buckets && <span className="sm:hidden">{buckets}</span>}
                     {updatedAt && (
                        <>
                           {buckets && <span className="sm:hidden"> · </span>}
                           atualizado às {updatedAt}
                        </>
                     )}
                  </span>
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
               {buckets && (
                  <Badge color="gray" size="lg" className="hidden sm:block">
                     {buckets}
                  </Badge>
               )}
               <Button
                  color="light"
                  onClick={onRefresh}
                  disabled={isFetching}
                  aria-label="Atualizar estatísticas do storage"
                  className="font-semibold whitespace-nowrap"
               >
                  <HiRefresh
                     className={clsx("size-4", isFetching && "animate-spin")}
                  />
                  <span className="ml-2 hidden sm:inline">Atualizar</span>
               </Button>
            </div>
         </div>
      </header>
   );
}
