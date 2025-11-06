import { useState } from "react";
import "./Sass/Table.scss";
import TableRow from "./TableRow";
import Pagination from "./Pagination";
import fieldToLabelMapping from "./FieldToLabelMapping";
import { ConfigurationListType } from "../../Configuration/ConfigurationList";

export default function Table(props: {
    data: Array<any>;
    columns: Array<any>;
    title: string;
    config: ConfigurationListType;
}) {
    const [value, setValue] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /**
     * Filter rows.
     */
    function filterResults(e: any): void {
        setPage(1);
        setValue(e.target.value);

        for (const row of props.data) {
            var check = false;

            //check values
            for (const cell of row.cells) {
                if (!!cell.text) {
                    check = cell.text.includes(e.target.value);
                }
                if (check) break;
                if (!!cell.value) {
                    check = cell.value.includes(e.target.value);
                }
                if (check) break;
            }

            //check internalid
            check = !check ? row.id.includes(e.target.value) : check;

            row.show = check;
        }
    }

    function changePage(p: number): void {
        setPage(p);
    }

    if (props.columns.length == 0) {
        return <h4>No search data.</h4>;
    }

    let headerRow: any = [];
    let headerColumns: any = [<th>Internal Id</th>];

    for (const column of props.columns) {
        if (column.name === "internalid") continue; //skip internal id columns since that is always generated
        headerColumns.push(
            <th>
                {column.label ||
                    fieldToLabelMapping[column.name] ||
                    column.name}
            </th>
        );
    }

    headerRow = <tr>{headerColumns}</tr>;

    let showableRows = props.data.filter((data) => data.show == true);
    let totalPages = Math.ceil(showableRows.length / rowsPerPage);

    let bodyRows: any = [];
    let startingIndex = rowsPerPage * (page - 1);
    let endingIndex = startingIndex + rowsPerPage;
    for (let index = startingIndex; index < endingIndex; index++) {
        let row = showableRows[index];
        if (!!row && row.show) {
            bodyRows.push(<TableRow row={row} filterString={value} />);
        }
    }

    return (
        <div className="zkpr-data-container">
            <h2 className="zkpr-search-title">{props.title}</h2>
            <div className="zkpr-data-filters">
                <input
                    type="text"
                    placeholder="search"
                    className="zkpr-table-search-filter"
                    data-widget="TextInput"
                    id="uif-zkpr-search-prompt"
                    onChange={filterResults}
                    value={value}
                />
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    changePage={changePage}
                />
            </div>
            <div className="zkpr-table-container">
                <table className="zkpr-table">
                    <thead>{headerRow}</thead>
                    <tbody>{bodyRows}</tbody>
                </table>
            </div>
        </div>
    );
}
