"use client";
import { useMemo } from "react";
import { Progress, Label } from "flowbite-react";
import { isoStrToDate } from "utils/dateHandler";
import {
   MdOutlineAttachMoney,
   MdOutlineCalendarToday,
   MdChevronRight,
} from "react-icons/md";
import clsx from "clsx";
import { ComissList } from "services/routes/cegep/comiss";
import { useRouter } from "next/navigation";

export function ListComiss({ comiss }: { comiss: ComissList }) {
   const router = useRouter();
   const user = comiss.user;

   const { data_abertura, data_fechamento } = useMemo(
      () => ({
         data_abertura: isoStrToDate(comiss.data_ab).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
         data_fechamento: isoStrToDate(comiss.data_fc).toLocaleDateString(
            "pt-br",
            { day: "2-digit", month: "2-digit", year: "2-digit" }
         ),
      }),
      [comiss.data_ab, comiss.data_fc]
   );

   const ajd_ab = comiss.valor_aj_ab;
   const ajd_fc = comiss.valor_aj_fc;

   return (
      <div
         onClick={() => router.push(`/cegep/comiss/${comiss.id}`)}
         className={clsx(
            "group cursor-pointer rounded-xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm hover:border-gray-200 hover:shadow-md",
            {
               "hover:bg-blue-50/50": comiss.dias_cumprir,
               "hover:bg-green-50/50": !comiss.dias_cumprir,
            }
         )}
      >
         <div className="flex flex-row items-center justify-between gap-4 p-4">
            {/* Nome do Militar */}
            <div className="min-w-[11rem] text-sm font-semibold text-gray-900 uppercase">
               {user.p_g} {user.nome_guerra}
            </div>

            {/* Datas de Abertura/Fechamento */}
            <div className="hidden gap-6 md:flex">
               <div className="flex items-center gap-2.5">
                  <div
                     className={clsx("h-2 w-2 rounded-full transition-colors", {
                        "bg-emerald-500 shadow-sm shadow-emerald-200":
                           comiss.status === "aberto",
                        "bg-gray-400": comiss.status === "fechado",
                     })}
                  />
                  <span className="font-mono text-sm text-gray-700">
                     {data_abertura}
                  </span>
               </div>
               <div className="flex items-center gap-2.5">
                  <div
                     className={clsx("h-2 w-2 rounded-full transition-colors", {
                        "bg-rose-500 shadow-sm shadow-rose-200":
                           comiss.status === "aberto",
                        "bg-gray-400": comiss.status === "fechado",
                     })}
                  />
                  <span className="font-mono text-sm text-gray-700">
                     {data_fechamento}
                  </span>
               </div>
            </div>

            {/* Tipo de Comissionamento */}
            <div
               className={clsx(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors md:w-32",
                  {
                     "bg-blue-100 text-blue-700": comiss.dias_cumprir,
                     "bg-green-100 text-green-700": !comiss.dias_cumprir,
                  }
               )}
            >
               {comiss.dias_cumprir ? (
                  <>
                     <MdOutlineCalendarToday size={14} />
                     <span className="hidden w-full text-center md:flex">
                        Período
                     </span>
                  </>
               ) : (
                  <>
                     <MdOutlineAttachMoney size={14} />
                     <span className="hidden w-full text-center md:flex">
                        Comparativo
                     </span>
                  </>
               )}
            </div>

            {/* Progress */}
            <div className="w-40">
               <ComissProgress
                  value={comiss.completude}
                  status={comiss.status}
                  modulo={comiss.modulo}
               />
            </div>

            {/* Métricas */}
            <div className="hidden min-w-[24rem] grid-cols-3 gap-6 lg:grid">
               <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">
                     {comiss.dias_cumprir
                        ? comiss.dias_cumprir
                        : `~ ${((ajd_ab + ajd_fc) / 335).toFixed(0)}`}
                     <span className="ml-1 text-xs font-normal text-gray-500">
                        dias
                     </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">Previsto</div>
               </div>
               <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">
                     {comiss.dias_cumprir
                        ? comiss.dias_comp
                        : `~ ${(comiss.vals_comp / 335).toFixed(0)}`}
                     <span className="ml-1 text-xs font-normal text-gray-500">
                        dias
                     </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">Computado</div>
               </div>
               <div className="text-center">
                  <div className="text-base font-semibold text-gray-900">
                     {comiss.dias_cumprir
                        ? comiss.dias_cumprir - comiss.dias_comp
                        : `~ ${(
                             (ajd_ab + ajd_fc - comiss.vals_comp) /
                             335
                          ).toFixed(0)}`}
                     <span className="ml-1 text-xs font-normal text-gray-500">
                        dias
                     </span>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500">Restante</div>
               </div>
            </div>

            {/* Indicador Clicável */}
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-100 sm:flex">
               <MdChevronRight
                  size={20}
                  className="text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600"
               />
            </div>
         </div>
      </div>
   );
}

function ComissProgress({
   value,
   modulo,
   status,
}: {
   value: number;
   modulo: boolean;
   status: string;
}) {
   let color = modulo ? "green" : "red";
   color = status == "fechado" ? "gray" : color;

   const labelText = `${value}%`;

   return (
      <div className="space-y-2">
         <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-600">
               {labelText}
            </Label>
         </div>
         <Progress progress={value} color={color} size="md" className="h-3" />
      </div>
   );
}
