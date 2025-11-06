import BodyRow from "./BodyRow";

const typeColors: any = {
    text: "red",
    textarea: "red",
    email: "orange",
    phone: "orange",
    address: "orange",
    float: "teal",
    integer: "teal",
    posinteger: "teal",
    posfloat: "teal",
    percent: "teal",
    checkbox: "green",
    date: "green",
    url: "green",
    select: "blue",
    currency: "maroon",
    currency2: "maroon",
    label: "maroon",
};

export default function BodyFields(props: {
    record: any;
    scroll: Function;
    simple: boolean;
}) {
    var rows: any = [];
    for (const field of props.record.bodyFields) {
        if (field.show) {
            var color = typeColors[field.type];
            rows.push(
                <BodyRow
                    field={field}
                    color={color}
                    scroll={props.scroll}
                    record={props.record}
                    simple={props.simple}
                />
            );
        }
    }

    let tableHeaders = [];
    tableHeaders.push(<th colSpan={2}>Basic Info</th>);
    tableHeaders.push(<th>Value</th>);
    !props.simple && tableHeaders.push(<th>Text</th>);
    tableHeaders.push(
        <th title="Location displayed as Tab > Subtab : Field Group">
            Location <i style={{ fontSize: "xx-small" }}>(Click to navigate)</i>
        </th>
    );

    return (
        <table className="zkpr-table zkpr-record-helper-table">
            <thead>
                <tr>
                    <th colSpan={5}>
                        <p>
                            <b>
                                <i style={{ textDecoration: "none" }}>
                                    Only filtered results are being shown
                                </i>
                            </b>
                        </p>
                    </th>
                </tr>
                <tr style={{ boxShadow: "0px 4px 10px -8px" }}>
                    {tableHeaders}
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </table>
    );
}
