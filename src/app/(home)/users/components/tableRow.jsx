import { Table } from "flowbite-react"
import { Skeleton } from "@mui/material"
import pgs from "../../../../../public/infoFAB/infoPGs"
import BadgeUAE from "../../components/badgeUae"
import UserEdit from "./userEdit"
import { UserDetailForm } from "./userForm"

function TableRow({ pg, esp, guerra, completo, unidade, detalhes }) {

    return (
        <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800 text-base">
            <Table.Cell className="text-center whitespace-nowrap font-medium text-gray-900 dark:text-white">
                {pg}
            </Table.Cell>
            <Table.Cell className="text-center">
                {esp}
            </Table.Cell>
            <Table.Cell>
                {guerra}
            </Table.Cell>
            <Table.Cell>
                {completo}
            </Table.Cell>
            <Table.Cell className="flex justify-center">
                {unidade}
            </Table.Cell>
            <Table.Cell className="py-2">
                {detalhes}
            </Table.Cell>
        </Table.Row>
    )
}


export function UserRow({ user }) {
    return (
        <TableRow
            key={user.id}
            pg={pgs[user.p_g].pg.mid}
            esp={user.esp.toUpperCase()}
            guerra={user.nome_guerra.toUpperCase()}
            completo={user.nome_completo.toUpperCase()}
            unidade={<BadgeUAE>{user.unidade}</BadgeUAE>}
            detalhes={<UserDetailForm user_id={user.id} />}
        />
    )
}


export function SkeletonRow() {
    return (
        <TableRow
            pg={<Skeleton />}
            esp={<Skeleton />}
            guerra={<Skeleton width={100} />}
            completo={<Skeleton width={410} />}
            unidade={<Skeleton width={50} />}
            detalhes={<Skeleton width={50} />}
        />
    )
}