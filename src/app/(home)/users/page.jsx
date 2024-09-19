"use client";

import { Table } from "flowbite-react";
import { useState, useEffect } from "react";
import BadgeUAE from "../components/badgeUae";
import pgs from "../../../../public/infoFAB/infoPGs";
import { getUsersAPI } from "../../../../services/api/users";
import { SkeletonRow, UserRow } from "./components/tableRow";
import UserRegister from "./components/userRegister";
import UserEdit from "./components/userEdit";


const listUsers = Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)

function UsersPage() {
    const [usuarios, setUsuarios] = useState(listUsers);

    useEffect(() => {
        getUsersAPI()
            .then(res => res.json())
            .then(users => {
                const fetchUsers = users.data.map((user) => {
                    return <UserRow key={user.id} user={user} />
                })

                setUsuarios(fetchUsers);
            })
    }, [])


    function addUserToTable(user) {
        user = <UserRow user={user} />

        setUsuarios([...usuarios, user])
    }


    return (
        <>
            <div className="mb-4">
                <UserRegister action={{ addUserToTable }} />
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