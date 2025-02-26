"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Button, Modal } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const msgContext = createContext({});

export const MsgProvider = ({ children }) => {
   const [isOpen, setIsOpen] = useState(false);

   const openModal = () => setIsOpen(true);
   const closeModal = () => setIsOpen(false);

   return (
      <msgContext.Provider value={{ isOpen, openModal, closeModal }}>
         {children}
         <MsgModal />
      </msgContext.Provider>
   );
};

export function useMsg() {
   return useContext(msgContext);
}

function MsgModal() {
   const { isOpen, closeModal } = useMsg();

   return (
      <>
         <Modal show={isOpen} size='md' onClose={closeModal} popup>
            <Modal.Header />
            <Modal.Body>
               <div className='text-center'>
                  <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200' />
                  <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
                     Are you sure you want to delete this product?
                  </h3>
                  <div className='flex justify-center gap-4'>
                     <Button color='failure' onClick={closeModal}>
                        {"Yes, I'm sure"}
                     </Button>
                     <Button color='gray' onClick={closeModal}>
                        No, cancel
                     </Button>
                  </div>
               </div>
            </Modal.Body>
         </Modal>
      </>
   );
}
