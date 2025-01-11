import { useState } from "react";
import { Modal, Button, TextInput, Label } from "flowbite-react";
import { useForm } from "react-hook-form"
import { IoMdAdd } from "react-icons/io";

import { addTrip } from "../../../../../services/routes/trips";
import { onlyText } from "../../../../../utils/textFormat";


export function TripRegister({ uae, user, update }) {
    const [show, setShow] = useState(false);
    const { register, handleSubmit, reset, } = useForm({
        defaultValues: {
            user_id: user.id,
            active: true,
            uae: uae,
        },
    });

    function addFuncToList() {
        if (funcao && oper) {
            const filterFuncs = funcoes.filter(f =>
                (f.funcao == funcao)
            )

            if (filterFuncs.length == 0) {
                const newFunc = {
                    func: funcao,
                    oper: oper,
                    proj: 'kc-390',
                }

                setFuncs([...funcoes, newFunc]);

                setFuncao('');
                setOper('');
            } else {
                alert('Função já cadastrada')
            }
        }
    }

    function exFunc(funcao) {
        const newFuncs = funcoes.filter(
            f => (f.funcao != funcao)
        )

        setFuncs(newFuncs);
    }

    function closeModal() {
        reset();
        setShow(false);
    }

    async function registerTrip(data) {
        const response = await addTripAPI(data);
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
                className="cursor-pointer text-white bg-blue-700 h-6 w-6"
                onClick={() => setShow(true)}
            />

            <Modal show={show} size='sm' onClose={closeModal} popup>
                <Modal.Header>Cadastro Tripulante</Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit(registerTrip)}>
                        <div className="m-4 text-base uppercase text-center">
                            <div className="font-semibold">
                                {`${user.p_g} ${user.esp} ${user.nome_guerra} - ${user.unidade}`}
                            </div>
                            <div className="mt-1">
                                {user.nome_completo}
                            </div>
                        </div>
                        <div className="flex py-2 gap-4 justify-center shadow-md bg-gray-100 rounded-lg">
                            <Label className="content-center">Trigrama</Label>
                            <TextInput
                                {...register
                                    ('trig', {
                                        required: true,
                                        setValueAs: t => t.toLowerCase(),
                                    })
                                }
                                autoComplete="off"
                                className="w-16"
                                maxLength={3}
                                minLength={3}
                                onKeyPress={(event) => onlyText(event)}
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

                        <div className="grid mt-9 justify-center">
                            <Button type="submit">Salvar</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal >
        </>
    )
}
