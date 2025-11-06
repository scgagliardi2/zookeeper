export default function Tab(props: {
    toggleSelectedTab: Function;
    selectedTab: number;
    index: number;
    title: string;
}) {
    let classList =
        props.selectedTab === props.index
            ? "zkpr-config-tab-selected"
            : "zkpr-config-tab";

    return (
        <div
            className={classList}
            onClick={() => props.toggleSelectedTab(props.index)}
        >
            <h2 className="zkpr-config-tab-title">{props.title}</h2>
        </div>
    );
}
