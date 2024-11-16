"use client";

import { useState, useEffect } from "react";
import { Table, TextInput, Button, Select } from "flowbite-react";
import { IoSearchSharp } from "react-icons/io5";
import FilterAltSharpIcon from '@mui/icons-material/FilterAltSharp';

import { SearchUser } from "./components/searchUserTrip";
import { getTripsAPI } from "../../../../services/api/trips";
import { SelectFuncao, SelectOper } from "../components/inputForm";
import { FuncBadge } from "../components/badges";
import { TripRegister } from "./components/tripRegister";
import { FuncRegister } from "./components/funcRegister";


export default function TripPage() {
    const [trips, setTrips] = useState([]);
    const [filterTrips, setFilterTrips] = useState([]);

    const [uae, setUae] = useState('11gt');
    const [active, setActive] = useState(true);

    const [filterName, setFilterName] = useState('');
    const [filterFunc, setFilterFunc] = useState('');
    const [filterOp, setFilterOp] = useState('');

    function getListTrips() {
        getTripsAPI({ uae: uae, active: active })
            .then(res => res.json())
            .then(data => {
                data.sort((a, b) => {
                    const nameA = a.user.nome_guerra;
                    const nameB = b.user.nome_guerra;
                    if (nameA < nameB)
                        return -1;
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });

                setTrips(data);
                setFilterTrips(data);
            })
    };


    function filters() {
        // FILTRO FUNÇOES E OPER
        let filter = trips.filter((trip) => {
            const funcs = trip.funcs.filter(f => {
                const funcVal = f.func.includes(filterFunc);
                const opVal = f.oper.includes(filterOp);

                if (funcVal && opVal) {
                    return true;
                } else {
                    return false;
                }
            });

            if (funcs.length > 0) {
                return true;
            }
        });

        // FILTRO NOME
        filter = filter.filter(trip => {
            const inputFilter = filterName.toLowerCase()
            const checkTrig = trip.trig.includes(inputFilter);
            const checkGuerra = trip.user.nome_guerra.includes(inputFilter);

            return checkTrig || checkGuerra;
        })

        setFilterTrips(filter);
    }

    useEffect(() => { getListTrips() }, [uae, active]);

    return (
        <>
            <h2>Tripulantes</h2>
            <div className="max-w-4xl">
                <div className="mt-4 flex gap-2">
                    <Select
                        onChange={(e) => setUae(e.target.value)}
                        defaultValue={uae}
                        disabled
                    >
                        <option value="11gt">1°/1° GT</option>
                    </Select>
                    <Select disabled className={`font-semibold`} defaultValue={active} onChange={(e) => setActive(e.target.value)} >
                        <option className="font-semibold text-green-600" value={true}>ATIVO</option>
                        <option className="font-semibold text-red-600" value={false}>INATIVO</option>
                    </Select>
                </div>
                <div className="mt-4 flex justify-between">
                    <div className="flex gap-2">
                        <TextInput
                            className="w-80"
                            icon={IoSearchSharp}
                            placeholder="Search for Crew Member"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                        <SelectFuncao value={filterFunc} callFunc={setFilterFunc} />
                        <SelectOper value={filterOp} callFunc={setFilterOp} />
                        <Button onClick={filters}>
                            <FilterAltSharpIcon className="h-5 w-5" />
                        </Button>
                    </div>
                    <div>
                        <SearchUser uae={uae} trips={trips} updateTrips={getListTrips} />
                    </div>
                </div>
                <div className="mt-8 overflow-x-auto shadow-md">
                    <Table hoverable>
                        <Table.Head className="text-center">
                            <Table.HeadCell>P/G</Table.HeadCell>
                            <Table.HeadCell>Especialidade</Table.HeadCell>
                            <Table.HeadCell className="text-left">Nome de Guerra</Table.HeadCell>
                            <Table.HeadCell>Trigrama</Table.HeadCell>
                            <Table.HeadCell>Função</Table.HeadCell>
                            <Table.HeadCell>
                                <span className="sr-only">Detalhes</span>
                            </Table.HeadCell>
                        </Table.Head>
                        <Table.Body>
                            {
                                filterTrips.map(trip =>
                                    <Table.Row
                                        key={trip.id}
                                        className="bg-white text-center hover:font-semibold uppercase text-base"
                                    >
                                        <Table.Cell className="py-2 font-medium">
                                            {trip.user.p_g}
                                        </Table.Cell>
                                        <Table.Cell className="py-2">
                                            {trip.user.esp}
                                        </Table.Cell>
                                        <Table.Cell className="py-2 text-left">
                                            {trip.user.nome_guerra}
                                        </Table.Cell>
                                        <Table.Cell className="py-2">
                                            {trip.trig}
                                        </Table.Cell>
                                        <Table.Cell className="py-2 justify-items-center">
                                            {trip.funcs.length < 1 ?
                                                <span className="text-red-600 text-xs">Sem Função</span> :
                                                trip.funcs.map(
                                                    f => <FuncBadge key={f.id} funcao={f.func} oper={f.oper} />
                                                )
                                            }
                                        </Table.Cell>
                                        <Table.Cell className="py-2">
                                            <TripRegister
                                                user={trip.user}
                                                trip={trip}
                                                update={getListTrips}
                                            />

                                            <FuncRegister
                                                user={trip.user}
                                            />
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            }
                        </Table.Body>
                    </Table>
                </div>
            </div>
        </>
    )
}