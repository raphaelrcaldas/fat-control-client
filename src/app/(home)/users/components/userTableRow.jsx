import { Table } from "flowbite-react"

export default function UserTableRow({ pg, esp, guerra, completo, unidade, detalhes }) {

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
