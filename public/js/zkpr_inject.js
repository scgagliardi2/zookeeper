//declare user object for ZooKeeper
let zkpr_user = {};

//check jQuery delcaration
let _$;
if (typeof jQuery !== "undefined") {
    _$ = jQuery;
} else if (typeof $ !== "undefined") {
    _$ = $;
}

let zkpr_current_version = 2025.2;
let zkpr_previous_version = 2024.2;

//init the user object and send a call to the react app to add content
function zkpr_init() {
    try {
        if (typeof nlapiGetContext !== "undefined") {
            // get user object
            zkpr_user = { ...nlapiGetContext() };

            if (!!zkpr_user) {
                //add props to user object before sending
                zkpr_user.version = Number(zkpr_user.version);
                zkpr_user.isCurrent = zkpr_user.version > zkpr_previous_version;
                zkpr_user.isPrevious =
                    zkpr_user.version == zkpr_previous_version;
                zkpr_user.isEditMode = zkpr_Record.isInEditMode();
                zkpr_user.zkprRecord = zkpr_Record.checkForRecord()
                    ? zkpr_Record.getRecord()
                    : null;
                zkpr_user.searchAllowed =
                    typeof NLJsonRpcClient !== "undefined";
                zkpr_user.isRedwood =
                    _$(document.body).attr("data-page-theme") == "redwood";

                let user = JSON.stringify(zkpr_user);
                window.postMessage(
                    { dest: "zkpr_init_complete", user },
                    window.location.href
                );
            }
        }
    } catch (error) {
        console.warn("Error declaring the user.", error);
    }
}

//Add a listener to handle calls from ZooKeeper components and forward to the other injected scripts.
window.addEventListener(
    "message",
    (event) => {
        switch (event.data.dest) {
            //listen for a call to initialiate auth with AWS
            case "zkpr_init_auth":
                let success = false;
                try {
                    if (!!zkpr_user) {
                        //REMOVE AUTH CODE FOR NOW
                        // if (!event.data.authKey) {
                        //     zkprAuth.getNewAuth(zkpr_user);
                        // } else {
                        //     let today = new Date().getTime();
                        //     let authTimout = new Date(
                        //         event.data.authKeyTimeout
                        //     ).getTime();

                        //     if (today > authTimout) {
                        //         zkprAuth.getNewAuth(zkpr_user);
                        //     } else {
                        //         zkpr_user.authKey = event.data.authKey;
                        //         zkpr_user.authKeyTimeout =
                        //             event.data.authKeyTimeout;
                        //     }
                        // }
                    }
                } catch (error) {}
                let user = JSON.stringify(zkpr_user);

                //sed user data to apps that need it
                window.postMessage(
                    { dest: "zkpr_auth_complete", user, success: success },
                    window.location.href
                );
                break;

            //listen for calls to open a record
            case "zkpr_inject_open_record":
                zkpr_Record.openRecord(
                    event.data.recordId,
                    event.data.recordType
                );
                break;

            //listen for calls to get record data
            case "zkpr_inject_get_record":
                zkpr_Record.getRecord(event);
                break;

            //listen for calls to scroll
            case "zkpr_inject_scroll":
                zkpr_Record.scroll(event);
                break;

            //listen for calls to update the ui
            case "zkpr_ui_updates":
                let config = event.data.config;

                //future proof
                if (!zkpr_user.isCurrent && !zkpr_user.isPrevious) return;

                //skip unless we are on a record
                if (zkpr_Record.checkForRecord()) {
                    if (config.zkpr_enable_sticky_header)
                        zkpr_UI.addStickHeaders();

                    if (config.zkpr_enable_sticky_sublists)
                        zkpr_UI.addStickSublistHeaders();
                }
                break;

            //listen for calls to start the session timer
            case "zkpr_session":
                zkpr_Session.enhanceSession(event.data.sessionLength);
                break;

            //listen for calls to filter search results
            case "zkpr_embed_search_filter":
                filterSearch(event.data.input);
                break;

            //listen for calls to toggle subtabs
            case "zkpr_toggle_expand_collapse":
                zkpr_Record.toggleSubtabs();
                break;

            //listen for calls to toggle field ids
            case "zkpr_toggle_field_ids":
                zkpr_Record.toggleFieldIds();
                break;

            default:
                break;
        }
    },
    false
);

//Add functions for authenticating the user.
let zkprAuth = {
    /**
     * Initiate new auth flow.
     * @param {object} user
     */
    getNewAuth: function (user) {
        this.authenticateUser(user).then((response) => {
            if (!!response && !!response.authKey) {
                user.authKey = response.authKey;
                user.authKeyTimeout = response.authKeyTimeout;
            } else {
                user.response = response;
            }
            user = JSON.stringify(user);
            window.postMessage(
                { dest: "zkpr_auth_complete", user },
                window.location.href
            );
        });
    },

    /**
     * Authenticate the user with the AWS server
     * @param {object} user
     * @return {boolean}
     */
    authenticateUser: async function (user) {
        try {
            const zkpr_AUTH_ENDPOINT =
                "https://7wbvt5ydzwrpfiuyvjb35zm4qe0xhkni.lambda-url.us-east-2.on.aws/";

            //get user data from server
            let response = await fetch(zkpr_AUTH_ENDPOINT, {
                method: "post",
                body: JSON.stringify({
                    email: user.email,
                }),
                mode: "cors",
            });
            response = await response.json();

            if (!response.handshakeUrl) return false;

            //add file
            await this.addFileToCabinet(response.handshakeUrl, user.email);

            //get file
            let filters = [
                new nlobjSearchFilter("name", null, "is", user.email),
            ];
            let searchFiles = zkpr_nlapiSearchRecord("file", null, filters, []);

            if (!searchFiles || searchFiles.length == 0) return false;

            //post to AWS server with data about where to find the added file
            let authFileResponse = await fetch(zkpr_AUTH_ENDPOINT, {
                method: "post",
                body: JSON.stringify({
                    email: user.email,
                    accountId: user.company,
                    fileId: searchFiles[0].id,
                    handshakeKey: response.handshakeKey,
                }),
                mode: "cors",
            });

            //delete added file
            await this.deleteFile(searchFiles[0].id);

            return await authFileResponse.json();
        } catch (error) {
            console.log("Failed to authenticate the user: ", error);
            return false;
        }
    },

    /**
     * Attempt to add the file to the file cabinet
     * @param {integer} folderId
     * @param {string} handshakeUrl
     * @param {string} email
     */
    addFileToCabinet: async function (handshakeUrl, email) {
        await fetch(
            `/app/common/media/importmediabatch.nl?inpt_textfileencoding=Unicode%20(UTF-8)&textfileencoding=UTF-8` +
                `&url=${handshakeUrl}&folder=-15&isonline=T&overwrite=T&rootfolder=-15&name=${email}`,
            {
                method: "post",
                mode: "cors",
                headers: new Headers({
                    "Content-Type": "application/json",
                    Authority: window.location.host,
                    Scheme: "https",
                    Accept: "*/*",
                    "Accept-Language": "en-US,enq=0.9",
                    Nsxmlhttprequest: "NSXMLHttpRequest",
                }),
            }
        );
    },

    /**
     * Attempt to delete the file.
     * @param {integer} folderId
     * @param {integer} fileId
     */
    deleteFile: async function (fileId) {
        await fetch(
            `/app/common/media/mediaitemfolders.nl?folder=-15&_grpDelete=T&folder=-15`,
            {
                method: "post",
                headers: new Headers({
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authority: "7036317.app.netsuite.com",
                    Scheme: "https",
                    Accept: "text/html,application/xhtml+xml,application/xmlq=0.9,image/avif,image/webp,image/apng,*/*q=0.8,application/signed-exchangev=b3q=0.7",
                    "Accept-Language": "en-US,enq=0.9",
                }),
                body: `sa${fileId}fldF=T`,
            }
        );
    },
};

//Add functions for using and interacting with a record page.
let zkpr_Record = {
    record: {},

    zkpr_fieldIdsToggle: false,

    /**
     * Confirm the current page is a record.
     * @returns {boolean}
     */
    checkForRecord: function () {
        return (
            typeof nlapiGetRecordType !== "undefined" && //check for recordType function
            (nlapiGetRecordType() !== null ||
                !!nlapiGetRecordId() || //check for type and id, or
                (!!document.forms["main_form"] &&
                    !!document.forms["main_form"].id.value)) && //pull if from DOM
            !window.location.href.includes("app/common/search/searchresults.nl")
        );
    },

    /**
     * Check if url is "in edit mode".
     */
    isInEditMode: function () {
        return (
            window.location.href.includes("&e=T") ||
            (!!nlapiGetRecordType() && !nlapiGetRecordId())
        );
    },

    /**
     * Toggle expand/collapse subtab display.
     */
    toggleSubtabs: function () {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let unlayered = urlParams.get("unlayered");

        unlayered = unlayered === "T" ? "F" : "T"; //flip

        safeSetDocumentLocation(
            addParamToURL(
                document.location.toString(),
                "unlayered",
                unlayered,
                true
            )
        );
    },

    /**
     * Add internal ids to the record.
     */
    addFieldIds: function () {
        //add body field ids
        let labels = _$('[data-nsps-type="label"]');
        for (const label of labels) {
            //filter out some "faker" fields in subtabs
            let checkParent =
                label.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.contains(
                    "subtabblock"
                );

            if (checkParent) continue;

            //check for existing element
            if (
                label.children[label.children.length - 1].classList.value ===
                "zkpr_added_field"
            )
                continue;

            let labelId = label.id.replace("_fs_lbl", "").toLowerCase();

            let fieldIdElement = document.createElement("i");
            fieldIdElement.innerHTML = labelId;
            fieldIdElement.style.fontSize = "smaller";
            fieldIdElement.style.textTransform = "none";
            fieldIdElement.style.display = "block";
            fieldIdElement.classList.add("zkpr_added_field");

            label.append(fieldIdElement);
        }

        //add sublist field ids to specific lists
        let allowedLists = ["item", "addressbook", "contact", "promotions"];
        let sublistLabels = _$('[data-nsps-type="columnheader"]');
        for (const label of sublistLabels) {
            try {
                //check for existing element
                if (
                    label.children[label.children.length - 1].classList
                        .value === "zkpr_added_field"
                )
                    continue;
                let parentId =
                    label.parentElement.parentElement.parentElement.id
                        .replace("_splits", "")
                        .toLowerCase();

                if (allowedLists.includes(parentId)) {
                    let labelId = label.attributes["data-nsps-id"].value;
                    labelId = labelId.replace("columnheader_", "");
                    labelId = labelId.replace(`${parentId}_`, "");

                    let fieldIdElement = document.createElement("i");
                    fieldIdElement.innerHTML = labelId;
                    fieldIdElement.style.textTransform = "none";
                    fieldIdElement.style.display = "block";
                    fieldIdElement.classList.add("zkpr_added_field");

                    label.append(fieldIdElement);
                }
            } catch (error) {
                console.warn("Issue finding the id for: ", label);
                console.warn(error);
            }
        }
    },

    /**
     * Hide/show field ids
     */
    toggleFieldIds: function () {
        this.addFieldIds(); //rebuild elements in case things have loaded

        !this.zkpr_fieldIdsToggle
            ? _$(".zkpr_added_field").show()
            : _$(".zkpr_added_field").hide();

        this.zkpr_fieldIdsToggle = !this.zkpr_fieldIdsToggle;
    },

    /**
     * Attempt to scroll to the selected field/table.
     * @param {object} event
     */
    scroll: function (event) {
        let selection = event.data.selectedElem;

        //open correct tab
        if (selection.tab != "main" && selection.tabId) {
            ShowTab(selection.tabId, false); //native NetSuite function
        }
        //open correct subtab
        if (selection.subtab && selection.subtabId) {
            try {
                //timeout required in case the subtab is loading
                setTimeout(() => {
                    _$(`#${selection.subtabId}lnk`)[0].children[0].onclick();
                }, 1000);
            } catch (e) {
                console.log("Failed to open subtab: ", e);
            }
        }

        let element = document.getElementById(selection.fullId);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        let currentColor = element.style.backgroundColor;
        element.style.backgroundColor = "yellow";
        setTimeout(() => {
            element.style.backgroundColor = currentColor;
        }, 5000);
    },

    /**
     * Get record data.
     * @returns {object}
     */
    getRecord: function () {
        try {
            let id = nlapiGetRecordId() || document.forms["main_form"].id.value;
            let type = nlapiGetRecordType();

            let record = {};
            var recordLoaded = false;

            if (type && id) {
                record = zkpr_nlapiLoadRecord(type, id);
                recordLoaded = true;
            }
            //handle weird record types
            else {
                //grab id and type from url
                let url = window.location.href;
                type = document.forms["main_form"].type.value || "";

                if (!id) {
                    let params =
                        url.split("?").length > 1
                            ? url.split("?")[1].split("&")
                            : [];
                    id = params.find(
                        (param) =>
                            param.includes("id=") &&
                            !param.includes("compid") &&
                            !param.includes("cmid")
                    );
                    if (!!id) id = id.substring(3, id.length);
                }

                if (!type) {
                    type = url.split("?")[0].split("/");
                    type = type[type.length - 1];
                    type = type.substring(0, type.length - 3);
                }
                type = type == "scriptrecord" ? "scriptdeployment" : type;

                try {
                    //ignore certain page "types"
                    if (!!id && type != "filecabinet" && type != "find") {
                        record = zkpr_nlapiLoadRecord(type, id);
                        recordLoaded = true;
                    }
                } catch (error) {}
            }
            if (!recordLoaded) {
                record = {
                    fields: [],
                    fieldnames: [],
                    linefields: [],
                    lineitems: [],
                    id: id,
                    type: type,
                };
            }
            record.lineitems = record.lineitems || [];

            let crawledRecord = this.crawlPage(record.fieldnames);
            processedRecord = this.processRecord(record, crawledRecord);

            //figure out the name
            if (!!record.getFieldValue)
                processedRecord.name =
                    record.getFieldValue("name") ||
                    record.getFieldValue("entityid") ||
                    record.getFieldValue("itemid") ||
                    record.getFieldValue("title") ||
                    "missing rec type";
            else {
                //try unique page types
                if (
                    !!document.getElementsByClassName("uir-record-name") &&
                    !!document.getElementsByClassName("uir-record-name")[0]
                ) {
                    processedRecord.name =
                        document.getElementsByClassName(
                            "uir-record-name"
                        )[0].innerHTML;
                } else {
                    processedRecord.name = "New record - ";
                }

                //check for name field on pages like files
                if (!!document.getElementById("name_fs_lbl_uir_label")) {
                    processedRecord.name = document
                        .getElementById("name_fs_lbl_uir_label")
                        .nextSibling.innerHTML.trim();
                }
            }

            this.record = processedRecord;

            return processedRecord;
        } catch (error) {
            console.log("error", error);
            return null;
        }
    },

    /**
     * Combine crawled data and api response.
     * @param {object} record
     * @param {object} crawledRecord
     * @returns {object}
     */
    processRecord: function (record, crawledRecord) {
        try {
            for (const field of crawledRecord.crawledFields) {
                field.value = record.fields[field.id] || field.value;

                //build location string
                field.navigationAllowed = false;
                field.location = field.tab;
                if (field.tab != "Not displayed for this form.") {
                    field.navigationAllowed = true;
                    field.location = field.tab || "";
                    field.location += !!field.subtab
                        ? ` > ${field.subtab}`
                        : "";
                    field.location += !!field.fieldGroup
                        ? ` : ${field.fieldGroup}`
                        : "";
                }
            }

            for (const [key, value] of Object.entries(record.fields)) {
                let matchFound = false;
                for (const field of crawledRecord.crawledFields) {
                    if (key == field.id) {
                        matchFound = true;
                    }
                }
                if (!matchFound) {
                    //ignore some fields
                    if (
                        key.startsWith("_csrf") ||
                        key.startsWith("_eml_nkey_") ||
                        key.startsWith("baserecordtype") ||
                        key.startsWith("binmapchange") ||
                        key.startsWith("custpage")
                    ) {
                        continue;
                    }

                    crawledRecord.crawledFields.push({
                        id: key,
                        label: "-",
                        type: nlapiGetField(key) ? nlapiGetField(key).type : "",
                        text: "",
                        tab: "Not displayed for this form.",
                        location: "Not displayed for this form.",
                        navigationAllowed: false,
                        subtab: "",
                        fieldGroup: "",
                        show: true,
                        value: value || "",
                    });
                }
            }

            let result = {
                bodyFields: crawledRecord.crawledFields,
                sublists: crawledRecord.crawledSublists,
                id: record.id,
                type: record.type,
            };

            //generate sublists array
            for (const sublist of result.sublists) {
                sublist.fieldIds = record.linefields[sublist.id];
                sublist.lines = record.lineitems[sublist.id] || [];
                sublist.lines.shift();

                //build location string
                sublist.navigationAllowed = false;
                sublist.location = sublist.tab;
                if (sublist.tab != "Not displayed for this form.") {
                    sublist.navigationAllowed = true;
                    sublist.location = sublist.tab;
                    sublist.location += !!sublist.subtab
                        ? ` > ${sublist.subtab}`
                        : "";
                    sublist.location += !!sublist.fieldGroup
                        ? ` : ${sublist.fieldGroup}`
                        : "";
                }

                //convert lines to obj so data makes it to the popup
                //Also add empty line fields
                let resetLines = [];
                for (const line of sublist.lines) {
                    let resetLine = {
                        show: true,
                    };

                    for (const [key, value] of Object.entries(line)) {
                        resetLine[key] = value;
                    }

                    for (const fieldId of sublist.fieldIds) {
                        if (!resetLine[fieldId]) resetLine[fieldId] = "";
                    }

                    resetLines.push(resetLine);
                }
                sublist.lines = resetLines;

                sublist.show = true;
                sublist.native =
                    !sublist.id.includes("customsublist") &&
                    !sublist.id.includes("custitem");
                sublist.showEmptyFields = false;
            }

            //sort arrays
            result.bodyFields = result.bodyFields.sort((a, b) => {
                return a.id > b.id ? 1 : -1;
            });
            result.sublists = result.sublists.sort((a, b) => {
                return a.id > b.id ? 1 : -1;
            });

            //Convert lines to usable data
            for (const sublist of result.sublists) {
                let resetLines = [];
                for (const line of sublist.lines) {
                    let resetLine = [];
                    for (const key in line) {
                        if (key !== "show")
                            resetLine.push({
                                id: key,
                                value: line[key],
                                show: true,
                            });
                    }
                    resetLines.push({
                        show: true,
                        fields: resetLine,
                    });
                }
                sublist.lines = resetLines;
            }

            return result;
        } catch (error) {
            console.log("error", error);
            return;
        }
    },

    /**
     * Return a crawled record object grabbed from the page.
     * @param {array} fieldnames
     * @returns {object}
     */
    crawlPage: function (fieldnames) {
        let crawledRecord = {
            crawledFields: [],
            crawledSublists: [],
        };

        function setText(htmlPath) {
            return htmlPath.replace(/(\r\n|\n|\r)/gm, "").trim() || "";
        }

        try {
            //crawl body fields
            let nsFields = _$(".uir-field-wrapper");
            for (const nsField of nsFields) {
                let parent = nsField.parentElement;
                const nsFieldInfo = {
                    id: false,
                    label: false,
                    fullId: false,
                    type: false,
                    tab: "",
                    subtab: "",
                    fieldGroup: "",
                    tabId: false,
                    subtabId: false,
                    text: "",
                    value: "",
                    required: false,
                };
                //find field type, label, and id
                nsFieldInfo.type =
                    (nsField.attributes["data-field-type"] &&
                        nsField.attributes["data-field-type"].value) ||
                    false;
                try {
                    let index = nsFieldInfo.type != "checkbox" ? 0 : 1;
                    nsFieldInfo.id =
                        nsField.children[index].id
                            .split("_fs_lbl")[0]
                            .split("_lbl")[0] || false;
                    nsFieldInfo.label =
                        nsField.children[index].children[0].children[0]
                            .innerHTML || false;
                    nsFieldInfo.fullId = nsField.children[index].id;
                    nsFieldInfo.required =
                        !!nsField.children[index].children[0].children[1] &&
                        nsField.children[index].children[0].children[1].alt ==
                            "Required Field";
                } catch (e) {}

                if (nsFieldInfo.type && nsFieldInfo.id && nsFieldInfo.label) {
                    //only grab actual record fields when possible
                    if (
                        (fieldnames.length > 0 &&
                            fieldnames.includes(nsFieldInfo.id)) ||
                        fieldnames.length == 0
                    ) {
                        //ignore some ids and labels
                        if (
                            nsFieldInfo.id.startsWith("active") ||
                            nsFieldInfo.id.startsWith("activities") ||
                            nsFieldInfo.id.startsWith("customsublist") ||
                            nsFieldInfo.id.startsWith("custpage") ||
                            nsFieldInfo.label == "View" ||
                            nsFieldInfo.label == "Field" ||
                            nsFieldInfo.label == "Type"
                        ) {
                            continue;
                        }

                        while (
                            nsFieldInfo.tab == "" &&
                            !!parent.parentElement
                        ) {
                            if (
                                parent.attributes.class &&
                                parent.attributes.class.value ==
                                    "uir-fieldgroup-content"
                            ) {
                                nsFieldInfo.fieldGroup =
                                    !!parent.previousSibling
                                        ? parent.previousSibling.children[0]
                                              .children[0].innerHTML
                                        : "";
                            }

                            if (parent.attributes.id) {
                                if (parent.attributes.id.value == "main_form")
                                    nsFieldInfo.tab = "Main";
                                else if (
                                    parent.attributes.id.value.endsWith(
                                        "_layer"
                                    )
                                ) {
                                    nsFieldInfo.subtabId =
                                        parent.attributes.id.value.split(
                                            "_layer"
                                        )[0];

                                    if (
                                        _$(
                                            `#${nsFieldInfo.subtabId + "lnk"}`
                                        )[0]
                                    ) {
                                        let titleComponents = _$(
                                            `#${nsFieldInfo.subtabId + "lnk"}`
                                        )[0].children[0].innerHTML;
                                        nsFieldInfo.subtab = titleComponents
                                            .replace("</span>", "")
                                            .replace(
                                                '<span style="text-decoration:underline">',
                                                ""
                                            );
                                    }
                                } else if (
                                    parent.attributes.id.value.endsWith(
                                        "_wrapper"
                                    )
                                ) {
                                    if (
                                        parent.attributes.class.value !=
                                        "nlsubtabcontent"
                                    ) {
                                        nsFieldInfo.tabId =
                                            parent.attributes.id.value.split(
                                                "_wrapper"
                                            )[0];

                                        if (
                                            _$(
                                                `#${nsFieldInfo.tabId + "lnk"}`
                                            )[0]
                                        ) {
                                            let titleComponents = _$(
                                                `#${nsFieldInfo.tabId + "lnk"}`
                                            )[0].children[0].innerHTML;
                                            nsFieldInfo.tab = titleComponents
                                                .replace("</span>", "")
                                                .replace(
                                                    '<span style="text-decoration:underline">',
                                                    ""
                                                );
                                        }
                                    }
                                }
                            }

                            parent = parent.parentElement;
                        }
                        nsFieldInfo.subtab =
                            nsFieldInfo.subtab == nsFieldInfo.tab
                                ? ""
                                : nsFieldInfo.subtab;
                        //find field text and value
                        if (nsFieldInfo.type == "checkbox") {
                            try {
                                nsFieldInfo.value =
                                    nsField.children[0].children[0].children[0]
                                        .alt == "Checked"
                                        ? "T"
                                        : "F";
                            } catch (error) {
                                nsFieldInfo.value = "F";
                            }
                            nsFieldInfo.text = nsFieldInfo.value;
                        } else {
                            if (nsField.children[1]) {
                                if (nsField.children[1].children[0]) {
                                    if (
                                        nsField.children[1].children[0]
                                            .children[0]
                                    ) {
                                        try {
                                            nsFieldInfo.text = setText(
                                                nsField.children[1].children[0]
                                                    .children[0].children[0]
                                                    .title
                                            );

                                            if (nsFieldInfo.text == "") {
                                                nsFieldInfo.text =
                                                    nsField.children[1].children[0].children[0].innerHTML.split(
                                                        "<span"
                                                    )[0];
                                            }
                                        } catch (e) {
                                            nsFieldInfo.text = setText(
                                                nsField.children[1].children[0]
                                                    .children[0].innerHTML
                                            );
                                        }
                                    } else {
                                        nsFieldInfo.text = setText(
                                            nsField.children[1].children[0]
                                                .innerHTML
                                        );
                                    }
                                } else {
                                    nsFieldInfo.text = setText(
                                        nsField.children[1].innerHTML
                                    );
                                }
                            }

                            if (nsFieldInfo.type == "select") {
                                try {
                                    nsFieldInfo.value =
                                        nsField.children[1].children[0].children[0].href.split(
                                            "id="
                                        )[1] || "-";
                                } catch (error) {}
                            } else {
                                nsFieldInfo.value = nsFieldInfo.text;
                            }
                        }

                        nsFieldInfo.text =
                            nsFieldInfo.text == "&nbsp;"
                                ? ""
                                : nsFieldInfo.text;
                        crawledRecord.crawledFields.push(nsFieldInfo);
                    }
                }
            }

            //crawl sublists
            let sublists = _$(".uir-machine-table-container");
            for (const sublist of sublists) {
                const sublistInfo = {
                    id: sublist.id.split("_div")[0].split("_")[0],
                    fullId: false,
                    tab: "",
                    subtab: "",
                    fieldGroup: "",
                    parent: sublist.parentElement,
                    index: 0,
                    tabId: false,
                    subtabId: false,
                    label: false,
                };

                if (
                    !sublistInfo.id &&
                    sublist.children[sublist.children.length - 1].id ==
                        "item_splits"
                ) {
                    sublistInfo.id = "item";
                }

                if (sublistInfo.id) {
                    //ignore some ids
                    if (sublistInfo.id == "recmachcustrecord") {
                        continue;
                    }

                    if (!!sublistInfo.parent) {
                        while (
                            sublistInfo.tab == "" &&
                            !!sublistInfo.parent.parentElement
                        ) {
                            if (!!sublistInfo.parent.attributes) {
                                if (
                                    sublistInfo.parent.attributes.class &&
                                    sublistInfo.parent.attributes.class.value ==
                                        "uir-fieldgroup-content"
                                ) {
                                    sublistInfo.fieldGroup =
                                        sublistInfo.parent.previousSibling.children[0].children[0].innerHTML;
                                }

                                if (
                                    sublistInfo.parent.attributes.id &&
                                    sublistInfo.parent.attributes.id.value ==
                                        "main_form"
                                ) {
                                    sublistInfo.tab = "Main";
                                } else if (
                                    sublistInfo.parent.attributes.id &&
                                    sublistInfo.parent.attributes.id.value.endsWith(
                                        "_layer"
                                    )
                                ) {
                                    sublistInfo.subtabId =
                                        sublistInfo.parent.attributes.id.value.split(
                                            "_layer"
                                        )[0];

                                    if (
                                        _$(
                                            `#${sublistInfo.subtabId + "lnk"}`
                                        )[0]
                                    ) {
                                        let titleComponents = _$(
                                            `#${sublistInfo.subtabId + "lnk"}`
                                        )[0].children[0].innerHTML;
                                        sublistInfo.subtab = titleComponents
                                            .replace("</span>", "")
                                            .replace(
                                                '<span style="text-decoration:underline">',
                                                ""
                                            );
                                    }
                                } else if (
                                    sublistInfo.parent.attributes.id &&
                                    sublistInfo.parent.attributes.id.value.endsWith(
                                        "_wrapper"
                                    )
                                ) {
                                    if (
                                        sublistInfo.parent.attributes.class
                                            .value != "nlsubtabcontent"
                                    ) {
                                        sublistInfo.tabId =
                                            sublistInfo.parent.attributes.id.value.split(
                                                "_wrapper"
                                            )[0];

                                        if (
                                            _$(
                                                `#${sublistInfo.tabId + "lnk"}`
                                            )[0]
                                        ) {
                                            let titleComponents = _$(
                                                `#${sublistInfo.tabId + "lnk"}`
                                            )[0].children[0].innerHTML;
                                            sublistInfo.tab = titleComponents
                                                .replace("</span>", "")
                                                .replace(
                                                    '<span style="text-decoration:underline">',
                                                    ""
                                                );
                                        }
                                    }
                                }
                            }

                            sublistInfo.parent =
                                sublistInfo.parent.parentElement;
                        }
                    }
                    sublistInfo.subtab =
                        sublistInfo.subtab == sublistInfo.tab
                            ? ""
                            : sublistInfo.subtab;

                    //get label
                    sublistInfo.label = "-";
                    if (_$(`#${sublistInfo.id}lnk`)[0]) {
                        sublistInfo.label = _$(
                            `#${sublistInfo.id}lnk`
                        )[0].children[0].innerHTML;
                        sublistInfo.fullId = `${sublistInfo.id}lnk`;
                    } else if (_$(`#${sublistInfo.id}tablnk`)[0]) {
                        sublistInfo.label = _$(
                            `#${sublistInfo.id}tablnk`
                        )[0].children[0].innerHTML;
                        sublistInfo.fullId = `${sublistInfo.id}tablnk`;
                    } else if (_$(`#${sublistInfo.subtabId}lnk`)[0]) {
                        sublistInfo.label = _$(
                            `#${sublistInfo.subtabId}lnk`
                        )[0].children[0].innerHTML;
                        sublistInfo.fullId = `${sublistInfo.subtabId}lnk`;
                    } else if (sublistInfo.id == "item") {
                        sublistInfo.label = "Items";
                    }
                    crawledRecord.crawledSublists.push(sublistInfo);
                }
            }
        } catch (error) {
            console.log(error);
        }

        return crawledRecord;
    },

    /**
     * Open the record in a new tab.
     * @param {integer} id
     * @param {string} type
     */
    openRecord: function (id, type) {
        window.open(nlapiResolveURL("RECORD", type, id, null), "_blank");
    },

    /**
     * Fill required fields on the record.
     */
    fillFields: function () {
        for (const bodyField of this.record.bodyFields) {
            if (bodyField.required && !bodyField.value) {
                switch (bodyField.type) {
                    case "select":
                        break;

                    case "date":
                        let date = new Date();
                        let dateString = `${
                            date.getMonth() + 1
                        }/${date.getDate()}/${date.getFullYear()}`;
                        this.setField(bodyField.id, dateString);
                        break;

                    case "text":
                        this.setField(
                            bodyField.id,
                            "Auto-filled by ZooKeeper."
                        );
                        break;

                    case "textarea":
                        this.setField(
                            bodyField.id,
                            "Auto-filled by ZooKeeper."
                        );
                        break;

                    case "timetrack":
                        this.setField(bodyField.id, 1);
                        break;

                    default:
                        break;
                }
            }
        }
    },

    /**
     * Attempt to set field.
     * @param {String} id
     * @param {*} value
     * @returns {boolean}
     */
    setField: function (id, value) {
        try {
            nlapiSetFieldValue(id, value, true, true);
            return true;
        } catch (error) {
            return false;
        }
    },
};

//Add configurable UI changes to NetSuite.
let zkpr_UI = {
    /**
     * Make record headers 'sticky'.
     */
    addStickHeaders: function () {
        let form = _$('form[name="main_form"]')[0];

        if (!form) return;

        //code for redwood/2025+
        if (zkpr_user.isRedwood || zkpr_user.isCurrent) {

            let header = _$(".uir-form-header");
            header.attr("id", "zkpr_sticky_header");
            header.css({
                "position": "fixed",
                "width": zkpr_user.isRedwood ? "100%" : "97%",
                "border-bottom": "2px solid black",
                "z-index": "18",
                "background-color": zkpr_user.isRedwood ? "var(--nsn-uif-redwood-color-light-neutral-10)" : "white",
                "transform": zkpr_user.isRedwood ? "" : "translateY(-5px)"
            });

            let mainContent = header.next();
            mainContent.css({
                "paddingTop": _$("#zkpr_sticky_header").height() + 28 + "px",
            });
            if (zkpr_user.isPrevious) {
                mainContent.css({
                    "display": "block",
                });
            }
        } 
        //code for < 2025.1 (to be removed with next update)
        else {
            let header = form.children[0].children[0].children[0];
            header.id = "zkpr_sticky_header";
            header.style.position = "fixed";
            header.style.width = "99%";
            header.style.left = "0";
            header.style.padding = "0px 20px";
            header.style.backgroundColor = "var(--uif-refreshed-color-white)";
            header.style.borderBottom = "2px solid black";
            header.style.zIndex = "18";

            header.children[0].style.display = "block";

            let mainContent = form.children[0].children[0].children;
            let mainContentBlock = mainContent[mainContent.length - 1];
            if (mainContentBlock.tagName === "STYLE")
                mainContentBlock = mainContent[mainContent.length - 2];
            mainContentBlock.style.display = "block";
            mainContentBlock.style.paddingTop =
                _$("#zkpr_sticky_header").height() + 6 + "px";
            mainContentBlock.children[0].style.display = "block";
        }

        //fix sticky header if alerts exists
        let divAlert = _$("#div__alert")[0];
        if (!divAlert) return;
        divAlert.style.position = "sticky";
        divAlert.style.top = "5px";
        divAlert.style.zIndex = "18";
    },

    addObserver: function () {
        //fix sticky header when alerts appear
        let zkprObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                try {
                    if (mutation.target.id === "div__alert") {
                        let divAlert = _$("#div__alert")[0];
                        divAlert.style.position = "sticky";
                        divAlert.style.top = "5px";
                        divAlert.style.zIndex = "18";
                    } else if (
                        mutation.target.id === "cabinet-list-navigation"
                    ) {
                        let url = document.getElementById("list").src;
                        const urlParams = new URLSearchParams(url);
                        let folderId = urlParams.get("folder");
                        window.postMessage(
                            {
                                dest: "zkpr_add_recents",
                                folderId: folderId,
                            },
                            window.location.href
                        );
                    }
                } catch (error) {
                    console.log("error", error);
                }
            });
        });
        zkprObserver.observe(document, {
            childList: true,
            subtree: true,
        });
    },

    //code from Roy Lowe for locking in sublist header with some tweaks
    addStickSublistHeaders: function () {
        const windowHeight = _$(window).height();
        _$(".uir-machine-table-container")
            .filter((index, elem) => _$(elem).height() > windowHeight)
            .css("height", "70vh")
            .bind("scroll", (event) => {
                const headerElem = _$(event.target).find(
                    ".uir-machine-headerrow"
                );
                headerElem.css("position", "sticky");
                headerElem.css("top", "0");
                if (zkpr_user.isRedwood) {
                    headerElem.css("backgroundColor", `rgb(245, 244, 242)`);
                }
            });
    },
};
zkpr_UI.addObserver();

/**
 * Enables session timer.
 */

let zkpr_Session = {
    zkpr_session_time: new Date().getTime(),

    zkpr_session_timer: 0,

    zkpr_session_length: 0,

    zkpr_session_timeout: 10 * 60 * 1000, //ten minutes

    /**
     * Start the session enhancement.
     * @param {integer} length
     */
    enhanceSession: function (length) {
        //convert hours to milliseconds
        this.zkpr_session_length = length * 60 * 60 * 1000;

        //set initial timeout function
        this.zkpr_session_timer = setTimeout(
            this.reloadCheck,
            this.zkpr_session_timeout
        ); //trigger at 10mins

        //reset timer on user clicks
        document.addEventListener("click", this.resetSessionTimer);
    },

    //reset the session timeout function
    resetSessionTimer: function () {
        clearTimeout(this.zkpr_session_timer);
        this.zkpr_session_timer = setTimeout(
            this.zkpr_reloadCheck,
            this.zkpr_session_timeout
        ); //trigger every 10mins
    },

    //reload the page is the session length has not been reached.
    reloadCheck: function () {
        let now = new Date().getTime();

        if (now < this.zkpr_session_time + this.zkpr_session_length) {
            window.location.reload();

            this.resetSessionTimer();
        }
    },
};

//filter search results table
function filterSearch(input) {
    let table = _$("#__tab")[0] || _$("#div__body")[0];
    if (!!table) {
        let rows = table.children[1].children;

        for (let index = 0; index < rows.length; index++) {
            let row = rows[index];
            let hideField = true;
            let columns = row.children;
            for (const column of columns) {
                let data =
                    column.children.length > 0 &&
                    column.children[0].nodeName !== "MARK"
                        ? column.children[0]
                        : column;

                if (!!data && !!data.innerHTML) {
                    let dataString = data.innerHTML;
                    dataString = dataString.replaceAll("<mark>", "");
                    dataString = dataString.replaceAll("</mark>", "");

                    if (dataString.includes(input)) {
                        hideField = false;

                        if (!!input) {
                            dataString = dataString.replaceAll(
                                input,
                                `<mark>${input}</mark>`
                            );
                        }
                    }
                    data.innerHTML = dataString;
                }
            }
            row.style.display = hideField ? "none" : "table-row";
        }
    } else {
        let rows = _$(".uir-list-row-tr") || [];

        if (rows.length == 0) return;

        for (const row of rows) {
            let hideField = true;
            let columns = row.children;
            for (const column of columns) {
                let data = column.children[0].innerHTML || "";
                if (!!data) {
                    data = data.replaceAll("<mark>", "");
                    data = data.replaceAll("</mark>", "");
                    if (data.includes(input)) {
                        hideField = false;

                        if (!!input) {
                            data = data.replaceAll(
                                input,
                                `<mark>${input}</mark>`
                            );
                        }
                    }
                    column.children[0].innerHTML = data;
                }
            }
            row.style.display = hideField ? "none" : "table-row";
        }
    }
}

zkpr_init();

//Overwrite native NetSuite APIs
/**
 * Copy and change the native nlapiSearchRecord function to avoid restrictions.
 * @param {string} type
 * @param {integer | null} id
 * @param {Array | null} filtersOrExpression
 * @param {Array | null} columns
 * @returns {Search Object}
 */
function zkpr_nlapiSearchRecord(type, id, filtersOrExpression, columns) {
    id =
        id != null && !isNaN(parseInt(id))
            ? parseInt(id)
            : id != null
            ? id
            : null;
    try {
        let rawFilters = nsapiMarshalSearchFiltersOrExpression(
            nsapiNormalizeFilters(filtersOrExpression)
        );
        let rawColumns = nsapiMarshalSearchColumns(columns);
        let rawResults = nsServerCall(
            getContextUrl(nsJSONProxyURL),
            "searchRecord",
            [type, id, rawFilters, rawColumns],
            null,
            "POST"
        );
        let rowResults = nsapiExtractSearchResults(rawResults, columns);

        return rowResults != null && rowResults.length > 0 ? rowResults : null;
    } catch (error) {
        console.log("zkpr_nlapiSearchRecord failed: ", error);
    }
}
//Copy and update the native nlapiLoadRecord function to ignore restrications.
function zkpr_nlapiLoadRecord(type, id, initializeDefaults) {
    if (initializeDefaults != null)
        for (let field in initializeDefaults)
            if (initializeDefaults.hasOwnProperty(field))
                nsapiAssertTrue(
                    arrayContains(
                        nsapiGetRecord(type).initializedefaults,
                        field
                    ),
                    "SSS_INVALID_INITIALIZE_DEFAULT_VALUE"
                );
    try {
        let nsPayload = nsStringToXML(
            "<nlapiRequest type='nlapiLoadRecord'></nlapiRequest>"
        );
        let nlapiRequest = nsPayload.documentElement;
        addScriptContext(nlapiRequest);
        nlapiRequest.setAttribute("id", id);
        nlapiRequest.setAttribute("recordType", type);
        if (initializeDefaults != null) {
            let nsLoadParams = nsSetChildValue(nlapiRequest, "loadParams");
            for (let defaultValue in initializeDefaults)
                if (initializeDefaults.hasOwnProperty(defaultValue))
                    nsSetChildValue(
                        nsLoadParams,
                        nsapiModifyLoadArg(defaultValue),
                        initializeDefaults[defaultValue]
                    );
        }

        let payload = nsXmlToString(nsPayload);
        let request = new NLXMLHttpRequest();
        let response = request.requestURL(nsProxyURL, payload);

        let nsResponse = nsStringToXML(response.getBody());
        let nsResponseRecord = nsSelectNode(
            nsResponse,
            "/nlapiResponse/record"
        );
        let nsRecord = nsapiExtractRecord(nsResponseRecord);
        nsRecord.logOperation("loadRecord", {
            id: id,
            initializeDefaults: initializeDefaults,
        });
        nsapiAssertTrue(
            type.toLowerCase() == nsRecord.getRecordType().toLowerCase() ||
                (type.toLowerCase() == "assemblyitem" &&
                    /.*assemblyitem/.test(
                        nsRecord.getRecordType().toLowerCase()
                    )) ||
                (type.toLowerCase() == "inventoryitem" &&
                    /.*inventoryitem/.test(
                        nsRecord.getRecordType().toLowerCase()
                    )) ||
                (type.toLowerCase() == "customer" &&
                    /(prospect|lead|customer)/.test(
                        nsRecord.getRecordType().toLowerCase()
                    )),
            "SSS_RECORD_TYPE_MISMATCH"
        );
        return nsRecord;
    } catch (e) {
        console.log("Failed to load the record", e);
        return false;
    }
}
/**
 * Copy and update the native nlapiCreateRecord function to ignore restrictions.
 * @param {string} type
 * @returns {Record.record Object}
 */
function zkpr_nlapiCreateRecord(type) {
    try {
        var nsPayload = nsStringToXML(
            "<nlapiRequest type='nlapiCreateRecord'></nlapiRequest>"
        );
        var nlapiRequest = nsPayload.documentElement;
        addScriptContext(nlapiRequest);
        nlapiRequest.setAttribute("recordType", type);

        var payload = nsXmlToString(nsPayload);
        var request = new NLXMLHttpRequest();
        var response = request.requestURL(nsProxyURL, payload);

        var nsResponse = nsStringToXML(response.getBody());
        var nsResponseRecord = nsSelectNode(
            nsResponse,
            "/nlapiResponse/record"
        );
        var nsRecord = nsapiExtractRecord(nsResponseRecord);
        return nsRecord;
    } catch (error) {
        console.log("zkpr_nlapiCreateRecord failed: ", error);
    }
}
/**
 * opy and update the native nlapiCreateSearch function to ignore restrictions.
 * @param {string} type
 * @param {Array} filtersOrExpression
 * @param {Array} columns
 * @returns {Search.search Object}
 */
function zkpr_nlapiCreateSearch(type, filtersOrExpression, columns) {
    filtersOrExpression = nsapiNormalizeFilters(filtersOrExpression);
    var filters = nsapiParseSearchFilterExpression(filtersOrExpression);
    return new nlobjSearch(type, -1, filters, columns);
}
if (typeof NLJsonRpcClient !== "undefined") {
    /**
     * Overwrite the native getJsonRpcResponse function to handle zkpr calls
     * @param {object} nlXMLResponseObj
     * @returns {object}
     */
    NLJsonRpcClient.prototype.getJsonRpcResponse = function (nlXMLResponseObj) {
        var jsonRpcResp = nlXMLResponseObj.getBody();
        if (jsonRpcResp != null) {
            jsonRpcResp = jsonRpcResp.replace(/^\s*<!--[\s\S]*?-->\s*$/gm, "");
        }
        try {
            eval("jsonRpcResp = " + jsonRpcResp + ";");
            return jsonRpcResp;
        } catch (error) {
            let index = 0;
            for (const key in this.responseCallbackMap) {
                index = key;
                break;
            }

            return {
                id: index,
                error: !!nlXMLResponseObj
                    ? nlXMLResponseObj.error.details
                    : "Timeout error.",
            };
        }
    };
}
