export default function ThemeBlocks(props: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
}) {
    return (
        <tr className="zkpr-color-blocks">
            <td style={{ display: "inline-flex" }}>
                <div style={{ backgroundColor: props.primary }}></div>
                <div style={{ backgroundColor: props.secondary }}></div>
                <div style={{ backgroundColor: props.tertiary }}></div>
                <div style={{ backgroundColor: props.background }}></div>
            </td>
            <td></td>
        </tr>
    );
}
