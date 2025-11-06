import { ReactElement } from "react";

export default function BodyRow(props: {
    color: string;
    field: any;
    scroll: Function;
    record: any;
    simple: boolean;
}) {
    /**
     * Get selected field and send to browser tab for navigation
     */
    function navigate(id: any) {
        let selectedField = props.record.bodyFields.find(
            (fld: { id: any }) => fld.id == id
        );
        props.scroll(selectedField);
    }

    if (props.field.show) {
        let title = "";
        let navigationClass = "";
        let navigationFunction = () => {};

        if (props.field.navigationAllowed) {
            title = "Go to field";
            navigationClass = "zkpr-record-helper-navigableField";
            navigationFunction = () => navigate(props.field.id);
        }

        let value =
            props.field.highlightValue != ""
                ? props.field.highlightValue
                : props.field.value;
        let text =
            props.field.highlightText != ""
                ? props.field.highlightText
                : props.field.text;
        let id =
            props.field.highlightId != ""
                ? props.field.highlightId
                : props.field.id;
        let label =
            props.field.highlightLabel != ""
                ? props.field.highlightLabel
                : props.field.label;
        if (props.simple && !!value && props.field.text != value) {
            if (!!text) {
                value = `${text}: (<i>id: ${value}</i>)`;
            } else if (value) {
                value = text;
            }
        }

        let column1: ReactElement = (
            <td colSpan={2}>
                <ul>
                    <li
                        className="zkpr-table-field-internalid"
                        dangerouslySetInnerHTML={{
                            __html: "<b>Internal Id: </b>" + id,
                        }}
                    ></li>
                    <li
                        className="zkpr-table-field-label"
                        dangerouslySetInnerHTML={{
                            __html: "<b>Label: </b>" + label,
                        }}
                    ></li>{" "}
                    {/*we have to use this syntax to handle the incoming html in some cases*/}
                    <li>
                        <b>Type:</b>{" "}
                        <i style={{ color: props.color }}>{props.field.type}</i>
                    </li>
                </ul>
            </td>
        );
        let column2: ReactElement = (
            <td dangerouslySetInnerHTML={{ __html: value }}></td>
        );
        let column3: ReactElement = <td>{text}</td>;
        let column4: ReactElement = (
            <td
                className={navigationClass}
                title={title}
                onClick={navigationFunction}
            >
                {props.field.location}
            </td>
        );

        let columns = [];
        columns.push(column1);
        columns.push(column2);
        !props.simple && columns.push(column3);
        columns.push(column4);

        return <tr>{columns}</tr>;
    } else {
        return <div></div>;
    }
}
