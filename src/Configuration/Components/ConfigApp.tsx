import { useState } from "react";
import RecordEnhancements from "./Sections/RecordEnhancements";
import GeneralSettings from "./Sections/GeneralSettings";

import "../Sass/ConfigApp.scss";
import "../Sass/CollapseButton.scss";
import "../Sass/CheckboxRadio.scss";
import "../Sass/Section.scss";
import "../Sass/Tab.scss";
import "../../Components/Globals/Sass/Globals.scss";

import Tab from "./Tab";
import { ConfigurationListType } from "../ConfigurationList";

export default function ConfigApp(props: { config: ConfigurationListType }) {
    const [config, setConfig] = useState(props.config);
    const [selectedTab, setSelectedTab] = useState(0);

    /**
     * Listen for tab clicks
     */
    function toggleSelectedTab(index: number): void {
        setSelectedTab(index);
    }

    /**
     * Listen for state changes coming from children
     */
    function changeState(name: string, value: string): void {
        let tempConfig: any = config;
        tempConfig[name] = value;
        setConfig(tempConfig);
        saveOptions();
    }

    /**
     * Set chrome storage
     */
    function saveOptions(): void {
        chrome.storage.sync.set(config, () => {
            setConfig(config);
        });
    }

    const settingsProps = {
        config: config,
        changeState: changeState,
    };

    return (
        <div>
            <header>
                <img src="../../img/logo/Horizontal/400px/zookeeper-logo-horizontal-light-400px.png" />
            </header>
            <div className="zkpr-ag-logo">
                <h1>Sponsored By:</h1>
                <a href="https://www.anchorgroup.tech/" target="_blank">
                    <img src="../../img/logo/Anchor Group.png" width={280} />
                </a>
                <h2>NetSuite Consultants and Developers</h2>
            </div>
            <div className="zkpr-config-tab-cont">
                <Tab
                    toggleSelectedTab={toggleSelectedTab}
                    selectedTab={selectedTab}
                    index={0}
                    title={"General Settings"}
                />
                <Tab
                    toggleSelectedTab={toggleSelectedTab}
                    selectedTab={selectedTab}
                    index={1}
                    title={"Record Enhancements"}
                />
            </div>
            <div style={selectedTab === 0 ? {} : { display: "none" }}>
                <GeneralSettings {...settingsProps} />
            </div>
            <div style={selectedTab === 1 ? {} : { display: "none" }}>
                <RecordEnhancements {...settingsProps} />
            </div>
        </div>
    );
}
