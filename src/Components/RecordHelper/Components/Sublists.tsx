import { useState } from "react";
import SublistRow from "./SublistRow";
import Sublist from "./Sublist";

export default function Sublists(props: { record: any; scroll: Function }) {
    const [showTable, setShowTable] = useState(true);
    const [sublistId, setSubId] = useState("");

    function setSublistId(id: string) {
        setShowTable(false);
        setSubId(id);
    }

    function back() {
        setShowTable(true);
        setSubId("");
    }

    if (showTable) {
        var rows: any = [];
        for (const sublist of props.record.sublists) {
            if (sublist.show) {
                rows.push(
                    <SublistRow
                        sublist={sublist}
                        scroll={props.scroll}
                        setSublistId={setSublistId}
                        record={props.record}
                    />
                );
            }
        }

        return (
            <div>
                <div className="zkpr-table-container">
                    <table className="zkpr-table zkpr-record-helper-sublists-table">
                        <thead>
                            <tr className="table-header" style={{ boxShadow: "0px 4px 10px -8px" }}>
                                <th>Sublist Info</th>
                                <th title="Location displayed as Tab > Subtab : Field Group">
                                    Location{" "}
                                    <i style={{ fontSize: "xx-small" }}>
                                        (Click to navigate)
                                    </i>
                                </th>
                                <th># of Lines</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </table>
                </div>
            </div>
        );
    } else {
        var sublistSelected: any;
        for (const sublist of props.record.sublists) {
            if (sublist.id == sublistId) {
                sublistSelected = sublist;
            }
        }
        return <Sublist sublist={sublistSelected} back={back} />;
    }
}
