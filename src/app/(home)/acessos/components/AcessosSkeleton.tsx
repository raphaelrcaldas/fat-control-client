"use client";

import {
   Button,
   Select,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
   TextInput,
} from "flowbite-react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { HiRefresh } from "react-icons/hi";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAbaixoDe } from "@/hooks/useAbaixoDe";
import { SELECT_THEME } from "./UsersTable";

const ROWS = 8;
/** Botões de ação por linha: o "login como" só existe fora de produção. */
const ACTIONS = process.env.NODE_ENV !== "production" ? 3 : 2;

/**
 * Espelha o layout real de UsersTable para evitar layout-shift. A toolbar é
 * a real, só desabilitada (busca e atualizar não dependem do dado para
 * existir); o `role="status"` cobre só a tabela.
 */
export function AcessosSkeleton() {
   const mobile = useAbaixoDe("sm");
   return (
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
         {/* Toolbar: busca + perfil + atualizar (mesmas larguras da real) */}
         <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-4">
            <TextInput
               icon={FaMagnifyingGlass}
               className="min-w-0 flex-1"
               placeholder={
                  mobile ? "Buscar…" : "Buscar por nome, posto ou perfil..."
               }
               aria-label="Buscar por nome, posto ou perfil"
               disabled
            />
            <Select
               className="w-[112px] shrink-0 sm:w-[200px]"
               aria-label="Filtrar por perfil"
               theme={SELECT_THEME}
               disabled
            >
               <option>Todos</option>
            </Select>
            <Button
               className="shrink-0 px-3 sm:px-5"
               color="light"
               disabled
               aria-label="Atualizar lista"
            >
               <HiRefresh />
            </Button>
         </div>

         <div role="status" className="overflow-x-auto">
            <span className="sr-only">Carregando acessos…</span>
            <Table hoverable aria-hidden>
               <TableHead>
                  <TableRow>
                     <TableHeadCell className="px-2 sm:px-6">
                        Usuário
                     </TableHeadCell>
                     <TableHeadCell className="px-2 sm:px-6">
                        Perfil
                     </TableHeadCell>
                     <TableHeadCell className="hidden px-6 sm:table-cell">
                        Escopo
                     </TableHeadCell>
                     <TableHeadCell className="px-2 text-center sm:px-6">
                        Ações
                     </TableHeadCell>
                  </TableRow>
               </TableHead>
               <TableBody className="divide-y divide-slate-200">
                  {Array.from({ length: ROWS }).map((_, i) => (
                     <TableRow key={i} className="bg-white">
                        <TableCell className="px-2 sm:px-6">
                           <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                              <Skeleton className="size-8 shrink-0 rounded-full sm:size-10" />
                              <Skeleton className="h-4 w-[64px] sm:w-28" />
                           </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-6">
                           <Skeleton className="h-6 w-[80px] sm:w-24" />
                        </TableCell>
                        <TableCell className="hidden px-6 sm:table-cell">
                           <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="px-2 sm:px-6">
                           <div className="flex justify-center gap-1 sm:gap-2">
                              {Array.from({ length: ACTIONS }).map((_, j) => (
                                 <Skeleton
                                    key={j}
                                    className="h-8 w-[30px] sm:w-8"
                                 />
                              ))}
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
