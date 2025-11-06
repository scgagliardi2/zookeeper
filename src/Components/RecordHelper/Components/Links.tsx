export default function Links(props: { type: string }) {
    const RECORDS_BROWSER_URL: string =
        "https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2021_2/script/record";
    const RECORDS_CATALOG_URL: string =
        "https://system.netsuite.com/app/recordscatalog/rcbrowser.nl?whence=#/record_ss";

    const records_browser_link: string =
        "https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2021_2/script/record/contact.html";
    const records_catalog_link: string =
        "https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2021_2/script/record/contact.html";

    let customRecordClass = props.type
        ? props.type.includes("customrecord")
            ? "disableLink"
            : ""
        : "";

    let rbl = props.type
        ? `${RECORDS_BROWSER_URL}/${props.type}.html`
        : records_browser_link;
    let rcl = props.type
        ? `${RECORDS_CATALOG_URL}/${props.type}`
        : records_catalog_link;

    return (
        <div className="zookeeper-record-helper-links">
            <div className="zookeeper-record-helper-link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path d="M6 17c2.269-9.881 11-11.667 11-11.667v-3.333l7 6.637-7 6.696v-3.333s-6.17-.171-11 5zm12 .145v2.855h-16v-12h6.598c.768-.787 1.561-1.449 2.339-2h-10.937v16h20v-6.769l-2 1.914z" />
                </svg>
                <a href={rbl} target="_blank" className={customRecordClass}>
                    Open in Records Browser
                </a>
            </div>
            <div className="zookeeper-record-helper-link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path d="M6 17c2.269-9.881 11-11.667 11-11.667v-3.333l7 6.637-7 6.696v-3.333s-6.17-.171-11 5zm12 .145v2.855h-16v-12h6.598c.768-.787 1.561-1.449 2.339-2h-10.937v16h20v-6.769l-2 1.914z" />
                </svg>
                <a href={rcl} target="_blank" className={customRecordClass}>
                    Open in Records Catalog
                </a>
            </div>
            <div className="zookeeper-record-helper-link">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path d="M6 17c2.269-9.881 11-11.667 11-11.667v-3.333l7 6.637-7 6.696v-3.333s-6.17-.171-11 5zm12 .145v2.855h-16v-12h6.598c.768-.787 1.561-1.449 2.339-2h-10.937v16h20v-6.769l-2 1.914z" />
                </svg>
                <a
                    href={`https://${
                        window.location.host
                    }/app/common/scripting/scriptedrecord.nl?id=${props.type.toUpperCase()}&e=T`}
                    target="_blank"
                    className={customRecordClass}
                >
                    Open Scripted Records
                </a>
            </div>
        </div>
    );
}
