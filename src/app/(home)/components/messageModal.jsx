'use client'

import { Button, Modal } from 'flowbite-react';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import ErrorSharpIcon from '@mui/icons-material/ErrorSharp';



export default function MessageModal({ msg, active, callFunc, typeMsg }) {
  let Icon;
  if (typeMsg == "success") {
    Icon = CheckCircleSharpIcon;
  }

  if (typeMsg == "failure") {
    Icon = ErrorSharpIcon;
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