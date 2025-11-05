import { useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalHeader,
   TextInput,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { addTrip } from "services/routes/trips";

type TripFormFields = {
   user_id: number;
   active: boolean;
   uae: string;
   trig: string;
};

export function TripRegister({ uae, user, update }) {
   const [show, setShow] = useState(false);
   const { register, handleSubmit, reset } = useForm<TripFormFields>({
      defaultValues: {
         user_id: user.id,
         active: true,
         uae: uae,
         trig: "",
      },
   });

   function closeModal() {
      reset();
      setShow(false);
   }

   async function registerTrip(data) {
      const response = await addTrip(data);
      const dataRes = await response.json();

      if (response.ok) {
         update();
         closeModal();
      }

      alert(dataRes.detail);
   }

   return (
      <>
         <IoMdAdd
            className='cursor-pointer text-white bg-blue-700 h-6 w-6'
            onClick={() => setShow(true)}
         />

         <Modal show={show} size='sm' onClose={closeModal} popup>
            <ModalHeader>Cadastro Tripulante</ModalHeader>
            <ModalBody>
               <form onSubmit={handleSubmit(registerTrip)}>
                  <div className='m-4 text-base uppercase text-center'>
                     <div className='font-semibold'>
                        {`${user.posto.short} ${user.esp} ${user.nome_guerra} - ${user.unidade}`}
                     </div>
                     <div className='mt-1'>{user.nome_completo}</div>
                  </div>
                  <div className='flex py-2 gap-4 justify-center shadow-md bg-gray-100 rounded-lg'>
                     <Label className='content-center'>Trigrama</Label>
                     <TextInput
                        {...register("trig", {
                           required: true,
                           setValueAs: (t) => t.toLowerCase(),
                        })}
                        autoComplete='off'
                        className='w-16'
                        maxLength={3}
                        minLength={3}
                        onKeyDown={(e) => {
                           if (
                              !e.key.match(/^[a-zA-Z]$/) &&
                              e.key !== "Backspace" &&
                              e.key !== "Delete" &&
                              e.key !== "Tab"
                           ) {
                              e.preventDefault();
                           }
                        }}
                     />
                  </div>

                  {/* <div className="mt-4 p-3 text-center bg-gray-100 rounded-lg shadow-md">
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
                                    onClick={addFuncToList}
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
                                {funcoes.map((funcao, index) => (
                                    <Table.Row key={index}>
                                        <Table.Cell>{funcao.func}</Table.Cell>
                                        <Table.Cell>{funcao.oper}</Table.Cell>
                                        <Table.Cell>
                                            <ClearSharpIcon
                                                className="cursor-pointer"
                                                onClick={() => exFunc(funcao.funcao)}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                ))}

                            </Table.Body>
                        </Table>
                    </div> */}

                  <div className='grid mt-9 justify-center'>
                     <Button color='blue' type='submit'>
                        Salvar
                     </Button>
                  </div>
               </form>
            </ModalBody>
         </Modal>
      </>
   );
}
