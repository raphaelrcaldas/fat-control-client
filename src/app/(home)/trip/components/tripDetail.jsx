import { useState, useEffect } from "react";
import { useForm } from "react-hook-form"

import { Modal, Button, TextInput, Label, Checkbox, Table } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { GoPlus } from "react-icons/go";
import { FaEdit } from "react-icons/fa";
import { onlyText } from "../../../../../utils/textFormat";
import { updateTripAPI } from "../../../../../services/api/trips";


export function TripDetail({ trip, update }) {
    const [show, setShow] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            trig: trip.trig,
            active: trip.active,
        },
    });

    // function addFuncToList() {
    //     if (funcao && oper) {
    //         const filterFuncs = funcoes.filter(f =>
    //             (f.funcao == funcao)
    //         )

    //         if (filterFuncs.length == 0) {
    //             const newFunc = {
    //                 func: funcao,
    //                 oper: oper,
    //                 proj: 'kc-390',
    //             }

    //             setFuncs([...funcoes, newFunc]);

    //             setFuncao('');
    //             setOper('');
    //         } else {
    //             alert('Função já cadastrada')
    //         }
    //     }
    // }

    // function exFunc(funcao) {
    //     const newFuncs = funcoes.filter(
    //         f => (f.funcao != funcao)
    //     )

    //     setFuncs(newFuncs);
    // }

    function closeModal() {
        reset();
        setShow(false);
    }

    async function updateTrip(data) {
        data.trig = data.trig.toLowerCase();

        const checkTrig = data.trig != trip.trig;
        const checkActive = data.active != trip.active;

        if (checkActive || checkTrig) {
            const res = await updateTripAPI(trip.id, data);
            const resJson = await res.json();
            alert(resJson.detail)

            if (res.ok) {
                update();
                closeModal();
            }
        }

        closeModal();
    }

    useEffect(() => {
        if (show) {
            setValue('trig', trip.trig.toUpperCase());
        }
    }, [show]);

    // console.log(trip.funcs)


    return (
        <>
            <Button className="p-0" color='light' onClick={() => setShow(true)}>
                <IoMdInformationCircleOutline className="h-6 w-6" />
            </Button>

            {show &&
                <Modal show={show} size='md' onClose={closeModal} popup>
                    <Modal.Header>Detalhes Tripulante</Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit(updateTrip)}>
                            <div className="m-4 text-base uppercase text-center">
                                <div className="font-semibold">
                                    {`${trip.user.p_g} ${trip.user.esp} ${trip.user.nome_guerra} - ${trip.user.unidade}`}
                                </div>
                                <div className="mt-1">
                                    {trip.user.nome_completo}
                                </div>
                            </div>
                            <div className="flex gap-6 ">
                                <div className="grid py-2 w-1/2 gap-2 justify-items-center shadow-md bg-gray-100 rounded-lg">
                                    <Label className="content-center">Trigrama</Label>
                                    <TextInput
                                        {...register
                                            ('trig', {
                                                required: true,
                                                // setValueAs: t => t.toLowerCase(),
                                            })
                                        }
                                        autoComplete="off"
                                        className="w-16"
                                        maxLength={3}
                                        minLength={3}
                                        onKeyPress={(event) => onlyText(event)}
                                    />
                                </div>
                                <div className="grid w-1/2 py-2 justify-items-center gap-1 shadow-md bg-gray-100 rounded-lg">
                                    <Label className="content-center">Ativo</Label>
                                    <Checkbox {...register('active')} className="h-6 w-6" />
                                </div>
                            </div>

                            <div className="mt-4 min-h-24 bg-gray-100 overflow-auto shadow-md">
                                <Table className="text-center uppercase" hoverable>
                                    <Table.Head className="sticky top-0">
                                        <Table.HeadCell>Função</Table.HeadCell>
                                        <Table.HeadCell>Oper</Table.HeadCell>
                                        <Table.HeadCell>Data OP</Table.HeadCell>
                                        <Table.HeadCell></Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body>
                                        {
                                            trip.funcs.map((funcao, index) => {

                                                let data_oper;
                                                if (funcao.data_op) {
                                                    const [year, mounth, day] = funcao.data_op.split("-");
                                                    data_oper = `${day}/${mounth}/${year.slice(2)}`;
                                                } else {
                                                    data_oper = 'NIL';
                                                }

                                                return (
                                                    <Table.Row
                                                        className="border-2 border-b hover:font-semibold"
                                                        key={index}
                                                    >
                                                        <Table.Cell>{funcao.func}</Table.Cell>
                                                        <Table.Cell>{funcao.oper}</Table.Cell>
                                                        <Table.Cell>{data_oper}</Table.Cell>
                                                        <Table.Cell>
                                                            <FaEdit className="cursor-pointer h-5 w-5" />
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )
                                            })
                                        }
                                    </Table.Body>
                                </Table>

                                <div className="m-2 justify-items-center">
                                    <Button pill>
                                        <GoPlus className="mr-1 h-5 w-5" /> Função
                                    </Button>
                                </div>
                            </div>



                            <div className="grid mt-9 justify-center">
                                <Button color="blue" type="submit" >OK</Button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            }
        </>
    )
}
