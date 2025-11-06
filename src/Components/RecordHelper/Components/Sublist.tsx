import { useState } from "react";
import ReturnButton from "../../Buttons/ReturnButton";

export default function Sublist(props: { sublist: any; back: Function }) {
    const [loading, setLoading] = useState(false);
    const [selectedLine, setSelectedLine] = useState(0);

    function changeSelection(selection: any) {
        setSelectedLine(selection.target.value);
    }

    //build line options
    var lines: any = [];
    for (const [i, line] of props.sublist.lines.entries()) {
        if (line.show) {
            lines.push(<option value={i}>{i}</option>);
        }
    }

    var header = (
        <div className="zkpr-record-helper-sublist-header">
            <ReturnButton
                returnButton={props.back}
                buttonClass="zkpr-return-icon-body"
                iconSize={"30"}
            />
            <h1
                dangerouslySetInnerHTML={{
                    __html: props.sublist.label,
                }}
            ></h1>{" "}
            {/*we have to use this syntax to handle the incoming html in some cases*/}
            <div>
                <h1 style={{ display: "inline", marginRight: "5px" }}>
                    Selected line:
                </h1>
                <select id="lines" onChange={changeSelection}>
                    {lines}
                </select>
            </div>
        </div>
    );

    if (props.sublist.lines.length == 0) {
        return (
            <div>
                {header}
                <h3>
                    No lines found. This sublist may have not been loaded with
                    the record, and is instead displaying the results of a saved
                    search.
                </h3>
            </div>
        );
    }

    var selLine = props.sublist.lines[selectedLine];

    //build data
    var fields: any = [];
    for (const field of selLine.fields) {
        if (field.id !== "sys_id" && field.id !== "sys_parentid" && field.show)
            fields.push(
                <tr>
                    <td>{field.id}</td>
                    <td>{field.value}</td>
                </tr>
            );
    }

    return (
        <div>
            {header}
            <div className="zkpr-table-container">
                <table className="zkpr-record-helper-table">
                    <thead>
                        <tr>
                            <th>Line Field Id</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>{fields}</tbody>
                </table>
            </div>
        </div>
    );
}
