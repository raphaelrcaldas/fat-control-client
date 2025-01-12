'use client'
import { useEffect, useState} from "react";

import { Table, Select } from "flowbite-react";
import { QuadPopover } from "./components/quadPopover";
import { QuadsTrip } from "./components/quadsTrip";
import { getQuads } from "../../../../services/routes/quads";
import AddQuadModal from "./components/addQuad";
import { SelectQuad } from "./components/infoQuads"

const themeTable = {
    root: {
        base: "w-full text-base text-gray-500 dark:text-gray-400 uppercase text-center",
        shadow: "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md dark:bg-black",
        wrapper: "relative"
    },
    body: {
        base: "group/body",
        cell: {
            base: "px-0.5 py-1 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg"
        }
    },
    head: {
        base: "group/head text-xs text-gray-700 dark:text-gray-400",
        cell: {
            base: "bg-gray-200 px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-gray-700"
        }
    },
    row: {
        base: "group/row bg-white hover:font-semibold bg-white",
        hovered: "hover:bg-gray-50 dark:hover:bg-gray-600",
        striped: "odd:bg-white even:bg-gray-50 odd:dark:bg-gray-800 even:dark:bg-gray-700"
    }
}


export default function QuadPage() {
    const [filterFunc, setFilterFunc] = useState('mc');
    const [filterQuad, setFilterQuad] = useState('sobr-preto');
    const [quads, setQuads] = useState([]);


    function getQuadsParams() {
        const params = {
            funcao: filterFunc,
            tipo_quad: filterQuad,
            uae: '11gt',
            proj: 'kc-390',
        }

        getQuads(params)
            .then(res => res.json())
            .then(data => {
                setQuads(data);
            });
    }

    useEffect(() => { getQuadsParams() }, [filterQuad, filterFunc]);

    return (
        <>
            <h2>Quadrinhos</h2>

            <div className="my-5 w-5/12 flex justify-between">
                <div className="flex gap-2">
                    <Select value={filterFunc} onChange={(e) => setFilterFunc(e.target.value)}>
                        <option value="mc">Mecânico</option>
                        <option value="lm">LoadMaster</option>
                        <option value="tf">Taifeiro</option>
                        <option value="os">Observador-SAR</option>
                        <option value="oe">OE</option>
                    </Select>

                    <SelectQuad
                        value={filterQuad}
                        funcTrip={filterFunc}
                        onChange={setFilterQuad}
                    />
                </div>
            </div>

            <div className="flex">
                <Table theme={themeTable}>
                    <Table.Body>
                        {
                            quads.map((item) => {
                                return (
                                    <Table.Row key={item.trip.id} className="border-b">
                                        <Table.Cell className="justify-items-center px-3 py-2">
                                            <QuadsTrip trip={item.trip} lenTotalQuads={item.quads_len} typeQuad={filterQuad} />
                                        </Table.Cell>
                                        {
                                            item.quads.map(quad => {
                                                return (
                                                    <Table.Cell key={quad.id}>
                                                        <QuadPopover
                                                            value={quad.value}
                                                            info={quad.description}
                                                        />
                                                    </Table.Cell>
                                                )
                                            })
                                        }
                                        <Table.Cell className="w-20 justify-items-center">
                                            <AddQuadModal trip={item.trip} callFunc={getQuadsParams} type={filterQuad} />
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            })
                        }
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}

