import { Select } from "flowbite-react"

export const typeQuads = [
    {
        groupName: "SOBREAVISO",
        value: "sobr",
        types: [
            {
                name: { short: "S. PRETO", long: "PRETO" },
                value: "preto",
                exclude: ['oe'],
            },
            {
                name: { short: "S. VERMELHO", long: "VERMELHO" },
                value: "verm",
                exclude: ['oe'],
            },
            {
                name: { short: "S. ROXO", long: "ROXO" },
                value: "roxo",
                exclude: ['oe'],
            },
        ]
    },
    {
        groupName: "NACIONAL",
        value: "nacional",
        types: [
            {
                name: { short: "BATE-PRONTO", long: "BATE-PRONTO" },
                value: "bp",
                exclude: [],
            },
            {
                name: { short: "NACIONAL", long: "NACIONAL" },
                value: "nacional",
                exclude: [],
            },
            {
                name: { short: "CALHA-NORTE", long: "CALHA-NORTE" },
                value: "calha",
                exclude: ['os'],
            },
            {
                name: { short: "EMBRAER", long: "EMBRAER" },
                value: "embraer",
                exclude: ['os'],
            },
        ]
    },
    {
        groupName: "LOCAL",
        value: "local",
        types: [
            {
                name: { short: "LOCAL", long: "LOCAL" },
                value: "local",
                exclude: [],
            },
            {
                name: { short: "CDS", long: "CDS" },
                value: "cds",
                exclude: ['tf', 'os'],
            },
            {
                name: { short: "HEAVY", long: "HEAVY" },
                value: "heavy",
                exclude: ['tf', 'os'],
            },
            {
                name: { short: "TT", long: "TT" },
                value: "tt",
                exclude: ['tf', 'os'],
            },
            {
                name: { short: "REVO", long: "REVO" },
                value: "revo",
                exclude: ['os','tf'],
            },
            {
                name: { short: "SAR", long: "SAR" },
                value: "sar",
                exclude: ['tf'],
            },
        ]
    },
    {
        groupName: "DESLOCAMENTO",
        value: "desloc",
        types: [
            {
                name: { short: "MAFFS", long: "MAFFS" },
                value: "maffs",
                exclude: ['tf', 'os']
            },
            {
                name: { short: "REVO", long: "REVO" },
                value: "revo",
                exclude: ['tf', 'os']
            },
            {
                name: { short: "SAR", long: "SAR" },
                value: "sar",
                exclude: ['tf']
            },
            {
                name: { short: "TAET", long: "TAET" },
                value: "taet",
                exclude: ['tf', 'os']
            },
            {
                name: { short: "TF", long: "Taifeiro" },
                value: "tf",
                exclude: ['pil', 'mc', 'lm', 'oe', 'os']
            },
        ]
    },
    {
        groupName: "INTERNACIONAL",
        value: "inter",
        types: [
            {
                name: { short: "ANTÁRTICA", long: "ANTÁRTICA" },
                value: "antartica",
                exclude: ['os'],
            },
            {
                name: { short: "GRUPO 2", long: "GRUPO 2" },
                value: "g2",
                exclude: ['os'],
            },
            {
                name: { short: "GRUPO 2-BP", long: "GRUPO 2 - BATE-PRONTO" },
                value: "g2_bp",
                exclude: ['os'],
            },
            {
                name: { short: "GRUPO 3", long: "GRUPO 3" },
                value: "g3",
                exclude: ['os'],
            },
            {
                name: { short: "GRUPO 4", long: "GRUPO 4" },
                value: "g4",
                exclude: ['os'],
            },
            {
                name: { short: "GRUPO 5", long: "GRUPO 5" },
                value: "g5",
                exclude: ['os'],
            },
        ]
    },
]



export function SelectQuad({ funcTrip, value, onChange }) {
    function filterType(types, func) {
        return types.filter(
            type => !type.exclude.includes(func)
        )
    }

    const group = [...typeQuads];
    const filterGroup = group.filter(group => {
        const typesFilter = filterType(group.types, funcTrip);
        return (typesFilter.length > 0)
    })


    return (
        <Select value={value} onChange={(e) => onChange(e.target.value)}>
            {
                filterGroup.map((group, index) => {
                    return (
                        <optgroup key={index} label={group.groupName}>
                            {
                                group.types.map((quad, iq) => {
                                    if (!quad.exclude.includes(funcTrip)) {

                                        return (
                                            <option key={iq} value={`${group.value}-${quad.value}`}>
                                                {quad.name.short}
                                            </option>
                                        )
                                    }
                                })
                            }
                        </optgroup>
                    )
                })
            }
        </Select>
    )
}
