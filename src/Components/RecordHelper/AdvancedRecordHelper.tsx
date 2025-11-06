import { ReactElement, useEffect, useState } from "react";
import "../TableComponents/Sass/Table.scss";
import "./Sass/RecordHelper.scss";

//import module components
import Links from "./Components/Links";
import BodyFields from "./Components/BodyFields";
import Sublists from "./Components/Sublists";
import TabsCollection from "../Tabs/TabsCollection";
import User from "../User/User";
import { ConfigurationListType } from "../../Configuration/ConfigurationList";

export default function AdvancedRecordHelper(props: {
    user: User;
    config: ConfigurationListType;
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [record, setRecord] = useState(props.user.zkprRecord || {});
    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        filterRecord({ target: { value: "" } });

        window.addEventListener("message", (event: any) => {
            if (event.data.dest === "zkpr_search_record") {
                setSearchTerm(event.data.input);
            }
        });
    }, []);

    /**
     * Filter fields and sublists by the search term.
     */
    function filterRecord(event: any) {
        let searchTerm = event.target.value;

        let bodyFields = record.bodyFields || [];

        for (const field of bodyFields) {
            field.show =
                field.id.includes(searchTerm) ||
                field.value.includes(searchTerm) ||
                field.label.includes(searchTerm) ||
                field.text.includes(searchTerm);

            //hide field values not on form for non-admins
            if (
                props.user.roleid !== "administrator" &&
                field.location === "Not displayed for this form."
            ) {
                field.value = "";
                field.text = "";
                field.location =
                    "Not displayed for this form, or you do not have permission to see this field.";
            }

            //highlight text
            if (field.show && !!searchTerm) {
                if (typeof field.value == "object")
                    field.value = JSON.stringify(field.value);
                field.highlightValue = field.value.replaceAll(
                    searchTerm,
                    `<mark>${searchTerm}</mark>`
                );
                field.highlightLabel = field.label.replaceAll(
                    searchTerm,
                    `<mark>${searchTerm}</mark>`
                );
                field.highlightId = field.id.replaceAll(
                    searchTerm,
                    `<mark>${searchTerm}</mark>`
                );
                field.highlightText = field.text.replaceAll(
                    searchTerm,
                    `<mark>${searchTerm}</mark>`
                );
            }
            //reset
            else {
                field.highlightValue = "";
                field.highlightLabel = "";
                field.highlightId = "";
                field.highlightText = "";
            }
        }

        let sublists = record.sublists || [];
        for (const sublist of sublists) {
            sublist.show =
                sublist.id.includes(searchTerm) ||
                sublist.label.includes(searchTerm);

            for (const line of sublist.lines) {
                if (!!line.fields) {
                    for (const field of line.fields) {
                        var check =
                            field.id.includes(searchTerm) ||
                            field.value.includes(searchTerm);

                        field.show = check;
                        line.show = check ? true : line.show; //if any check succeeds, show the whole line
                        sublist.show = line.show ? true : sublist.show; //show sublist if line is showing
                    }
                }
            }
        }

        window.postMessage(
            {
                dest: "zkpr_search_record",
                input: searchTerm,
            },
            window.location.href
        );
    }

    /**
     * Send call to navigate to the field on the record.
     */
    function scroll(field: any) {
        window.postMessage(
            {
                dest: "zkpr_inject_scroll",
                selectedElem: field,
            },
            window.location.href
        );

        //close popup
        window.postMessage(
            {
                dest: "zkpr-advanced-record-helper",
                toggleVisibility: true,
            },
            window.location.href
        );
    }

    /**
     * Change selected Tab number.
     */
    function toggleSelectedTab(selection: number) {
        setSelectedTab(selection);
    }

    /**
     * Build record data tables.
     */
    function getContent(): ReactElement {
        if (!record.type)
            return (
                <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            );

        let showBodyFields = selectedTab === 0 ? {} : { display: "none" };
        let showSublist = selectedTab === 1 ? {} : { display: "none" };

        return (
            <div>
                <div className="zkpr-table-container" style={showBodyFields}>
                    <BodyFields
                        record={record}
                        scroll={scroll}
                        simple={false}
                    />
                </div>
                <div style={showSublist}>
                    <Sublists record={record} scroll={scroll} />
                </div>
            </div>
        );
    }

    if (!props.user.zkprRecord)
        return (
            <div className="zkpr-record-helper">
                <h1>Cannot find record data.</h1>
            </div>
        );

    return (
        <div className="zkpr-record-helper">
            <h1>Advanced Record Helper</h1>
            <div className="zkpr-record-helper-header">
                <div style={{ width: "80%" }}>
                    <div className="zkpr-record-helper-title">
                        <h1>Type: "{record.type}"</h1>
                        <h1>Internal Id: "{record.id}"</h1>
                    </div>
                </div>
                <Links type={record.type || ""} />
            </div>
            <input
                autoFocus
                type="text"
                placeholder={"filter fields"}
                className="zkpr-prompt-input"
                style={{ padding: "10px", margin: "10px 0px 0px 0px" }}
                data-widget="TextInput"
                onChange={filterRecord}
                value={searchTerm}
            />
            <TabsCollection
                toggleSelectedTab={toggleSelectedTab}
                selectedTab={selectedTab}
                tabs={[
                    { index: 0, title: "Body Fields" },
                    { index: 1, title: "Sublists" },
                ]}
                tabClass={""}
            />
            {getContent()}
        </div>
    );
}
