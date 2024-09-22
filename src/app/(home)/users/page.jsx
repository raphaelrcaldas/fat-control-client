"use client";

import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import BadgeUAE from "../components/badgeUae";
import pgs from "../../../../public/infoFAB/infoPGs";
import { getUsersAPI } from "../../../../services/api/users";
import { SkeletonRow, UserRow } from "./components/tableRow";
import { UserRegister } from "./components/userForm";

const listUsers = Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)




function UsersPage() {
    const [usuarios, setUsuarios] = useState(listUsers);

    function updateListUsers() {
        getUsersAPI()
            .then(res => res.json())
            .then(users => {
                const fetchUsers = users.data.map((user) => {
                    return <UserRow key={user.id} user={user} callFunc={updateListUsers} />
                })

                setUsuarios(fetchUsers);
            })
    }


    useEffect(() => { updateListUsers() }, [])


    return (
        <>
            <div className="flex mb-4 gap-16">
                <h2>Usuários</h2>

                <div className="flex flex-row gap-8">
                    <UserRegister afterAdd={updateListUsers} />
                </div>
            </div>

            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
                <Table hoverable>
                    <Table.Head className="text-sm">
                        <Table.HeadCell className="text-center">P/G</Table.HeadCell>
                        <Table.HeadCell className="text-center">Especialidade</Table.HeadCell>
                        <Table.HeadCell>Nome de Guerra</Table.HeadCell>
                        <Table.HeadCell>Nome Completo</Table.HeadCell>
                        <Table.HeadCell className="text-center">Unidade</Table.HeadCell>
                        <Table.HeadCell>
                            <span className="sr-only">Detalhes</span>
                        </Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y" >
                        {usuarios}
                    </Table.Body>
                </Table>
            </div >
        </>
    )
}

export default UsersPage;