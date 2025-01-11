import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Modal, Button, TextInput, Label, Checkbox, Table } from "flowbite-react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { GoPlus } from "react-icons/go";
import { FaEdit } from "react-icons/fa";
import { onlyText } from "../../../../../utils/textFormat";
import { updateTrip } from "../../../../../services/routes/trips";

export function TripDetail({ trip, update }) {
    const [show, setShow] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            trig: trip.trig,
            active: trip.active,
        },
    });

    useEffect(() => {
        reset({
            trig: trip.trig.toUpperCase(),
            active: trip.active,
        });
    }, [trip, reset]);

    const handleShow = useCallback(() => setShow(true), []);
    const handleClose = useCallback(() => setShow(false), []);

    const onSubmit = useCallback((data) => {
        data.trig = data.trig.toLowerCase()

        updateTrip(trip.id, data).then(() => {
            update();
            handleClose();
        });
    }, [trip.id, update, handleClose]);

    return (
        <div>
            <Button onClick={handleShow}>
                <FaEdit />
            </Button>
            <Modal show={show} onClose={handleClose} size="sm" popup>
                <Modal.Header>
                    Editar Tripulante
                </Modal.Header >
                <Modal.Body>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4 justify-items-center">
                            <Label htmlFor="trig">Trigrama</Label>
                            <TextInput className="w-16" id="trig" {...register("trig")} />
                        </div>
                        <div className="mb-4 gap-2 flex items-center justify-center">
                            <Label htmlFor="active">Ativo</Label>
                            <Checkbox className="w-6 h-6" id="active" {...register("active")} />
                        </div>
                        <div className="flex mt-6 justify-center">
                            <Button type="submit">Salvar</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
}
