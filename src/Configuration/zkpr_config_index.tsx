import React from "react";
import { createRoot } from 'react-dom/client';
import ConfigApp from "./Components/ConfigApp";
import ConfigurationList from "./ConfigurationList";

//get extension configuration
chrome.storage.sync.get(ConfigurationList, (config: any) => {
    const body = document.querySelector("body");

    //define container for React app
    const container = document.createElement("div");
    container.id = "zkpr-config";

    if (!!body) {
        body.append(container);
        let app = (
            <React.StrictMode>
                <ConfigApp config={config} />
            </React.StrictMode>
        );

        //render the app inside the container element
        const root = createRoot(container!);
        root.render(app);
    }
});
