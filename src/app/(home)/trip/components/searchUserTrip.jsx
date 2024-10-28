import { GoPlus } from "react-icons/go";
import { Modal, Button, Table, TextInput, Label} from "flowbite-react";
import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import ClearSharpIcon from '@mui/icons-material/ClearSharp';
import { getUsersAPI } from "../../../../../services/api/users";
import { validateNoNumber } from "../../../../../utils/textFormat";
import { SelectFuncao, SelectOper } from "../../components/inputForm";
import { addTripAPI } from "../../../../../services/api/trips";
import { MessageModal } from "../../components/messageModal";

function AddTripModal({ user, update }) {
    const [show, setShow] = useState(false);
    const [funcao, setFuncao] = useState('');
    const [oper, setOper] = useState('');
    const [funcoes, setFuncs] = useState([]);
    const [trig, setTrig] = useState('');

    const [messageModal, setMessageModal] = useState(false);
    const [msgToModal, setMsgToModal] = useState('');
    const [typeMsg, setTypeMsg] = useState('success');

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
        cleanModal();
        setShow(false);
    }

    function cleanModal() {
        setFuncao('');
        setOper('');
        setFuncs([]);
        setTrig('');
    }

    async function addTrip() {
        const newTrip = {
            user_id: user.id,
            trig: trig.toLowerCase(),
            uae: '11gt',
            funcs: funcoes
        }

        const response = await addTripAPI(newTrip);
        const dataRes = await response.json();

        if (response.ok) {
            setTypeMsg('success');
            setMsgToModal("Adicionado com sucesso");
            cleanModal();
            update();
        } else {
            setTypeMsg('failure')
            setMsgToModal(dataRes.detail);
        }
        setMessageModal(true);
    }

    return (
        <>
            <AddBoxSharpIcon
                className="cursor-pointer"
                fontSize="medium"
                color="info"
                onClick={() => setShow(true)}
            />

            <Modal show={show} size='sm' onClose={closeModal} popup>
                <Modal.Header children={'Cadastro Tripulante'} />
                <Modal.Body>
                    <div className="m-4 text-base uppercase text-center">
                        <div>
                            {`${user.p_g} ${user.esp} ${user.nome_guerra} - ${user.unidade}`}
                        </div>
                        <div className="mt-1">
                            {user.nome_completo}
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
                    </div>

                    <div className="grid mt-9 justify-center">
                        <Button onClick={addTrip}>Salvar</Button>
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
    )
}


export function SearchUser({ trips, updateTrips }) {
    const [openAddTrip, setAddTrip] = useState(false);
    const [usersTrip, setUsersTrip] = useState([]);
    const [userSearchInput, setSearchInput] = useState('');


    function getTripFromUserID(userID) {
        return trips.filter(trip => trip.user.id == userID)
    }

    async function searchUserForTrip() {
        let users = await getUsersAPI()
            .then(res => res.json())
            .then(users => users.data)

        // FILTRAR USUARIOS QUE NÃO SÃO TRIPULANTES
        users = users.filter(user => {
            const search = getTripFromUserID(user.id);
            if (search.length > 0) {
                return false;
            } else {
                return true;
            }
        })

        // FILTRAR USUARIOS DE ACORDO COM O TEXT_INPUT
        users = users.filter(user => {
            const filter = userSearchInput.toLowerCase();
            const guerra = user.nome_guerra.includes(filter)
            const completo = user.nome_completo.includes(filter)

            return (guerra || completo)
        })
        setUsersTrip(users);
    }

    function closeAddTripModal() {
        setSearchInput('');
        setUsersTrip([]);
        setAddTrip(false);
    }


    return (
        <>
            <Button onClick={() => setAddTrip(true)}>
                <GoPlus className="mr-2 h-5 w-5" /> Adicionar
            </Button>

            <Modal show={openAddTrip} size="md" onClose={closeAddTripModal} popup>
                <Modal.Header />
                <Modal.Body>
                    <h3 className="mb-7 text-xl text-center font-semibold">Adicionar Tripulante</h3>
                    <div className="flex gap-2 justify-between">
                        <TextInput
                            className="w-full"
                            placeholder="Search for User"
                            value={userSearchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                        />
                        <Button onClick={searchUserForTrip}>
                            <IoSearchSharp className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="mt-8 overflow shadow-lg h-72 bg-gray-100 rounded-lg">
                        <Table hoverable>
                            {/* <Table.Head>
                                <Table.HeadCell className="text-center">Nome de Guerra</Table.HeadCell>
                                <Table.HeadCell>
                                    <span className="sr-only">action</span>
                                </Table.HeadCell>
                            </Table.Head> */}
                            <Table.Body>
                                {
                                    usersTrip.map((user) => {
                                        const pg = user.p_g;
                                        const esp = user.esp;
                                        const guerra = user.nome_guerra;

                                        return (
                                            <Table.Row key={user.id}>
                                                <Table.Cell className="text-center uppercase">
                                                    {`${pg} ${esp} ${guerra}`}
                                                </Table.Cell>
                                                <Table.Cell className="w-10">
                                                    <AddTripModal user={user} update={updateTrips} />
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    }
                                    )
                                }

                            </Table.Body>
                        </Table>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}