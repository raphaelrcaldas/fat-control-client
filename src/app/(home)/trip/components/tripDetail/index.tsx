import { useState, useCallback } from "react";
import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { FaEdit } from "react-icons/fa";
import { TripEditForm } from "./TripEditForm";
import { FuncList } from "./FuncList";
import { FuncAddModal } from "./FuncAddModal";
import { FuncEditModal } from "./FuncEditModal";
import { FuncDeleteModal } from "./FuncDeleteModal";
import type { Trip, CrewFunc } from "../../types/trip.types";

type TripDetailProps = {
   trip: Trip;
   update: () => void;
};

export function TripDetail({ trip, update }: TripDetailProps) {
   const [show, setShow] = useState(false);
   const [showAddFunc, setShowAddFunc] = useState(false);
   const [showEditFunc, setShowEditFunc] = useState(false);
   const [showDeleteFunc, setShowDeleteFunc] = useState(false);
   const [editingFunc, setEditingFunc] = useState<CrewFunc | null>(null);
   const [deletingFunc, setDeletingFunc] = useState<CrewFunc | null>(null);

   const handleShow = useCallback(() => setShow(true), []);
   const handleClose = useCallback(() => setShow(false), []);

   const handleShowAddFunc = useCallback(() => {
      setShowAddFunc(true);
      setEditingFunc(null);
   }, []);

   const handleCloseAddFunc = useCallback(() => {
      setShowAddFunc(false);
      setEditingFunc(null);
   }, []);

   const handleShowEditFunc = useCallback((func: CrewFunc) => {
      setEditingFunc(func);
      setShowEditFunc(true);
   }, []);

   const handleCloseEditFunc = useCallback(() => {
      setShowEditFunc(false);
      setEditingFunc(null);
   }, []);

   const handleShowDeleteFunc = useCallback((func: CrewFunc) => {
      setDeletingFunc(func);
      setShowDeleteFunc(true);
   }, []);

   const handleCloseDeleteFunc = useCallback(() => {
      setShowDeleteFunc(false);
      setDeletingFunc(null);
   }, []);

   return (
      <div>
         <button
            className='text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-4 focus:ring-red-100 font-medium rounded-lg text-sm p-2.5 transition-all'
            onClick={handleShow}
            title='Editar tripulante'
         >
            <FaEdit className='size-5' />
         </button>

         <Modal show={show} onClose={handleClose} size='lg'>
            <ModalHeader>Editar Tripulante</ModalHeader>
            <ModalBody>
               <TripEditForm
                  trip={trip}
                  onSuccess={update}
                  onClose={handleClose}
                  onCancel={handleClose}
               />

               <div className='mt-5'>
                  <FuncList
                     funcs={trip.funcs || []}
                     onAdd={handleShowAddFunc}
                     onEdit={handleShowEditFunc}
                     onDelete={handleShowDeleteFunc}
                  />
               </div>
            </ModalBody>
         </Modal>

         <FuncAddModal
            show={showAddFunc}
            onClose={handleCloseAddFunc}
            trip={trip}
            onSuccess={update}
         />

         {editingFunc && (
            <FuncEditModal
               show={showEditFunc}
               onClose={handleCloseEditFunc}
               trip={trip}
               editingFunc={editingFunc}
               onSuccess={update}
            />
         )}

         <FuncDeleteModal
            show={showDeleteFunc}
            onClose={handleCloseDeleteFunc}
            deletingFunc={deletingFunc}
            onSuccess={update}
         />
      </div>
   );
}
