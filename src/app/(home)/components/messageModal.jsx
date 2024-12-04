'use client'

import { Button, Modal } from 'flowbite-react';
import { MdCheckCircle,MdError,MdOutlineDelete } from "react-icons/md";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useState } from 'react';


export function MessageModal({ msg, active, callFunc, typeMsg }) {
  let Icon;

  switch (typeMsg) {
    case 'success':
      Icon = MdCheckCircle;
    case 'failure':
      Icon = MdError;
  }

  return (
    <>
      <Modal show={active} size="md" onClose={() => callFunc(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <Icon className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {msg}
            </h3>
            <div className="flex justify-center gap-4">
              <Button color={typeMsg} onClick={() => callFunc(false)}>
                OK
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}


export function QuestionExclude({ callFunc }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button color={'red'} onClick={() => setOpenModal(true)}><MdOutlineDelete /></Button>

      <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Tem certeza que deseja deletar este usuário ?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={callFunc}>
                Sim, deletar
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                Não, cancelar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
