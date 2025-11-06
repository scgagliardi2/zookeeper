import { useEffect, useState } from "react";
import "../TableComponents/Sass/Table.scss";
import "./Sass/RecordHelper.scss";
import "./Sass/RecordHeaderContent.scss";
import BodyFields from "./Components/BodyFields";
import { ConfigurationListType } from "../../Configuration/ConfigurationList";
import User from "../User/User";
import Prompt from "../Prompt/Prompt";
import Modal from "../Modal/Modal";
import Checkbox from "../Checkbox/Checkbox";

const fillIcon: string = chrome.runtime.getURL("img/icons/Fill/fill.png");
const loginIcon: string = chrome.runtime.getURL("img/icons/Login/login.png");

export default function RecordHeaderContent(props: {
    user: User;
    config: ConfigurationListType;
}) {
    const [input, setInput] = useState("");
    const [record, setRecord] = useState(props.user.zkprRecord);
    const [showResults, setShowResults] = useState(false);
    const [checked, setChecked] = useState(
        props.config.zkpr_default_field_ids_toggle
    );

    useEffect(() => {
        handleInputChange("");

        if (props.config.zkpr_default_field_ids_toggle) toggleFieldIds();

        window.addEventListener("message", (event: any) => {
            if (event.data.dest === "zkpr_search_record") {
                setInput(event.data.input);
            }
        });
    }, []);

    function toggleResults(show: boolean): void {
        setShowResults(show);
    }

    function handleInputChange(searchTerm: string) {
        for (const field of record.bodyFields) {
            if (typeof field.value == "object")
                field.value = JSON.stringify(field.value);
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

        for (const sublist of record.sublists) {
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

        toggleResults(!!searchTerm);
    }

    /**
     * Send call to navigate to the field on the record.
     */
    function scroll(field: any) {
        setInput("");
        toggleResults(false);

        window.postMessage(
            {
                dest: "zkpr_inject_scroll",
                selectedElem: field,
            },
            window.location.href
        );
    }

    function openRecordHelperModule(event: any) {
        event.preventDefault();

        setShowResults(false);

        window.postMessage(
            {
                dest: "zkpr-advanced-record-helper",
                toggleVisibility: true,
            },
            window.location.href
        );
    }

    function toggleExpandCollapse() {
        window.postMessage(
            {
                dest: "zkpr_toggle_expand_collapse",
            },
            window.location.href
        );
    }

    function toggleFieldIds() {
        window.postMessage(
            {
                dest: "zkpr_toggle_field_ids",
            },
            window.location.href
        );

        setChecked(!checked);
    }

    function fillFields() {
        window.postMessage(
            {
                dest: "zkpr_fill_fields",
            },
            window.location.href
        );
    }

    let deleteClass = props.user.isRedwood
        ? "zkpr-record-header-delete-button-redwood"
        : "zkpr-record-header-delete-button";
    let deleteButton =
        props.user.isEditMode && props.config.zkpr_show_delete_button ? (
            <div className={deleteClass}>
                <a href="javascript:NLInvokeButton(getButton('delete'))">
                    Delete
                </a>
            </div>
        ) : (
            <div></div>
        );

    return (
        <div className="zkpr-record-header-container">
            <div>{deleteButton}</div>
            <div
                style={{
                    display: !!props.config.zkpr_enable_search_record_fields
                        ? "flex"
                        : "none",
                    zIndex: 1001,
                }}
            >
                <Prompt
                    preSendRequest={() => {}}
                    prompt={input}
                    handlePromptChange={handleInputChange}
                    placeholder={"Search record body fields"}
                    loading={false}
                    autoFocus={false}
                    onFocus={() => toggleResults(!!input)}
                />
                <img
                    src={loginIcon}
                    className="zkpr-record-header-login-icon"
                    onClick={openRecordHelperModule}
                />
            </div>
            <div
                className="uir-unroll-tabs-button"
                title="Toggle Subtabs"
                onClick={toggleExpandCollapse}
                style={{
                    display: !!props.config.zkpr_show_expand_collapse_toggle
                        ? "block"
                        : "none",
                    marginRight: 10,
                    padding: 0,
                    width: "auto",
                }}
            >
                <a
                    href=""
                    onClick={toggleExpandCollapse}
                    className="uir-unroll-tabs-button-link"
                    style={{
                        backgroundColor: props.user.isRedwood ? "": "#607799",
                        margin: 0,
                    }}
                >
                    {props.user.isRedwood ? (
                        <svg
                            role="img"
                            className="uir-unroll-tabs-button-icon"
                            style={{
                                width: 25,
                                height: 25,
                            }}
                        >
                            <use href="/uiredwood/img/form/FormIcon.svg#UNROLLTABS"></use>
                        </svg>
                    ) : (
                        <span className="uir-unroll-tabs-button-icon"></span>
                    )}
                </a>
            </div>
            <div
                style={{
                    display: !!props.config.zkpr_show_field_ids_toggle
                        ? "block"
                        : "none",
                }}
            >
                <Checkbox
                    defaultChecked={checked}
                    clickBox={() => toggleFieldIds()}
                    label={"Toggle Field Ids"}
                />
            </div>
            <div
                className="zkpr-record-header-table-container"
                style={{
                    display: !!showResults ? "block" : "none",
                }}
            >
                <div className="zkpr-record-header-input-table">
                    <button
                        className="zkpr-record-header-input-button"
                        onClick={openRecordHelperModule}
                    >
                        See Advanced Record Data
                    </button>
                    <BodyFields record={record} scroll={scroll} simple={true} />
                </div>
            </div>
            <div
                style={{
                    display: !!showResults ? "block" : "none",
                }}
            >
                <Modal toggleVisibility={() => toggleResults(false)} />
            </div>
        </div>
    );
}
