import { ReactElement } from "react";

export default function SectionRow(props: { children: Array<ReactElement> }) {
    return <tr>{props.children}</tr>;
}
