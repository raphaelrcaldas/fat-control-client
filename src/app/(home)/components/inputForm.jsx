import { useState } from "react";
import pgs from "../../../../public/infoFAB/infoPGs";
import { Select } from "flowbite-react";
import { TextInput } from "flowbite-react";
import { validateNoNumber, validateOnlyNumber } from "../../../../utils/textFormat";
import { HiMail } from "react-icons/hi";


export function SelectPostoGrad({ callFunc, value }) {

    return (
        <>
            <Select onChange={(event) => callFunc(event.target.value)} value={value} required>
                <option selected disabled></option>
                {Object.entries(pgs).map(([key, obj], index) =>
                    <option key={index} value={key}>{obj.pg.mid}</option>
                )}
            </Select>
        </>
    )
}


export function SelectOMs({ callFunc, value }) {

    return (
        <>
            <Select required onChange={(event) => callFunc(event.target.value)} value={value}>
                <option disabled value={""}></option>
                <option value="11gt">1º/1º GT</option>
                <option value="12gt">1º/2º GT</option>
                <option value="22gt">2º/2º GT</option>
                <option value="bagl">BAGL</option>
                <option value="glog">GLOG</option>
                <option value="gsdgl">GSD-GL</option>
            </Select>
        </>
    )
}


export function InputEsp({ callFunc, value }) {

    return (
        <>
            <TextInput
                maxLength="5"
                value={value}
                onChange={(event) => callFunc(event.target.value)}
            />
        </>
    )
}


export function InputNome({ callFunc, value }) {
    return (
        <TextInput
            autoComplete="off"
            sizing="md"
            onChange={(event) => callFunc(event.target.value)}
            value={value}
            required
            onKeyPress={(event) => validateNoNumber(event)}
        />
    )
}


export function InputNumeric({ callFunc, value, len }) {

    return (
        <>
            <TextInput
                autoComplete="off"
                required
                type="text"
                inputMode="numeric"
                maxLength={len}
                minLength={len}
                value={value}
                onChange={(event) => callFunc(event.target.value)}
                onKeyPress={(event) => validateOnlyNumber(event)}
            />
        </>
    )
}


export function InputEmail({ callFunc, value, placeholder }) {
    return (
        <>
            <TextInput
                type="email"
                autoComplete="off"
                placeholder={placeholder}
                value={value}
                icon={HiMail}
                onChange={(event) => callFunc(event.target.value)}
            />
        </>
    )
}