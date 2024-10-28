'use client'

import { SelectFuncao, SelectOper } from "../components/inputForm";
import { Button } from "flowbite-react";

function QuadPage() {
    return (
        <>
            <h2>Quadrinhos</h2>

            <div className="my-5 flex gap-2">
                <SelectFuncao value={''} />
                <SelectOper value={''} />
                <Button>
                    Consultar
                </Button>
            </div>

        </>
    )
}

export default QuadPage;