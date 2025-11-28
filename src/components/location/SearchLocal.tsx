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
               <MdLocationCity className="text-blue-600 size-6" />
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
               <div className="flex flex-col rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-50 shadow-sm overflow-hidden">
                  {isLoading ? (
                     <div className="flex flex-col items-center justify-center py-16 px-4">
                        <Spinner size="xl" />
                        <p className="text-gray-600 font-medium">
                           Procurando cidades...
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                           Isso pode levar alguns segundos
                        </p>
                     </div>
                  ) : cities.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="bg-gray-100 rounded-full p-4 mb-4">
                           <FaMapMarkerAlt className="size-12 text-gray-400" />
                        </div>
                        {hasSearched ? (
                           <>
                              <p className="text-gray-700 font-semibold text-lg">
                                 Nenhuma cidade encontrada
                              </p>
                              <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">
                                 Tente buscar novamente com um nome diferente
                              </p>
                           </>
                        ) : (
                           <>
                              <p className="text-gray-700 font-semibold text-lg">
                                 Pronto para buscar
                              </p>
                              <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">
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
                                    className={`
                                       flex flex-row items-center gap-4 p-4
                                       transition-all duration-200 cursor-pointer
                                       ${
                                          isHovered
                                             ? "bg-blue-50 shadow-sm"
                                             : "bg-white hover:bg-gray-50"
                                       }
                                    `}
                                    onClick={() => onSetLocal(citie)}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                 >
                                    <div
                                       className={`
                                       flex-shrink-0 transition-all duration-200
                                       ${isHovered ? "scale-110" : "scale-100"}
                                    `}
                                    >
                                       <FaCheckCircle
                                          className={`
                                             size-6 transition-colors duration-200
                                             ${
                                                isHovered
                                                   ? "text-blue-600"
                                                   : "text-gray-300"
                                             }
                                          `}
                                       />
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex items-center gap-2">
                                          <FaMapMarkerAlt
                                             className={`
                                                size-4 transition-colors duration-200
                                                ${
                                                   isHovered
                                                      ? "text-blue-500"
                                                      : "text-gray-400"
                                                }
                                             `}
                                          />
                                          <span
                                             className={`
                                             text-base transition-all duration-200
                                             ${
                                                isHovered
                                                   ? "font-semibold text-gray-900"
                                                   : "font-medium text-gray-700"
                                             }
                                          `}
                                          >
                                             {citie.nome}
                                          </span>
                                          <span
                                             className={`
                                             px-2 py-0.5 rounded-full text-xs font-medium
                                             transition-all duration-200
                                             ${
                                                isHovered
                                                   ? "bg-blue-600 text-white"
                                                   : "bg-gray-200 text-gray-600"
                                             }
                                          `}
                                          >
                                             {citie.uf}
                                          </span>
                                       </div>
                                    </div>
                                    <div
                                       className={`
                                       text-sm transition-all duration-200
                                       ${
                                          isHovered
                                             ? "text-blue-600 font-medium opacity-100"
                                             : "text-gray-400 opacity-0"
                                       }
                                    `}
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
