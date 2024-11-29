import { VscAdd } from "react-icons/vsc";
import { useState, useEffect } from "react";
import { Button, Label, Datepicker, Modal, Textarea } from "flowbite-react";
import { NumberInput } from "../../components/numberInput";
import { addQuadAPI } from "../../../../../services/api/quads";
import { MessageModal } from "../../components/messageModal";
import { IoMdClose } from "react-icons/io";


export default function AddQuadModal({ func, type, callFunc }) {
    const [openModal, setOpenModal] = useState(false);
    const [date, setDate] = useState('');
    const [obs, setObs] = useState('');
    const [lastro, setLastro] = useState(0);

    const [messageModal, setMessageModal] = useState(false);
    const [msgToModal, setMsgToModal] = useState('');
    const [typeMsg, setTypeMsg] = useState('success');

    function onSelectDate(dateObject) {
        setDate(dateObject.toLocaleDateString('pt-br'))
    }

    function dateStrToVal(dateStr) {
        const [d, m, y] = dateStr.split('/');

        return new Date(y, m - 1, d).valueOf()
    }

    function cleanModal() {
        setDate('');
        setObs('');
        setLastro(0);
    }

    function onClose() {
        cleanModal();
        setOpenModal(false);
    }

    async function addQuad() {
        if (lastro > 0 || date) {

            const quad = {
                trip_id: func.trip.id,
                value: (lastro > 0) ? 0 : dateStrToVal(date),
                description: obs,
                type: type
            };

            const quads = lastro > 0 ? Array(lastro).fill(quad) : [quad]

            const response = await addQuadAPI(quads);
            const dataRes = await response.json();

            if (response.ok) {
                alert("Adicionado com sucesso");
                cleanModal();
                callFunc();
            } else {
                alert(dataRes.detail);
            }
        } else {
            alert("Insira lastros ou uma data")
        }
    }

    return (
        <>
            <VscAdd
                className="cursor-pointer p-0 h-5 w-5"
                onClick={() => setOpenModal(true)}
            />

            <Modal className="h-46" show={openModal} size="lg" onClose={() => onClose()} popup>
                <Modal.Header children={'Adicionar Quadrinho'} />
                <Modal.Body>
                    <div className="text-center uppercase font-semibold">
                        <h3>
                            {`${func.trip.user.p_g} ${func.trip.user.nome_guerra} `}
                        </h3>
                        <h3>{`${func.func} ${func.oper}`}</h3>
                        <h3>{`${func.proj}`}</h3>
                    </div>

                    <div className="grid justify-center mt-6 h-96 text-center">
                        <div className="w-60 grid justify-center bg-gray-100 py-4 rounded-lg shadow-md">
                            <Label className="text-base">Data</Label>
                            <div className="flex gap-4 items-center">
                                <Datepicker
                                    className="w-36"
                                    language="pt-BR"
                                    showClearButton={false}
                                    showTodayButton={false}
                                    value={date}
                                    maxDate={new Date()}
                                    autoHide={true}
                                    onSelectedDateChanged={(e) => onSelectDate(e)}
                                />

                                {/* < IoMdClose
                                    className="text-xl cursor-pointer"
                                    onClick={() => setDate(null)}
                                /> */}
                            </div>

                        </div>
                        <div className="mt-6 flex items-center w-60 bg-gray-100 rounded-lg shadow-md justify-evenly py-2">
                            <Label className="text-base">Lastro</Label>
                            <NumberInput
                                disabled={date ? true : false}
                                value={lastro}
                                onChange={(e, val) => setLastro(val)}
                            />

                        </div>
                        <div className="mt-6 w-60 rounded-lg shadow-md">
                            <Textarea
                                // value={obs}
                                className="text-base h-full"
                                onChange={(e) => setObs(e.target.value)}
                                placeholder="Observações"
                            />
                        </div>
                    </div>


                    <div className="mt-6 grid justify-center">
                        <Button onClick={addQuad}>
                            Adicionar
                        </Button>
                    </div>

                </Modal.Body>
            </Modal>
            <MessageModal
                active={messageModal}
                callFunc={setMessageModal}
                msg={msgToModal}
                typeMsg={typeMsg}
            />
        </>
    );
}
