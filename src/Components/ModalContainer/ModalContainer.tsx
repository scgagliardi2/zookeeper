import { useState } from "react";
import "./Sass/ModalContainer.scss";
import "../Globals/Sass/Globals.scss";
import "../Buttons/Sass/Buttons.scss";

//import general components
import Modal from "../Modal/Modal";
import Header from "../Header/Header";

export default function ModalContainer(props: {
    children: React.ReactElement;
    childId: string;
}) {
    const [open, setOpen] = useState(false);

    window.addEventListener("message", (event: any) => {
        if (event.data.dest === props.childId) {
            if (event.data.toggleVisibility) {
                toggleVisibility();
            }
        }
    });

    function toggleVisibility() {
        setOpen(!open);
    }

    return (
        <div style={{ display: open ? "block" : "none" }}>
            <Modal toggleVisibility={toggleVisibility} />
            <div className={"zkpr-container"}>
                <Header toggleVisibility={toggleVisibility} />
                <div className={"zkpr-body"}>{props.children}</div>
            </div>
        </div>
    );
}
