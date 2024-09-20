"use client";

import MessageModal from "../../components/messageModal";
import { Button, Label, Modal } from "flowbite-react";
import { useState } from "react";
import { addUserAPI, getUserById, updateUser } from "../../../../../services/api/users";
import pgs from "../../../../../public/infoFAB/infoPGs";
import unidades_bagl from "../../../../../public/infoFAB/infoOMs";
import { SelectPostoGrad, SelectOMs, InputEsp, InputNome, InputNumeric, InputEmail } from "../../components/inputForm";
import { cleanText } from "../../../../../utils/textFormat";
import DefaultDatePicker from "../../components/defaultDatePicker";

function UserForm({
    title,
    postoGrad,
    esp,
    nomeGuerra,
    nomeCompleto,
    unidade,
    saram,
    id_fab,
    cpf,
    zimbra,
    email_pess,
    nasc,
    promo,
}) {


    return (
        <>
            <h3 className="mb-7 text-xl text-center font-semibold">{title}</h3>
            <div className="space-y-6 text-center text-base">
                <div className="flex justify-around">
                    <div className="mx-2.5">
                        <Label className="mb-2 block" value="P/G" />
                        {postoGrad}
                    </div>
                    <div className="w-24">
                        <Label className="mb-2 block" value="Especialidade" />
                        {esp}
                    </div>
                    <div className="mx-2.5">
                        <Label className="mb-2 block" value="Nome de Guerra" />
                        {nomeGuerra}
                    </div>
                </div>

                <div className="flex justify-start">
                    <div className="w-72">
                        <Label className="mb-2 block" value="Nome completo" />
                        {nomeCompleto}
                    </div>

                    <div className="mx-4">
                        <Label className="mb-2 block" value="Unidade" />
                        {unidade}
                    </div>
                </div>

                <div className="flex justify-around">
                    <div className="mx-2.5">
                        <Label className="mb-2 block">SARAM</Label>
                        {saram}
                    </div>

                    <div className="mx-2.5">
                        <Label className="mb-2 block">ID FAB</Label>
                        {id_fab}
                    </div>

                    <div className="mx-2.5">
                        <Label className="mb-2 block w-40">CPF</Label>
                        {cpf}
                    </div>

                </div>

                <div className="flex justify-between">
                    <div className="w-52">
                        <Label className="mb-2 block" value="Zimbra" />
                        {zimbra}
                    </div>
                    <div className="w-52">
                        <Label className="mb-2 block" value="Email particular" />
                        {email_pess}
                    </div>
                </div>

                <div className="flex justify-between">
                    <div className="w-52">
                        <Label className="mb-2 block" value="Data de Nascimento" />
                        {nasc}
                    </div>

                    <div className="w-52">
                        <Label className="mb-2 block" value="Última Promoção" />
                        {promo}
                    </div>
                </div>

            </div>
        </>
    );
}


export function UserDetail({ user_id }) {
    const [show, setShow] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [userId, setUser] = useState(user_id);

    const [postoGrad, setPostoGrad] = useState('');
    const [esp, setEsp] = useState('');
    const [nomeGuerra, setNomeGuerra] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [unidade, setUnidade] = useState('');
    const [saram, setSaram] = useState('');
    const [idFAB, setIdFAB] = useState(null);
    const [cpf, setCPF] = useState('');
    const [zimbra, setZimbra] = useState('');
    const [email, setEmail] = useState('');
    const [nasc, setNasc] = useState(null);
    const [promo, setPromo] = useState(null);

    function onOpenDetail() {
        getUserById(userId).then(res => res.json())
            .then(data => {
                setPostoGrad(data.p_g)
                setEsp(data.esp.toUpperCase())
                setNomeGuerra(data.nome_guerra.toUpperCase())
                setNomeCompleto(data.nome_completo.toUpperCase())
                setUnidade(data.unidade)
                setSaram(data.saram)
                setIdFAB(data.id_fab)
                setCPF(data.cpf)
                setZimbra(data.email_fab)
                setEmail(data.email_pess)
                setNasc(data.nasc)
                setPromo(data.ult_promo)

                setShow(true)
            }
            );
    }

    async function onUpdateUser(event) {
        event.preventDefault()

        const user = {
            p_g: postoGrad,
            nome_guerra: cleanText(nomeGuerra),
            nome_completo: cleanText(nomeCompleto),
            esp: cleanText(esp),
            unidade: unidade,
            id_fab: idFAB,
            saram: saram,
            cpf: cpf,
            ult_promo: promo ? promo : null,
            nasc: nasc ? nasc : null,
            email_pess: cleanText(emailPes),
            email_fab: cleanText(emailFAB),
        };

        const response = await updateUser(userId, user);
        const dataRes = await response.json();
        // chamar API


        setEditMode(false);
    }

    function filterTxt(string) {
        if (!string) {
            return "NIL"
        } else {
            return string
        }
    }


    function dateForm(dateStr) {
        // 2018-05-25
        if (dateStr) {
            const [a, m, d] = dateStr.split("-");
            return `${d}/${m}/${a}`
        }
    }


    function onCloseModal() {
        setEditMode(false);
        setShow(false)
    }

    return (
        <>
            <Button variant="text" color={"gray"} onClick={onOpenDetail}>Detalhes</Button>

            {show &&
                <Modal show={show} size="lg" onClose={onCloseModal} popup>
                    <Modal.Header />
                    <Modal.Body>
                        <form onSubmit={(e) => onUpdateUser(e)}>
                            <UserForm
                                title={
                                    (editMode ? "Editar " : "") + "Informações do Usuário"
                                }
                                postoGrad={
                                    editMode ? <SelectPostoGrad value={postoGrad} callFunc={setPostoGrad} /> : pgs[postoGrad].pg.mid
                                }
                                esp={
                                    editMode ? <InputEsp callFunc={setEsp} value={esp} /> : esp
                                }
                                nomeGuerra={
                                    editMode ? <InputNome callFunc={setNomeGuerra} value={nomeGuerra} /> : nomeGuerra
                                }
                                nomeCompleto={
                                    editMode ? <InputNome callFunc={setNomeCompleto} value={nomeCompleto} /> : nomeCompleto
                                }
                                unidade={
                                    editMode ? <SelectOMs callFunc={setUnidade} value={unidade} /> : unidades_bagl[unidade].value
                                }
                                saram={
                                    editMode ? <InputNumeric callFunc={setSaram} value={saram} len={7} /> : saram
                                }
                                id_fab={
                                    editMode ? <InputNumeric callFunc={setIdFAB} value={idFAB} len={6} /> : idFAB
                                }
                                cpf={
                                    editMode ? <InputNumeric callFunc={setCPF} value={cpf} len={11} /> : cpf
                                }
                                zimbra={
                                    editMode ? <InputEmail callFunc={setZimbra} value={zimbra} /> : filterTxt(zimbra)
                                }
                                email_pess={
                                    editMode ? <InputEmail callFunc={setEmail} value={email} /> : filterTxt(email)
                                }
                                nasc={
                                    editMode ? <DefaultDatePicker callFunc={setNasc} value={nasc} /> : filterTxt(dateForm(nasc))
                                }
                                promo={
                                    editMode ? <DefaultDatePicker callFunc={setPromo} value={promo} /> : filterTxt(dateForm(promo))
                                }
                            />

                            <div className={(editMode ? "" : "hidden ") + "grid justify-center mt-8"}>
                                <Button type="submit" className="w-40">Salvar</Button>
                            </div>
                        </form>

                    </Modal.Body>
                    <Modal.Footer className={(editMode ? "hidden " : "") + "justify-center"}>
                        <Button className="w-40" onClick={() => setEditMode(true)}>Editar</Button>
                    </Modal.Footer>
                </Modal>
            }

        </>
    )
}


export function UserRegister({ afterAdd }) {
    const [show, setShow] = useState(false);

    const [messageModal, setMessageModal] = useState(false);
    const [msgToModal, setMsgToModal] = useState('');
    const [typeMsgModal, setTypeMsgModal] = useState('success');

    const [postoGrad, setPostoGrad] = useState('');
    const [esp, setEsp] = useState('');
    const [nomeGuerra, setNomeGuerra] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [unidade, setUnidade] = useState('');
    const [saram, setSaram] = useState('');
    const [idfab, setIdfab] = useState('');
    const [cpf, setCPF] = useState('');

    const [emailPes, setEmailPes] = useState('');
    const [emailFAB, setEmailFAB] = useState('');
    const [nasc, setNasc] = useState(null);
    const [promo, setPromo] = useState(null);

    function cleanModal() {
        setPostoGrad('');
        setEsp('');
        setNomeGuerra('');
        setNomeCompleto('');
        setUnidade('');
        setSaram('');
        setIdfab('');
        setCPF('');
        setEmailFAB('');
        setEmailPes('');
        setNasc('');
        setPromo('');


    }

    function onCloseModal() {
        cleanModal();
        setShow(false);
    }


    async function onAddUser(event) {
        event.preventDefault()

        const user = {
            p_g: postoGrad, // obrigatório
            nome_guerra: cleanText(nomeGuerra), // obrigatório
            nome_completo: cleanText(nomeCompleto),
            esp: cleanText(esp),
            unidade: unidade, // obrigatório
            id_fab: idfab, // API só aceita INT ou None
            saram: saram, // obrigatório - API só aceita INT
            cpf: cpf,
            ult_promo: promo ? promo : null,
            nasc: nasc ? nasc : null,
            email_pess: cleanText(emailPes),
            email_fab: cleanText(emailFAB),
        }

        const response = await addUserAPI(user);
        const dataRes = await response.json();

        if (response.ok) {
            setTypeMsgModal('success');
            setMsgToModal("Adicionado com sucesso");
            afterAdd();
            cleanModal();
        } else {
            setMsgToModal(dataRes.detail);
            setTypeMsgModal('failure')
        }

        setMessageModal(true);
    }

    return (
        <>
            <Button color="blue" onClick={() => setShow(true)}>
                Adicionar
            </Button>

            {show &&
                <Modal show={show} size="lg" onClose={onCloseModal} popup>
                    <Modal.Header />
                    <Modal.Body>
                        <form onSubmit={(e) => onAddUser(e)}>
                            <UserForm
                                title={"Adicionar Usuário"}
                                postoGrad={
                                    <SelectPostoGrad callFunc={setPostoGrad} value={postoGrad} />
                                }
                                esp={
                                    <InputEsp callFunc={setEsp} value={esp} />
                                }
                                nomeGuerra={
                                    <InputNome callFunc={setNomeGuerra} value={nomeGuerra} />
                                }
                                nomeCompleto={
                                    <InputNome callFunc={setNomeCompleto} value={nomeCompleto} />
                                }
                                unidade={
                                    <SelectOMs callFunc={setUnidade} value={unidade} />
                                }
                                saram={
                                    <InputNumeric callFunc={setSaram} value={saram} len={7} />
                                }
                                id_fab={
                                    <InputNumeric callFunc={setIdfab} value={idfab} len={6} />
                                }
                                cpf={
                                    <InputNumeric callFunc={setCPF} value={cpf} len={11} />
                                }
                                zimbra={
                                    <InputEmail callFunc={setEmailFAB} value={emailFAB} placeholder={"fulano@fab.mil.br"} />
                                }
                                email_pess={
                                    <InputEmail callFunc={setEmailPes} value={emailPes} placeholder={"fulano@exemplo.com"} />
                                }
                                nasc={
                                    <DefaultDatePicker callFunc={setNasc} value={nasc} />
                                }
                                promo={
                                    <DefaultDatePicker callFunc={setPromo} value={promo} />
                                }
                            />

                            <div className="grid justify-center mt-10">
                                <Button type="submit" className="w-40">Adicionar</Button>
                                {/* <Button className="mt-4 w-40" onClick={cleanModal}>Limpar</Button> */}
                            </div>
                        </form>

                    </Modal.Body>
                    <MessageModal active={messageModal} callFunc={setMessageModal} msg={msgToModal} typeMsg={typeMsgModal} />
                </Modal>
            }
        </>
    )
}
