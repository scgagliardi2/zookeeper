import React from "react";
import ReactDOM from "react-dom";
import Popup from "./Popup";

const body = document.querySelector("body");

//define container for React app
const container = document.createElement("div");
container.id = "zkpr-popup";

if (!!body) {
    body.append(container);
    let app = (
        <React.StrictMode>
            <Popup />
        </React.StrictMode>
    );

    //render the app inside the container element
    ReactDOM.render(app, container);
}

//post messages to the page
window.addEventListener("message", (event: any) => {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        (tabs: any) => {
            chrome.tabs.sendMessage(tabs[0].id, event.data, () => {});
        }
    );
});
