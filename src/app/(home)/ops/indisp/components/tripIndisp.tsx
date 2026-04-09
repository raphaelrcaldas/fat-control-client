import { useState, useMemo } from "react";
import clsx from "clsx";
import {
   Button,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeadCell,
   TableRow,
} from "flowbite-react";
import { IndispForm } from "./indispForm";
import { isoDateToString } from "utils/dateHandler";
import { getIndisp, indispsOptions } from "./options";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { CrewIndisp, IndispType } from "services/routes/indisps";
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { useUserIndisps } from "@/hooks/queries";

// Função para formatar data no padrão YYYY-MM-DD
function formatDate(date: Date): string {
   return date.toISOString().split("T")[0];
}

// Calcula as datas padrão (últimos 7 dias)
function getDefaultDates() {
   const today = new Date();
   const daysAgo = new Date();
   daysAgo.setDate(today.getDate() - 7);

   return {
      dateFrom: formatDate(daysAgo),
      dateTo: formatDate(today),
   };
}

export const TripIndisp = ({
   trip,
   indisps: initialIndisps,
}: {
   trip: CrewIndisp;
   indisps: IndispType[];
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const [isOpenNewInd, setIsOpenNewInd] = useState(false);
   const [showFilters, setShowFilters] = useState(false);

   // Estados dos filtros com valores padrão
   const defaultDates = getDefaultDates();
   const [dateFrom, setDateFrom] = useState(defaultDates.dateFrom);
   const [dateTo, setDateTo] = useState(defaultDates.dateTo);
   const [mtvFilter, setMtvFilter] = useState("");
   const [showFuture, setShowFuture] = useState(true); // Padrão: exibir futuras

   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);

   const user = trip.user;

   // Filtros para o React Query
   const filters = useMemo(
      () => ({
         date_from: dateFrom,
         date_to: showFuture ? undefined : dateTo,
         mtv: mtvFilter || undefined,
      }),
      [dateFrom, dateTo, showFuture, mtvFilter]
   );

   // Query de indisponibilidades do usuário (só busca quando modal está aberto)
   const {
      data: indisps = initialIndisps,
      isLoading,
      isFetching,
   } = useUserIndisps(trip.user.id, filters, isOpen);

   // Filtra indisps deletadas para a tabela principal
   const activeIndisps = indisps.filter((i) => !i.deleted_at);

   // Verifica se há filtros customizados (diferentes do padrão)
   const hasCustomFilters =
      mtvFilter !== "" || dateFrom !== defaultDates.dateFrom || !showFuture;

   // Handler para dateFrom com validação
   function handleDateFromChange(newDateFrom: string) {
      setDateFrom(newDateFrom);
      if (dateTo && newDateFrom > dateTo) {
         setDateTo(newDateFrom);
      }
   }

   // Recarrega após limpar filtros
   async function clearAndRefetch() {
      const defaults = getDefaultDates();
      setDateFrom(defaults.dateFrom);
      setDateTo(defaults.dateTo);
      setMtvFilter("");
      setShowFuture(true);
   }

   return (
      <>
         <Button
            color="light"
            className="h-10 w-14 overflow-visible p-0 text-sm font-medium uppercase transition-shadow hover:shadow-md"
            onClick={openModal}
            aria-label={`Ver indisponibilidades de ${trip.trig}`}
         >
            {trip.trig}
            {trip.func.oper == "in" && (
               <div
                  className="absolute -end-1 -top-1 size-4 rounded-full bg-red-400"
                  aria-label="Instrutor"
               ></div>
            )}
         </Button>

         {isOpen && (
            <Modal show={isOpen} size="3xl" onClose={closeModal} dismissible>
               <ModalHeader>
                  <span className="text-lg font-bold">Indisponibilidades</span>
               </ModalHeader>
               <ModalBody className="max-h-112.5 min-h-112.5 overflow-y-scroll">
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                     <h3 className="text-center text-lg font-bold text-gray-900 uppercase">
                        {user.posto.short} {user.esp} {user.nome_guerra}
                     </h3>
                     <h3 className="mt-1 text-center text-sm text-gray-600 uppercase">
                        {user.nome_completo}
                     </h3>
                  </div>

                  {/* Painel de Filtros */}
                  <div className="mb-4">
                     {/* Botão toggle de filtros */}
                     <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                           "flex w-full items-center justify-between rounded-lg border bg-white p-3 transition-all duration-200 hover:bg-gray-50",
                           showFilters
                              ? "rounded-b-none border-blue-200"
                              : "border-gray-200"
                        )}
                     >
                        <div className="flex items-center gap-2">
                           <span className="text-sm font-medium text-gray-700">
                              Filtros
                           </span>
                           {hasCustomFilters && (
                              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                                 Personalizado
                              </span>
                           )}
                        </div>
                        <FaChevronDown
                           className={clsx(
                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                              showFilters && "rotate-180"
                           )}
                        />
                     </button>

                     {/* Painel de filtros expansível */}
                     <div
                        className={clsx(
                           "grid transition-all duration-300 ease-in-out",
                           showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        )}
                     >
                        <div className="overflow-hidden">
                           <div className="space-y-4 rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 p-4">
                              {/* Linha 1: Datas lado a lado */}
                              <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                       Data início
                                    </label>
                                    <input
                                       type="date"
                                       value={dateFrom}
                                       max={showFuture ? undefined : dateTo}
                                       onChange={(e) =>
                                          handleDateFromChange(e.target.value)
                                       }
                                       className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                 </div>
                                 <div>
                                    <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                       Data fim
                                    </label>
                                    <input
                                       type="date"
                                       value={dateTo}
                                       min={dateFrom}
                                       disabled={showFuture}
                                       onChange={(e) =>
                                          setDateTo(e.target.value)
                                       }
                                       className={clsx(
                                          "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20",
                                          showFuture
                                             ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                             : "bg-white text-gray-700"
                                       )}
                                    />
                                 </div>
                              </div>

                              {/* Checkbox exibir futuras */}
                              <label className="flex cursor-pointer items-center gap-3 select-none">
                                 <input
                                    type="checkbox"
                                    checked={showFuture}
                                    onChange={(e) =>
                                       setShowFuture(e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="text-sm text-gray-600">
                                    Exibir futuras
                                 </span>
                              </label>

                              {/* Tipo */}
                              <div>
                                 <label className="mb-1.5 block text-xs font-medium text-gray-500">
                                    Tipo de indisponibilidade
                                 </label>
                                 <select
                                    value={mtvFilter}
                                    onChange={(e) =>
                                       setMtvFilter(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                 >
                                    <option value="">Todos os tipos</option>
                                    {indispsOptions.map((opt) => (
                                       <option
                                          key={opt.value}
                                          value={opt.value}
                                       >
                                          {opt.label}
                                       </option>
                                    ))}
                                 </select>
                              </div>

                              {/* Botão restaurar padrão */}
                              {hasCustomFilters && (
                                 <div className="flex justify-end">
                                    <button
                                       onClick={clearAndRefetch}
                                       className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                       <FaTimes className="h-3 w-3" />
                                       Restaurar padrão
                                    </button>
                                 </div>
                              )}

                              {/* Indicador de loading */}
                              {isFetching && !isLoading && (
                                 <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                    Atualizando...
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Chips de filtros (quando fechado) */}
                     {!showFilters && (
                        <div className="mt-2 flex items-center gap-2 overflow-x-auto">
                           <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs whitespace-nowrap text-gray-600">
                              {showFuture ? "A partir de:" : "De:"}{" "}
                              {new Date(
                                 dateFrom + "T00:00:00"
                              ).toLocaleDateString("pt-BR")}
                           </span>
                           {!showFuture && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs whitespace-nowrap text-gray-600">
                                 Até:{" "}
                                 {new Date(
                                    dateTo + "T00:00:00"
                                 ).toLocaleDateString("pt-BR")}
                              </span>
                           )}
                           {mtvFilter && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs whitespace-nowrap text-blue-600">
                                 {
                                    indispsOptions.find(
                                       (o) => o.value === mtvFilter
                                    )?.label
                                 }
                              </span>
                           )}
                           {hasCustomFilters && (
                              <button
                                 onClick={clearAndRefetch}
                                 className="ml-auto text-xs font-medium whitespace-nowrap text-blue-600"
                              >
                                 Limpar
                              </button>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Tabela de indisponibilidades */}
                  {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        <span className="text-sm">Carregando...</span>
                     </div>
                  ) : activeIndisps.length > 0 ? (
                     <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
                        <Table hoverable className="text-center uppercase">
                           <TableHead className="bg-gray-100">
                              <TableRow>
                                 <TableHeadCell className="font-bold">
                                    MOTIVO
                                 </TableHeadCell>
                                 <TableHeadCell className="hidden font-bold md:table-cell">
                                    OBS
                                 </TableHeadCell>
                                 <TableHeadCell className="font-bold">
                                    INÍCIO
                                 </TableHeadCell>
                                 <TableHeadCell className="font-bold">
                                    FIM
                                 </TableHeadCell>
                                 <TableHeadCell>
                                    <span className="sr-only">Ações</span>
                                 </TableHeadCell>
                              </TableRow>
                           </TableHead>
                           <TableBody className="divide-y divide-gray-200">
                              {activeIndisps.map((indisp) => (
                                 <TripIndispRow
                                    key={indisp.id}
                                    indisp={indisp}
                                    trip={trip}
                                 />
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  ) : (
                     <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                        <p className="text-base text-gray-500">
                           {hasCustomFilters
                              ? "Nenhuma indisponibilidade encontrada com os filtros aplicados"
                              : "Nenhuma indisponibilidade registrada"}
                        </p>
                        {hasCustomFilters && (
                           <button
                              onClick={clearAndRefetch}
                              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
                           >
                              Limpar filtros
                           </button>
                        )}
                     </div>
                  )}
               </ModalBody>
               <ModalFooter className="flex justify-center gap-3 bg-gray-50">
                  <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
                     <Button
                        color="red"
                        size="md"
                        onClick={() => setIsOpenNewInd(true)}
                     >
                        + Adicionar Indisponibilidade
                     </Button>
                     <IndispForm
                        open={isOpenNewInd}
                        setOpen={setIsOpenNewInd}
                        trip={trip}
                        indisp={null}
                     />
                  </PermBased>
                  <Button color="gray" size="md" onClick={closeModal}>
                     Fechar
                  </Button>
               </ModalFooter>
            </Modal>
         )}
      </>
   );
};

function TripIndispRow({ indisp, trip }) {
   const [openInd, setOpenInd] = useState(false);
   const dateStart = isoDateToString(indisp.date_start);
   const dateEnd = isoDateToString(indisp.date_end);
   const indispProps = getIndisp(indisp.mtv);

   return (
      <TableRow>
         <TableCell className="h-10 p-1 font-semibold">
            <span className={clsx("rounded-md p-2", indispProps.color.bg)}>
               {indispProps.value}
            </span>
         </TableCell>
         <TableCell className="hidden h-10 p-1 whitespace-pre-line md:table-cell">
            {indisp.obs}
         </TableCell>
         <TableCell className="h-10 p-1 font-semibold">{dateStart}</TableCell>
         <TableCell className="h-10 p-1 font-semibold">{dateEnd}</TableCell>
         <TableCell className="h-10 p-1">
            <div className="flex items-center justify-center">
               <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
                  <Button
                     pill
                     color="light"
                     size="sm"
                     onClick={() => setOpenInd(true)}
                  >
                     Editar
                  </Button>

                  {openInd && (
                     <IndispForm
                        open={openInd}
                        setOpen={setOpenInd}
                        trip={trip}
                        indisp={indisp}
                     />
                  )}
               </PermBased>
            </div>
         </TableCell>
      </TableRow>
   );
}
