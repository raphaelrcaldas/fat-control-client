import { useState, useEffect } from "react";
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
import {
   CrewIndisp,
   IndispType,
   IndispFilters,
   getIndispByUser,
} from "services/routes/indisps";
import { FaChevronDown, FaTimes } from "react-icons/fa";

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
   update,
}: {
   trip: CrewIndisp;
   indisps: IndispType[];
   update: () => void;
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

   // Estado para indisps (gerenciado localmente com filtros)
   const [indisps, setIndisps] = useState<IndispType[]>(initialIndisps);
   const [isLoading, setIsLoading] = useState(false);
   const [isFiltering, setIsFiltering] = useState(false);

   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);

   const user = trip.user;

   // Filtra indisps deletadas para a tabela principal
   const activeIndisps = indisps.filter((i) => !i.deleted_at);

   // Verifica se há filtros customizados (diferentes do padrão)
   const hasCustomFilters =
      mtvFilter !== "" || dateFrom !== defaultDates.dateFrom || !showFuture;

   // Busca indisponibilidades do servidor
   async function fetchIndisps(showLoadingState = true) {
      if (!trip.user.id) return;

      if (showLoadingState) setIsLoading(true);
      setIsFiltering(true);

      try {
         const filters: IndispFilters = {
            date_from: dateFrom,
         };
         // Só envia date_to se não estiver exibindo futuras
         if (!showFuture) {
            filters.date_to = dateTo;
         }
         if (mtvFilter) filters.mtv = mtvFilter;

         const data = await getIndispByUser(trip.user.id, filters);
         setIndisps(data);
      } catch (error) {
         console.error("Erro ao buscar indisponibilidades:", error);
      } finally {
         setIsLoading(false);
         setIsFiltering(false);
      }
   }

   // Busca quando modal abre
   useEffect(() => {
      if (isOpen && trip.user.id) {
         fetchIndisps();
      }
   }, [isOpen]);

   // Busca automática quando filtros mudam
   useEffect(() => {
      if (isOpen && trip.user.id && !isLoading) {
         fetchIndisps(false);
      }
   }, [dateFrom, dateTo, mtvFilter, showFuture]);

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
            color='light'
            className='uppercase w-[55px] p-0 h-10 text-sm font-medium overflow-visible hover:shadow-md transition-shadow'
            onClick={openModal}
            aria-label={`Ver indisponibilidades de ${trip.trig}`}
         >
            {trip.trig}
            {trip.func.oper == "in" && (
               <div
                  className='absolute size-4 border-2 bg-red-400 rounded-full -top-1 -end-1'
                  aria-label='Instrutor'
               ></div>
            )}
         </Button>

         {isOpen && (
            <Modal show={isOpen} size='3xl' onClose={closeModal}>
               <ModalHeader>
                  <span className='text-lg font-bold'>Indisponibilidades</span>
               </ModalHeader>
               <ModalBody>
                  <div className='bg-red-50 rounded-lg p-4 mb-4 border border-red-200'>
                     <h3 className='uppercase text-center font-bold text-gray-900 text-lg'>
                        {user.posto.short} {user.esp} {user.nome_guerra}
                     </h3>
                     <h3 className='uppercase text-center text-gray-600 text-sm mt-1'>
                        {user.nome_completo}
                     </h3>
                  </div>

                  {/* Painel de Filtros */}
                  <div className='mb-4'>
                     {/* Botão toggle de filtros */}
                     <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={clsx(
                           "w-full flex items-center justify-between p-3 bg-white border rounded-lg transition-all duration-200 hover:bg-gray-50",
                           showFilters
                              ? "border-blue-200 rounded-b-none"
                              : "border-gray-200"
                        )}
                     >
                        <div className='flex items-center gap-2'>
                           <span className='text-sm font-medium text-gray-700'>
                              Filtros
                           </span>
                           {hasCustomFilters && (
                              <span className='text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full'>
                                 Personalizado
                              </span>
                           )}
                        </div>
                        <FaChevronDown
                           className={clsx(
                              "w-4 h-4 text-gray-400 transition-transform duration-200",
                              showFilters && "rotate-180"
                           )}
                        />
                     </button>

                     {/* Painel de filtros expansível */}
                     {showFilters && (
                        <div className='p-4 border border-t-0 border-gray-200 rounded-b-lg bg-gray-50 space-y-4'>
                           {/* Linha 1: Datas lado a lado */}
                           <div className='grid grid-cols-2 gap-3'>
                              <div>
                                 <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                                    Data início
                                 </label>
                                 <input
                                    type='date'
                                    value={dateFrom}
                                    max={showFuture ? undefined : dateTo}
                                    onChange={(e) =>
                                       handleDateFromChange(e.target.value)
                                    }
                                    className='w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                               rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'
                                 />
                              </div>
                              <div>
                                 <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                                    Data fim
                                 </label>
                                 <input
                                    type='date'
                                    value={dateTo}
                                    min={dateFrom}
                                    disabled={showFuture}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className={clsx(
                                       "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
                                       showFuture
                                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                          : "bg-white text-gray-700"
                                    )}
                                 />
                              </div>
                           </div>

                           {/* Checkbox exibir futuras */}
                           <label className='flex items-center gap-3 cursor-pointer select-none'>
                              <input
                                 type='checkbox'
                                 checked={showFuture}
                                 onChange={(e) =>
                                    setShowFuture(e.target.checked)
                                 }
                                 className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                              />
                              <span className='text-sm text-gray-600'>
                                 Exibir futuras
                              </span>
                           </label>

                           {/* Tipo */}
                           <div>
                              <label className='block text-xs font-medium text-gray-500 mb-1.5'>
                                 Tipo de indisponibilidade
                              </label>
                              <select
                                 value={mtvFilter}
                                 onChange={(e) => setMtvFilter(e.target.value)}
                                 className='w-full px-3 py-2 text-sm bg-white border border-gray-200 
                                            rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400'
                              >
                                 <option value=''>Todos os tipos</option>
                                 {indispsOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                       {opt.label}
                                    </option>
                                 ))}
                              </select>
                           </div>

                           {/* Botão restaurar padrão */}
                           {hasCustomFilters && (
                              <div className='flex justify-end'>
                                 <button
                                    onClick={clearAndRefetch}
                                    className='flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 
                                               bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
                                 >
                                    <FaTimes className='w-3 h-3' />
                                    Restaurar padrão
                                 </button>
                              </div>
                           )}

                           {/* Indicador de loading */}
                           {isFiltering && (
                              <div className='flex items-center justify-center gap-2 py-2 text-gray-500 text-sm'>
                                 <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent' />
                                 Atualizando...
                              </div>
                           )}
                        </div>
                     )}

                     {/* Chips de filtros (quando fechado) */}
                     {!showFilters && (
                        <div className='flex items-center gap-2 mt-2 overflow-x-auto'>
                           <span
                              className='inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-xs 
                                            text-gray-600 rounded-full whitespace-nowrap'
                           >
                              {showFuture ? "A partir de:" : "De:"}{" "}
                              {new Date(
                                 dateFrom + "T00:00:00"
                              ).toLocaleDateString("pt-BR")}
                           </span>
                           {!showFuture && (
                              <span
                                 className='inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-xs 
                                               text-gray-600 rounded-full whitespace-nowrap'
                              >
                                 Até:{" "}
                                 {new Date(
                                    dateTo + "T00:00:00"
                                 ).toLocaleDateString("pt-BR")}
                              </span>
                           )}
                           {mtvFilter && (
                              <span
                                 className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-xs 
                                               text-blue-600 rounded-full whitespace-nowrap'
                              >
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
                                 className='text-xs text-blue-600 font-medium whitespace-nowrap ml-auto'
                              >
                                 Limpar
                              </button>
                           )}
                        </div>
                     )}
                  </div>

                  {/* Tabela de indisponibilidades */}
                  {isLoading ? (
                     <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                        <div className='animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-3' />
                        <span className='text-sm'>Carregando...</span>
                     </div>
                  ) : activeIndisps.length > 0 ? (
                     <div className='shadow-md rounded-lg overflow-hidden border border-gray-200'>
                        <Table hoverable className='text-center uppercase'>
                           <TableHead className='bg-gray-100'>
                              <TableRow>
                                 <TableHeadCell className='font-bold'>
                                    MOTIVO
                                 </TableHeadCell>
                                 <TableHeadCell className='font-bold hidden md:table-cell'>
                                    OBS
                                 </TableHeadCell>
                                 <TableHeadCell className='font-bold'>
                                    INÍCIO
                                 </TableHeadCell>
                                 <TableHeadCell className='font-bold'>
                                    FIM
                                 </TableHeadCell>
                                 <TableHeadCell>
                                    <span className='sr-only'>Ações</span>
                                 </TableHeadCell>
                              </TableRow>
                           </TableHead>
                           <TableBody className='divide-y'>
                              {activeIndisps.map((indisp) => (
                                 <TripIndispRow
                                    key={indisp.id}
                                    indisp={indisp}
                                    trip={trip}
                                    update={() => fetchIndisps(false)}
                                 />
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  ) : (
                     <div className='p-8 text-center bg-gray-50 rounded-lg border border-gray-200'>
                        <p className='text-gray-500 text-base'>
                           {hasCustomFilters
                              ? "Nenhuma indisponibilidade encontrada com os filtros aplicados"
                              : "Nenhuma indisponibilidade registrada"}
                        </p>
                        {hasCustomFilters && (
                           <button
                              onClick={clearAndRefetch}
                              className='mt-3 text-sm text-blue-600 font-medium hover:underline'
                           >
                              Limpar filtros
                           </button>
                        )}
                     </div>
                  )}
               </ModalBody>
               <ModalFooter className='flex justify-center gap-3 bg-gray-50'>
                  <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
                     <Button
                        color='red'
                        size='md'
                        onClick={() => setIsOpenNewInd(true)}
                     >
                        + Adicionar Indisponibilidade
                     </Button>
                     <IndispForm
                        open={isOpenNewInd}
                        setOpen={setIsOpenNewInd}
                        trip={trip}
                        update={() => fetchIndisps(false)}
                        indisp={null}
                     />
                  </PermBased>
                  <Button color='gray' size='md' onClick={closeModal}>
                     Fechar
                  </Button>
               </ModalFooter>
            </Modal>
         )}
      </>
   );
};

function TripIndispRow({ indisp, trip, update }) {
   const [openInd, setOpenInd] = useState(false);
   const dateStart = isoDateToString(indisp.date_start);
   const dateEnd = isoDateToString(indisp.date_end);
   const indispProps = getIndisp(indisp.mtv);

   return (
      <TableRow>
         <TableCell className='p-1 font-semibold'>
            <span className={clsx("rounded-md p-2", indispProps.color.bg)}>
               {indispProps.value}
            </span>
         </TableCell>
         <TableCell className='p-1 hidden md:table-cell'>
            {indisp.obs}
         </TableCell>
         <TableCell className='p-1 font-semibold'>{dateStart}</TableCell>
         <TableCell className='p-1 font-semibold'>{dateEnd}</TableCell>
         <TableCell className='p-1'>
            <PermBased requiredPerm={"create"} resource={"indisp_trips"}>
               <Button
                  pill
                  color='light'
                  size='sm'
                  onClick={() => setOpenInd(true)}
               >
                  Editar
               </Button>

               {openInd && (
                  <IndispForm
                     open={openInd}
                     setOpen={setOpenInd}
                     trip={trip}
                     update={update}
                     indisp={indisp}
                  />
               )}
            </PermBased>
         </TableCell>
      </TableRow>
   );
}
