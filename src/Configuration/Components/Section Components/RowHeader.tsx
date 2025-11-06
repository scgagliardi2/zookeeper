export default function RowHeader(props: {
    title: string;
    description: string;
}) {
    return (
        <td>
            <b>{props.title}</b>
            <i>{props.description}</i>
        </td>
    );
}
