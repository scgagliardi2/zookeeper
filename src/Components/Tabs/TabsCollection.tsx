import Tab from "./Tab";
import "./Sass/Tabs.scss";

export default function TabsCollection(props: {
    toggleSelectedTab: Function;
    selectedTab: number | string;
    tabs: Array<{ index: number; title: string }>;
    tabClass: string | null;
}) {
    let tabs = props.tabs.map((tab: { index: number; title: string }) => {
        return (
            <Tab
                toggleSelectedTab={props.toggleSelectedTab}
                selectedTab={props.selectedTab}
                index={tab.index}
                title={tab.title}
                tabClass={props.tabClass}
            />
        );
    });

    return <div className="zkpr-module-tabs-container">{tabs}</div>;
}
