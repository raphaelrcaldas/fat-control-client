'use client'

import { SelectFuncao } from "../components/inputForm";
import { Button, Table, Select } from "flowbite-react";
import { QuadPopover } from "./components/quadPopover";
import { useEffect, useState } from "react";
import { getQuadsAPI } from "../../../../services/api/quads";
import AddQuadModal from "./components/addQuad";

export default function QuadPage() {
    const [filterFunc, setFilterFunc] = useState('mc');
    const [filterQuad, setFilterQuad] = useState('s_pto');
    const [quads, setQuads] = useState([])
    const [lenMin, setMin] = useState(undefined)

    function getQuads() {
        const params = {
            funcao: filterFunc,
            tipo_quad: filterQuad,
            uae: '11gt',
            proj: 'kc-390',
        }

        getQuadsAPI(params)
            .then(res => res.json())
            .then(data => {
                setMin(
                    Math.min(...data.map(f => f.quads.length)) - 1
                );
                setQuads(data);
            });
    }

    useEffect(() => { getQuads() }, [filterQuad, filterFunc]);

    return (
        <>
            <h2>Quadrinhos</h2>

            <div className="my-5 w-5/12 flex justify-between">
                <div className="flex gap-2">
                    <SelectFuncao value={filterFunc} callFunc={setFilterFunc} />

                    <Select value={filterQuad} onChange={(e) => setFilterQuad(e.target.value)}>
                        <optgroup label="Sobreaviso">
                            <option value={'s_pto'}>S. Preto</option>
                            <option value={'s_vmo'}>S. Vermelho</option>
                            <option value={'s_rxo'}>S. Roxo</option>
                        </optgroup>
                    </Select>
                </div>
            </div>

            <div className="flex">
                <Table hoverable className="text-base shadow-md">
                    <Table.Body>
                        {
                            quads.map((func) => {
                                return (
                                    <Table.Row key={func.id} className="border-b">
                                        <Table.Cell className="grid justify-center px-3 py-2">
                                            <Button
                                                color={'light'}
                                                onClick={() => console.log(func)}
                                                className="w-14 uppercase"
                                                size={'sm'}>
                                                {func.trip.trig}
                                            </Button>

                                        </Table.Cell>
                                        {
                                            func.quads.map(quad => {
                                                return (
                                                    <Table.Cell key={quad.id} className="py-2 px-0 pr-2">
                                                        <QuadPopover
                                                            value={quad.value}
                                                            info={quad.description}
                                                        />
                                                    </Table.Cell>
                                                )
                                            })
                                        }
                                        <Table.Cell className="py-2 pl-2 pr-3">
                                            <AddQuadModal func={func} callFunc={getQuads} type={filterQuad} />
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
