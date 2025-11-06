import { ReactElement, useState } from "react";
import Checkbox from "./Checkbox";

export default function RowInput(props: {
    type: string;
    data: any;
    changeState: Function;
}) {
    const [value, setValue] = useState(props.data.value);

    function updateInput(e: any) {
        if (props.type === "checkbox") {
            props.changeState(e.target.name, e.target.checked);
        } else {
            props.changeState(e.target.name, e.target.value);
        }
        setValue(e.target.value);
    }

    let content: ReactElement = (
        <td className="zkpr-config-input-column-description"></td>
    );

    switch (props.type) {
        case "checkbox":
            content = (
                <td className="zkpr-config-input-column">
                    <input
                        type="checkbox"
                        name={props.data.name}
                        defaultChecked={props.data.defaultChecked}
                        onChange={updateInput}
                    />
                    <Checkbox />
                </td>
            );
            break;
        case "radio":
            content = (
                <td className="zkpr-config-input-column">
                    <input
                        type="radio"
                        name={props.data.name}
                        defaultChecked={props.data.defaultChecked}
                        value={value}
                        onChange={updateInput}
                    />
                    <Checkbox />
                </td>
            );
            break;
        case "textbox":
            content = (
                <td className="zkpr-config-input-column">
                    <label htmlFor={props.data.id}>{props.data.label}</label>
                    <input
                        type={props.data.type}
                        name={props.data.id}
                        value={value}
                        placeholder={props.data.placeholder}
                        onChange={updateInput}
                    />
                </td>
            );
            break;
        default:
            break;
    }

    return content;
}
