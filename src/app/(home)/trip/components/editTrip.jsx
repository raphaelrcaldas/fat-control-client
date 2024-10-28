import { Modal, Button, Label, TextInput, Table } from "flowbite-react";
import DriveFileRenameOutlineSharpIcon from '@mui/icons-material/DriveFileRenameOutlineSharp';
import { useState } from "react";
import { validateNoNumber } from "../../../../../utils/textFormat";
import { SelectFuncao, SelectOper } from "../../components/inputForm";
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import ClearSharpIcon from '@mui/icons-material/ClearSharp';


export function EditTrip({ trip, callFunc }) {
  const [openModal, setOpenModal] = useState(false);
  const [funcao, setFuncao] = useState('');
  const [oper, setOper] = useState('');
  const [funcoes, setFuncs] = useState(trip.funcs);
  const [trig, setTrig] = useState(trip.trig.toUpperCase());

  console.log(trip)

  return (
    <>
      <Button color={'light'} onClick={() => setOpenModal(true)}><DriveFileRenameOutlineSharpIcon /></Button>

      <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
        <Modal.Header children={'Editar Tripulante'} />
        <Modal.Body>
          <div className="m-4 text-base uppercase text-center">
            <div>
              {`${trip.user.p_g} ${trip.user.esp} ${trip.user.nome_guerra}`}
            </div>
          </div>
          <div className="flex py-2 gap-4 justify-center shadow-md bg-gray-100 rounded-lg">
            <Label
              children={'Trigrama'}
              className="content-center"
            />
            <TextInput
              className="w-16"
              maxLength={3}
              minLength={3}
              value={trig}
              onChange={e => setTrig(e.target.value)}
              onKeyPress={(event) => validateNoNumber(event)}
            />
          </div>

          <div className="mt-4 p-3 text-center bg-gray-100 rounded-lg shadow-md">
            <h3>Adicionar Função</h3>
            <div className="flex mt-2 gap-2">
              <div className="flex justify-around w-52">
                <SelectFuncao callFunc={setFuncao} value={funcao} />
                <SelectOper callFunc={setOper} value={oper} />
              </div>

              <div className="grid w-20 content-center justify-center">
                <AddBoxSharpIcon
                  className="cursor-pointer"
                  fontSize="large"
                  color="info"
                  // onClick={addFuncToList}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 h-56 bg-gray-100 overflow-auto shadow-md">
            <Table className="text-center uppercase" hoverable>
              <Table.Head className="sticky top-0">
                <Table.HeadCell>Função</Table.HeadCell>
                <Table.HeadCell>Oper</Table.HeadCell>
                <Table.HeadCell>
                  <span></span>
                </Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {
                  funcoes.map((funcao, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{funcao.func}</Table.Cell>
                      <Table.Cell>{funcao.oper}</Table.Cell>
                      <Table.Cell>
                        <ClearSharpIcon
                          className="cursor-pointer"
                          // onClick={() => exFunc(funcao.funcao)}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))
                }
              </Table.Body>
            </Table>
          </div>

          <div className="grid mt-9 justify-center">
            <Button>
              {/* onClick={addTrip}> */}
              Salvar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

// export function addTrip({ callFunc }) {
//   const [openModal, setOpenModal] = useState(false);

//   return (
//     <>
//       <Button onClick={() => setOpenModal(true)}><GoPlus /></Button>

//       <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>

//         <Modal.Body>
//           {/* <div className="text-center">
//               <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
//               <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
//                 Tem certeza que deseja deletar este usuário ?
//               </h3>
//               <div className="flex justify-center gap-4">
//                 <Button color="failure" onClick={callFunc}>
//                   Sim, deletar
//                 </Button>
//                 <Button color="gray" onClick={() => setOpenModal(false)}>
//                   Não, cancelar
//                 </Button>
//               </div>
//             </div> */}
//         </Modal.Body>
//       </Modal>
//     </>
//   );
// }
