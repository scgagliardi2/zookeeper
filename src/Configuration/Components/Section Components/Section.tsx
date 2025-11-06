import { ReactElement, useState } from "react";

export default function Section(props: {
    title: string;
    open: boolean;
    children: Array<ReactElement>;
}) {
    const [collapsed, setCollapsed] = useState(!props.open);

    function toggleCollapsed(): void {
        setCollapsed(!collapsed);
    }

    const sectionClass = collapsed
        ? "zkpr-config-section-collapsed"
        : "zkpr-config-section";
    const buttonClass = collapsed
        ? "zkpr-config-expand-collapse-icon"
        : "zkpr-config-expand-collapse-icon zkpr-config-collapsed";

    return (
        <section className={sectionClass}>
            <h1 className="zkpr-config-section-title" onClick={toggleCollapsed}>
                {props.title}
            </h1>
            <div className={buttonClass} onClick={toggleCollapsed}></div>
            <table>
                <tbody>{props.children}</tbody>
            </table>
        </section>
    );
}
