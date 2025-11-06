export default function Tab(props: {
    toggleSelectedTab: Function;
    selectedTab: number | string;
    index: number;
    title: string;
    tabClass: string | null;
}) {
    let classList =
        props.selectedTab === props.index
            ? "zkpr-module-tab-selected"
            : "zkpr-module-tab";

    return (
        <div
            className={classList + props.tabClass}
            onClick={() => props.toggleSelectedTab(props.index)}
        >
            {props.title}
        </div>
    );
}
