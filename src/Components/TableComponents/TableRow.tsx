export default function TableRow(props: { row: any; filterString: string }) {
    /**
     * Grab the record url from the backend and navigate the user.
     */
    function goToRecord(): void {
        window.postMessage(
            {
                dest: "zkpr_inject_open_record",
                recordId: props.row.id,
                recordType: props.row.recordType,
            },
            window.location.href
        );
    }

    let id = props.row.id;
    if (!!props.filterString && id.includes(props.filterString)) {
        id = id.replace(
            props.filterString,
            '<span style="color: red;">' + props.filterString + "</span>"
        );
    }

    let columns: any = [
        <td className="zkpr-table-navigate">
            <span
                onClick={goToRecord}
                title="Go to record"
                dangerouslySetInnerHTML={{ __html: id }}
            ></span>
        </td>,
    ];

    for (let value of props.row.cells) {
        value = value.text || value.value;

        if (typeof value !== "string" && !!value[0]) {
            value = value[0].text || "";
        }

        if (!!props.filterString && value.includes(props.filterString)) {
            value = value.replace(
                props.filterString,
                '<span style="color: red;">' + props.filterString + "</span>"
            );
        }

        columns.push(<td dangerouslySetInnerHTML={{ __html: value }}></td>);
    }

    return <tr>{columns}</tr>;
}
