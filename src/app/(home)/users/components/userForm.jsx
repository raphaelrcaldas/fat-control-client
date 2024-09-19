"use client";

import MessageModal from "../../components/messageModal";
import { Button, Label, Modal, TextInput, Select } from "flowbite-react";
import { useState } from "react";
import { HiMail } from "react-icons/hi";
import { addUserAPI, getUserById } from "../../../../../services/api/users";
import pgs from "../../../../../public/infoFAB/infoPGs";
import unidades_bagl from "../../../../../public/infoFAB/infoOMs";

function UserForm({
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
            <div className="space-y-6 text-center">
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
                        <Label className="mb-2 block">CPF</Label>
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


export function UserDetailForm({ user_id }) {
    const [show, setShow] = useState(false);
    const [userId, setUser] = useState(user_id);

    const [postoGrad, setPostoGrad] = useState('');
    const [esp, setEsp] = useState('');
    const [nomeGuerra, setNomeGuerra] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [unidade, setUnidade] = useState('');
    const [saram, setSaram] = useState('');
    const [idFAB, setIdFAB] = useState('');
    const [cpf, setCPF] = useState('');
    const [zimbra, setZimbra] = useState('');
    const [email, setEmail] = useState('');
    const [nasc, setNasc] = useState('');
    const [promo, setPromo] = useState('');

    function onOpenDetail() {
        getUserById(userId).then(res => res.json())
            .then(data => {
                setPostoGrad(pgs[data.p_g].pg.mid)
                setEsp(data.esp.toUpperCase())
                setNomeGuerra(data.nome_guerra.toUpperCase())
                setNomeCompleto(data.nome_completo.toUpperCase())
                setUnidade(unidades_bagl[data.unidade].value)
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

    function filterTxt (string) {
        if (!string) { 
            return "NIL" 
        } else {
            return string
        }
    }

    function dateForm(dateStr){
        // 2018-05-25
        if (dateStr){
            const [a, m, d] = dateStr.split("-");
            return `${d}/${m}/${a}`
        }
    }

    return (
        <>
            <Button variant="text" color={"gray"} onClick={onOpenDetail}>Detalhes</Button>

            {show &&
                <Modal show={show} size="lg" onClose={() => setShow(false)} popup>
                    <Modal.Header className="text-center">Informações do Usuário</Modal.Header>
                    <Modal.Body>
                        <UserForm
                            postoGrad={postoGrad}
                            esp={filterTxt(esp)}
                            nomeGuerra={nomeGuerra}
                            nomeCompleto={filterTxt(nomeCompleto)}
                            unidade={unidade}
                            saram={saram}
                            id_fab={filterTxt(idFAB)}
                            cpf={filterTxt(cpf)}
                            zimbra={filterTxt(zimbra)}
                            email_pess={filterTxt(email)}
                            nasc={filterTxt(dateForm(nasc))}
                            promo={filterTxt(dateForm(promo))}
                        />

                    </Modal.Body>
                    <Modal.Footer className="justify-center">
                        <Button className="w-40">Editar</Button>
                    </Modal.Footer>
                </Modal>
            }

        </>
    )
}


export function UserAddForm() {

    return (
        <>

        </>
    )
}


export function UserEditForm() {

    return (
        <>

        </>
    )
}
