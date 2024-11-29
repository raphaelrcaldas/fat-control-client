import { Spinner } from "flowbite-react"

export default function Loading() {

    return (
        <div className="h-full justify-items-center content-center">
            <div className="relative justify-items-center max-w-sm p-6 bg-white border border-gray-100 rounded-lg shadow-md">
                <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 opacity-20">
                    1º/1º Grupo de Transporte
                </h3>
                <h5 className="mb-4 text-base text-center font-bold text-gray-900 opacity-20">
                    Uma equipe, um coração.
                </h5>
                <Spinner color="failure" aria-label="spinner" size="xl" />
            </div>
        </div>
    )
}
