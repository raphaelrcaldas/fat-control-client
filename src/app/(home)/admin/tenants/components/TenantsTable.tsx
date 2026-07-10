"use client";

import {
   Table,
   TableHead,
   TableHeadCell,
   TableBody,
   TableRow,
   TableCell,
   ToggleSwitch,
   Tooltip,
} from "flowbite-react";
import { FaTrashCan, FaPalette, FaImage } from "react-icons/fa6";
import clsx from "clsx";
import type { Tenant } from "services/routes/tenants";
import { formatDateFull, extractDate } from "@/../utils/dateHandler";
import { Skeleton } from "@/components/ui/Skeleton";
import { THEME_META, normalizeOrgTheme } from "@/lib/orgTheme";
import { brasaoUrl } from "@/lib/orgBrasao";

interface TenantsTableProps {
   tenants: Tenant[];
   isUpdating: boolean;
   onToggleActive: (tenant: Tenant) => void;
   onConfig: (tenant: Tenant) => void;
   onDelete: (tenant: Tenant) => void;
}

export function TenantsTable({
   tenants,
   isUpdating,
   onToggleActive,
   onConfig,
   onDelete,
}: TenantsTableProps) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-16">
                     <span className="sr-only">Brasão</span>
                  </TableHeadCell>
                  <TableHeadCell className="w-24">Sigla</TableHeadCell>
                  <TableHeadCell className="w-40">Nome</TableHeadCell>
                  <TableHeadCell className="w-32">Tema</TableHeadCell>
                  <TableHeadCell className="w-36">Status</TableHeadCell>
                  <TableHeadCell className="hidden w-36 whitespace-nowrap md:table-cell">
                     Registrado em
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {tenants.map((tenant) => {
                  const tema = normalizeOrgTheme(tenant.tema);
                  const { sigla } = tenant.organizacao;
                  const brasao = brasaoUrl(sigla);
                  return (
                     <TableRow key={tenant.organizacao_id} className="bg-white">
                        <TableCell>
                           <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
                              {brasao ? (
                                 // eslint-disable-next-line @next/next/no-img-element
                                 <img
                                    src={brasao}
                                    alt={`Brasão de ${sigla.toUpperCase()}`}
                                    className="h-full w-full object-contain"
                                 />
                              ) : (
                                 <FaImage className="h-4 w-4 text-slate-300" />
                              )}
                           </div>
                        </TableCell>
                        <TableCell>
                           <span className="font-medium text-gray-900 uppercase">
                              {tenant.organizacao.sigla}
                           </span>
                        </TableCell>
                        <TableCell className="text-gray-600">
                           {tenant.organizacao.sigla_3}
                        </TableCell>
                        <TableCell>
                           <span className="flex items-center gap-2">
                              <span
                                 className={clsx(
                                    "h-3.5 w-3.5 shrink-0 rounded-full shadow-sm",
                                    THEME_META[tema].swatch
                                 )}
                                 aria-hidden
                              />
                              <span className="text-gray-600">
                                 {THEME_META[tema].label}
                              </span>
                           </span>
                        </TableCell>
                        <TableCell>
                           <ToggleSwitch
                              checked={tenant.active}
                              onChange={() => onToggleActive(tenant)}
                              disabled={isUpdating}
                              color="success"
                              label={tenant.active ? "Ativo" : "Inativo"}
                              className={clsx(
                                 "[&_span]:text-sm [&_span]:font-medium",
                                 tenant.active
                                    ? "[&_span]:text-gray-700"
                                    : "[&_span]:text-gray-400"
                              )}
                              aria-label={
                                 tenant.active
                                    ? `Desativar tenant ${tenant.organizacao.sigla}`
                                    : `Ativar tenant ${tenant.organizacao.sigla}`
                              }
                           />
                        </TableCell>
                        <TableCell className="hidden text-gray-500 md:table-cell">
                           {formatDateFull(extractDate(tenant.created_at))}
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-end gap-1">
                              <Tooltip content="Aparência (tema)">
                                 <button
                                    type="button"
                                    onClick={() => onConfig(tenant)}
                                    className="rounded p-2 text-gray-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                    aria-label={`Configurar aparência do tenant ${tenant.organizacao.sigla}`}
                                 >
                                    <FaPalette className="h-4 w-4" />
                                 </button>
                              </Tooltip>
                              <Tooltip content="Descadastrar tenant">
                                 <button
                                    type="button"
                                    onClick={() => onDelete(tenant)}
                                    className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    aria-label={`Descadastrar tenant ${tenant.organizacao.sigla}`}
                                 >
                                    <FaTrashCan className="h-4 w-4" />
                                 </button>
                              </Tooltip>
                           </div>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}

export function TenantsTableSkeleton({ rows = 6 }: { rows?: number }) {
   return (
      <div className="overflow-x-auto rounded border border-slate-200 bg-white shadow-sm">
         <Table hoverable>
            <TableHead>
               <TableRow>
                  <TableHeadCell className="w-16">
                     <span className="sr-only">Brasão</span>
                  </TableHeadCell>
                  <TableHeadCell className="w-24">Sigla</TableHeadCell>
                  <TableHeadCell className="w-40">Nome</TableHeadCell>
                  <TableHeadCell className="w-32">Tema</TableHeadCell>
                  <TableHeadCell className="w-36">Status</TableHeadCell>
                  <TableHeadCell className="hidden w-36 whitespace-nowrap md:table-cell">
                     Registrado em
                  </TableHeadCell>
                  <TableHeadCell className="w-24">
                     <span className="sr-only">Ações</span>
                  </TableHeadCell>
               </TableRow>
            </TableHead>
            <TableBody className="divide-y">
               {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="bg-white">
                     <TableCell>
                        <Skeleton className="h-9 w-9 rounded" />
                     </TableCell>
                     <TableCell>
                        <Skeleton className="h-4 w-16" />
                     </TableCell>
                     <TableCell>
                        <Skeleton className="h-4 w-full max-w-xs" />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-3.5 w-3.5 rounded-full" />
                           <Skeleton className="h-4 w-16" />
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-2">
                           <Skeleton className="h-5 w-9 rounded-full" />
                           <Skeleton className="h-4 w-12" />
                        </div>
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-24" />
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center justify-end gap-1">
                           <Skeleton className="h-8 w-8 rounded" />
                           <Skeleton className="h-8 w-8 rounded" />
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}
