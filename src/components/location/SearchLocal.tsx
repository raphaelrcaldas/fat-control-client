import {
   Modal,
   ModalHeader,
   ModalBody,
   TextInput,
   Button,
} from "flowbite-react";
import { Spinner } from "@/components/Spinner";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaMapMarkerAlt } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { MdLocationCity } from "react-icons/md";
import { getCities } from "services/routes/cities";

interface SearchLocalProps {
   show: boolean;
   setShow: (show: boolean) => void;
   setLocal: (local: { codigo: number; nome: string; uf: string }) => void;
}

export function SearchLocal({ show, setShow, setLocal }: SearchLocalProps) {
   const [cities, setCities] = useState<
      Array<{ codigo: number; nome: string; uf: string }>
   >([]);
   const [searchCity, setSearchCity] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [hasSearched, setHasSearched] = useState(false);
   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

   useEffect(() => {
      if (!show) {
         setTimeout(() => {
            setSearchCity("");
            setCities([]);
            setHasSearched(false);
            setHoveredIndex(null);
         }, 200);
      }
   }, [show]);

   async function searchCities() {
      const searchData = searchCity.trim();
      if (searchData !== "") {
         setIsLoading(true);
         setHasSearched(true);
         try {
            const data = await getCities(searchCity);
            setCities(data);
         } catch (error: any) {
            console.error("Erro ao buscar cidades:", error);
            setCities([]);
         } finally {
            setIsLoading(false);
         }
      }
   }

   function onClose() {
      setShow(false);
   }

   function onSetLocal(local: { codigo: number; nome: string; uf: string }) {
      setLocal(local);
      onClose();
   }

   return (
      <Modal size="xl" show={show} onClose={onClose} dismissible>
         <ModalHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
               <MdLocationCity className="size-6 text-blue-600" />
               <span className="text-xl font-semibold text-gray-800">
                  Buscar Cidade
               </span>
            </div>
         </ModalHeader>
         <ModalBody className="p-6">
            <div className="space-y-4">
               {/* Search Input Section */}
               <div className="flex flex-row gap-3">
                  <div className="relative flex-1">
                     <TextInput
                        placeholder="Digite o nome da cidade..."
                        className="w-full"
                        value={searchCity}
                        onChange={(e) => setSearchCity(e.target.value)}
                        onKeyDown={(e) => {
                           if (
                              !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                              e.key !== "Backspace" &&
                              e.key !== "Delete" &&
                              e.key !== "ArrowLeft" &&
                              e.key !== "ArrowRight" &&
                              e.key !== "Tab"
                           ) {
                              e.preventDefault();
                           }

                           if (e.key === "Enter") {
                              searchCities();
                           }
                        }}
                        sizing="lg"
                        icon={IoMdSearch}
                     />
                  </div>
                  <Button
                     onClick={searchCities}
                     disabled={isLoading || !searchCity.trim()}
                     color="blue"
                     size="lg"
                     className="px-6"
                  >
                     {isLoading ? (
                        <div className="flex items-center gap-2">
                           <Spinner size="sm" color="white" />
                           <span>Buscando...</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                           <IoMdSearch className="size-5" />
                           <span>Buscar</span>
                        </div>
                     )}
                  </Button>
               </div>

               {/* Results Section */}
               <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-linear-to-br from-slate-50 to-gray-50 shadow-sm">
                  {isLoading ? (
                     <div className="flex flex-col items-center justify-center px-4 py-16">
                        <Spinner size="xl" />
                        <p className="font-medium text-gray-600">
                           Procurando cidades...
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                           Isso pode levar alguns segundos
                        </p>
                     </div>
                  ) : cities.length === 0 ? (
                     <div className="flex flex-col items-center justify-center px-4 py-16">
                        <div className="mb-4 rounded-full bg-gray-100 p-4">
                           <FaMapMarkerAlt className="size-12 text-gray-400" />
                        </div>
                        {hasSearched ? (
                           <>
                              <p className="text-lg font-semibold text-gray-700">
                                 Nenhuma cidade encontrada
                              </p>
                              <p className="mt-2 max-w-xs text-center text-sm text-gray-500">
                                 Tente buscar novamente com um nome diferente
                              </p>
                           </>
                        ) : (
                           <>
                              <p className="text-lg font-semibold text-gray-700">
                                 Pronto para buscar
                              </p>
                              <p className="mt-2 max-w-xs text-center text-sm text-gray-500">
                                 Digite o nome de uma cidade e clique em buscar
                              </p>
                           </>
                        )}
                     </div>
                  ) : (
                     <div className="max-h-96 overflow-y-auto">
                        <div className="divide-y divide-gray-200">
                           {cities.map((citie, index) => {
                              const isHovered = hoveredIndex === index;
                              return (
                                 <div
                                    key={index}
                                    className={`flex cursor-pointer flex-row items-center gap-4 p-4 transition-all duration-200 ${
                                       isHovered
                                          ? "bg-blue-50 shadow-sm"
                                          : "bg-white hover:bg-gray-50"
                                    } `}
                                    onClick={() => onSetLocal(citie)}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                 >
                                    <div
                                       className={`shrink-0 transition-all duration-200 ${isHovered ? "scale-110" : "scale-100"} `}
                                    >
                                       <FaCheckCircle
                                          className={`size-6 transition-colors duration-200 ${
                                             isHovered
                                                ? "text-blue-600"
                                                : "text-gray-300"
                                          } `}
                                       />
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex items-center gap-2">
                                          <FaMapMarkerAlt
                                             className={`size-4 transition-colors duration-200 ${
                                                isHovered
                                                   ? "text-blue-500"
                                                   : "text-gray-400"
                                             } `}
                                          />
                                          <span
                                             className={`text-base transition-all duration-200 ${
                                                isHovered
                                                   ? "font-semibold text-gray-900"
                                                   : "font-medium text-gray-700"
                                             } `}
                                          >
                                             {citie.nome}
                                          </span>
                                          <span
                                             className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 ${
                                                isHovered
                                                   ? "bg-blue-600 text-white"
                                                   : "bg-gray-200 text-gray-600"
                                             } `}
                                          >
                                             {citie.uf}
                                          </span>
                                       </div>
                                    </div>
                                    <div
                                       className={`text-sm transition-all duration-200 ${
                                          isHovered
                                             ? "font-medium text-blue-600 opacity-100"
                                             : "text-gray-400 opacity-0"
                                       } `}
                                    >
                                       Selecionar →
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>

               {/* Results Counter */}
               {cities.length > 0 && !isLoading && (
                  <div className="text-center">
                     <p className="text-sm text-gray-500">
                        <span className="font-semibold text-blue-600">
                           {cities.length}
                        </span>
                        {cities.length === 1
                           ? " cidade encontrada"
                           : " cidades encontradas"}
                     </p>
                  </div>
               )}
            </div>
         </ModalBody>
      </Modal>
   );
}
