//Import React components
import React from "react";
import { createRoot } from 'react-dom/client';
import ConfigurationList, {
    ConfigurationListType,
} from "../Configuration/ConfigurationList";
import ModalContainer from "../Components/ModalContainer/ModalContainer";
import Feedback from "../Components/Feedback/Feedback";
import User from "../Components/User/User";
import HeaderInput from "../Components/HeaderPrompt/HeaderPrompt";
import RecordHeaderContent from "../Components/RecordHelper/RecordHeaderContent";
import AdvancedRecordHelper from "../Components/RecordHelper/AdvancedRecordHelper";
import SearchFilter from "../Components/SearchFilter/SearchFilter";

//inject script so we can make NetSuite API calls
let scriptElement = document.createElement("script");
scriptElement.id = "zkpr_inject";
scriptElement.src = chrome.runtime.getURL(`js/zkpr_inject.js`);
document.head.insertBefore(scriptElement, document.head.firstChild);

// Listen for messages from the popup and forward them
chrome.runtime.onMessage.addListener((msg, sender, response) => {
    window.postMessage(msg, window.location.href);
    response();
});

//add feedback react app.
addFeedback();

//listen for call from "zkpr_inject.js" with user data.
window.addEventListener(
    "message",
    (event) => {
        if (event.data.dest !== "zkpr_init_complete") return;

        let user = !!event.data.user ? JSON.parse(event.data.user) : false;
        if (!user) return;

        try {
            // get extension configuration
            chrome.storage.sync.get(ConfigurationList, (config: any) => {
                //REMOVE AUTH CODE FOR NOW
                // //grab auth tokens from config and send to injected script to initiate auth flow.
                // let authKey = !!config.zkpr_auth_key
                //     ? config.zkpr_auth_key
                //     : false;
                // let authKeyTimeout = !!config.zkpr_auth_key_timeout
                //     ? config.zkpr_auth_key_timeout
                //     : false;
                // let overrideEmail = config.zkpr_override_email || "";
                // window.postMessage(
                //     {
                //         dest: "zkpr_init_auth",
                //         authKey: authKey,
                //         authKeyTimeout: authKeyTimeout,
                //         overrideEmail: overrideEmail,
                //     },
                //     window.location.href
                // );

                // config.zkpr_enable_header_input &&
                //     addHeaderPrompt(user, config);

                //trigger ui updates (sticky header and theme)
                window.postMessage(
                    {
                        dest: "zkpr_ui_updates",
                        config: config,
                    },
                    window.location.href
                );

                !!user.zkprRecord && addRecordHeaderContent(user, config);

                !!user.zkprRecord && addAdvancedRecordHelper(user, config);

                config.zkpr_enable_search_filter && addSearchFilter(user);
            });
        } catch (error) {
            console.log("Error rendering the app.", error);
        }
    },
    false
);

// remove auth code for now
// //listen for response with user auth data, set in chrome sync for faster load next time
// window.addEventListener("message", (event: any) => {
//     if (event.data.dest === "zkpr_auth_complete") {
//         if (!!event.data.user && !!JSON.parse(event.data.user).authKey) {
//             let user = JSON.parse(event.data.user);

//             //set chrome sync for faster loads next time
//             chrome.storage.sync.set({
//                 zkpr_auth_key: user.authKey,
//                 zkpr_auth_key_timeout: user.authKeyTimeout,
//             });
//         }
//     }
// });

async function addFeedback() {
    const body = document.querySelector("body");

    const container = document.createElement("div");
    container.id = "zkpr-feedback";
    body!.append(container);

    let app = (
        <React.StrictMode>
            <ModalContainer childId={"zkpr_feedback"}>
                <Feedback />
            </ModalContainer>
        </React.StrictMode>
    );

    const root = createRoot(container!);
    root.render(app);
}

/**
 * Add prompt to NetSuite header.
 */
async function addHeaderPrompt(user: User, config: ConfigurationListType) {
    try {
        let h1 = document.getElementById("div__header");
        if (!h1) return;
        let h2 = h1.children[2];
        if (!h2) return;
        let h3 = h2.children[0];
        if (!h3) return;
        let h4 = h3.children[2] || h3.children[1];
        if (!h4) return;

        const container = document.createElement("div");
        container.id = "zkpr-header-prompt";
        h3.insertBefore(container, h4);
        let dragAndDrop = (
            <React.StrictMode>
                <HeaderInput config={config} />
            </React.StrictMode>
        );

        //render the prompt inside the container element
        const root = createRoot(container!);
        root.render(dragAndDrop);
    } catch (error) {
        console.warn("Failed to add zkpr Header Prompt", error);
    }
}

/**
 * Add features to NetSuite Record headers.
 */
async function addRecordHeaderContent(
    user: User,
    config: ConfigurationListType
) {
    try {
        let form = document.getElementById("main_form");

        if (!form) return;

        let header = form.children[0].children[0].children[0];
        if (!header) return;

        let headerTable =
            Number(user.version) > 2024.2
                ? document.getElementsByClassName("uir-buttons")[0]
                : header.children[0].children[1].children[0].children[0]
                      .children[0].children[0].children[0].children[0];

        const container = document.createElement("td");
        container.id = "zkpr-record-header-content-container";
        headerTable.append(container);

        let recordHeaderContent = (
            <React.StrictMode>
                <RecordHeaderContent user={user} config={config} />
            </React.StrictMode>
        );

        const root = createRoot(container!);
        root.render(recordHeaderContent);
    } catch (error) {
        console.warn("Failed to add zkpr Record Header Content", error);
    }
}

/**
 * Add advanced record helper module.
 */
async function addAdvancedRecordHelper(
    user: User,
    config: ConfigurationListType
) {
    try {
        const body = document.querySelector("body");
        const container = document.createElement("div");
        container.id = "zkpr-advanced-record-helper";
        if (body) {
            body.append(container);
        }

        let app = (
            <React.StrictMode>
                <ModalContainer childId={"zkpr-advanced-record-helper"}>
                    <AdvancedRecordHelper user={user} config={config} />
                </ModalContainer>
            </React.StrictMode>
        );

        //render the app inside the container element
        const root = createRoot(container!);
        root.render(app);
    } catch (error) {
        console.warn("Failed to add zkpr Advanced Record Helper", error);
    }
}

/**
 * Add filter to search result pages.
 */
async function addSearchFilter(user: User) {
    //filter based on some URLs
    if (window.location.href.includes("reporting/reportrunner.nl?")) {
        return;
    }

    //future proof
    if (!user.isCurrent && !user.isPrevious) return;

    try {
        let controlBars = document.getElementsByClassName("uir-control-bar");

        if (controlBars.length > 0) {
            for (let controlBar of controlBars) {
                //check for portlet
                let parent = controlBar.parentElement!.parentElement;
                let isPortlet = parent!.hasAttribute(
                    "data-portlet-title-label"
                );
                if (isPortlet) continue;

                const container = document.createElement("span");
                container.className = "zkpr-search-filter";
                controlBar.append(container);
                let srchFilter = (
                    <React.StrictMode>
                        <SearchFilter />
                    </React.StrictMode>
                );
                //render the app inside the container element
                const root = createRoot(container!);
                root.render(srchFilter);

                if (controlBar.getAttribute("style") === 'display: none;') {
                    controlBar.setAttribute("style", "");
                }
            }
        } else {
            let title = document.getElementById("div__pt_title");

            if (title) {
                //check for portlet
                let child = title.children[1]!;
                if (!child) return;

                const container = document.createElement("span");
                container.className = "zkpr-search-filter";
                child.append(container);
                let srchFilter = (
                    <React.StrictMode>
                        <SearchFilter />
                    </React.StrictMode>
                );
                //render the app inside the container element
                const root = createRoot(container!);
                root.render(srchFilter);
            }
        }
    } catch (error) {
        console.warn("Failed to add search filter", error);
    }
}