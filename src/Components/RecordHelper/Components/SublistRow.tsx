import { ReactElement } from "react";

export default function SublistRow(props: {
    sublist: any;
    scroll: Function;
    setSublistId: Function;
    record: any;
}) {
    /**
     * Get selected sublist and send to browser tab for navigation
     * @param id
     */
    function navigate(id: any) {
        let selectedSublist = props.record.sublists.find(
            (fld: { id: any }) => fld.id == id
        );
        props.scroll(selectedSublist);
    }

    let column1: ReactElement = (
        <td>
            <ul>
                <li
                    dangerouslySetInnerHTML={{
                        __html: "<b>Label: </b>" + props.sublist.label,
                    }}
                ></li>{" "}
                {/*we have to use this syntax to handle the incoming html in some cases*/}
                <li>
                    <b>Internal Id:</b> {props.sublist.id}
                </li>
            </ul>
        </td>
    );
    let column2: ReactElement = (
        <td
            className="zkpr-record-helper-navigableField"
            title="Go to sublist"
            onClick={() => navigate(props.sublist.id)}
        >
            {props.sublist.location}
        </td>
    );
    let column3: ReactElement = (
        <td
            className="zkpr-record-helper-navigableField"
            title="View lines"
            onClick={() => props.setSublistId(props.sublist.id)}
        >
            {props.sublist.lines.length}
        </td>
    );

    return (
        <tr>
            {column1}
            {column2}
            {column3}
        </tr>
    );
}
