'use client'

import { Datepicker } from "flowbite-react";
import { useState } from "react";


function HomeApp() {
    const [dateP, setDateP] = useState(null);


    function selectDate(dateEvent) {
        setDateP(
            dateEvent.toLocaleDateString('pt-br')
        )
        
        console.log(dateEvent)
    }

    return (
        <>
            {/* <h3>Home</h3> */}
            <div>
                <Datepicker
                    className="w-36"
                    language="pt-BR"
                    // showClearButton={false}
                    // showTodayButton={false}
                    value={dateP}
                    maxDate={new Date()}
                    autoHide={true}
                    onSelectedDateChanged={(e) => selectDate(e)}
                />
            </div>
        </>
    )
}

export default HomeApp;