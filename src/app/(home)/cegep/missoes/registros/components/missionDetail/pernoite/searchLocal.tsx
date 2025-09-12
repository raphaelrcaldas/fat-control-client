import {
   Modal,
   ModalHeader,
   ModalBody,
   TextInput,
   Button,
   Spinner,
} from "flowbite-react";
import { useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { getCities } from "services/routes/cities";

export function SearchLocal({ show, setShow, setLocal }) {
   const [cities, setCities] = useState([]);
   const [searchCity, setSearchCity] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   function searchCities() {
      const searchData = searchCity.trim();
      if (searchData != "") {
         setIsLoading(true);
         getCities(searchCity).then((data) => {
            setCities(data);
            setIsLoading(false);
         });
      }
   }

   function onClose() {
      setSearchCity("");
      setCities([]);
      setShow(false);
   }

   function onSetLocal(local) {
      setLocal(local);
      onClose();
   }

   return (
      <Modal size='md' show={show} onClose={() => setShow(false)}>
         <ModalHeader>Buscar Cidade</ModalHeader>
         <ModalBody>
            <div>
               <div className='justify-evenly flex flex-row'>
                  <TextInput
                     placeholder='Insira o nome da cidade'
                     className='w-2/3'
                     value={searchCity}
                     onChange={(e) => setSearchCity(e.target.value)}
                     onKeyDown={(e) => {
                        if (
                           !e.key.match(/^[a-zA-ZÀ-ÿ\s]$/) &&
                           e.key !== "Backspace" &&
                           e.key !== "Tab"
                        ) {
                           e.preventDefault();
                        }

                        if (e.key === "Enter") {
                           searchCities();
                        }
                     }}
                  />
                  <Button
                     onClick={searchCities}
                     disabled={isLoading}
                     color='light'
                  >
                     {isLoading ? (
                        <Spinner />
                     ) : (
                        <IoMdSearch className='size-5' />
                     )}
                  </Button>
               </div>

               <div className='flex flex-col mt-2 p-2 bg-slate-100 min-h-40 rounded-lg'>
                  {cities.length == 0 ? (
                     <span className='w-full text-center'>
                        Nenhum resultado encontrado
                     </span>
                  ) : (
                     cities.map((citie, index) => {
                        return (
                           <div
                              key={index}
                              className='flex flex-row p-1 gap-2 items-center border-b hover:bg-slate-200 hover:font-medium'
                           >
                              <FaCheckSquare
                                 onClick={() => onSetLocal(citie)}
                                 className='size-7 text-blue-400 hover:text-blue-600 cursor-pointer'
                              />
                              <span className='p-1 text-base'>
                                 {citie.nome}-{citie.uf}
                              </span>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </ModalBody>
      </Modal>
   );
}
