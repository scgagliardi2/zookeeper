import "./Sass/Checkbox.scss";

export default function Checkbox(props: {
    defaultChecked: boolean;
    clickBox: Function;
    label: string;
}) {
    return (
        <table className="zkpr-checkbox-container">
            <tr>
                <td className="zkpr-checkbox">
                    <input
                        type="checkbox"
                        defaultChecked={props.defaultChecked}
                        onChange={() => props.clickBox()}
                    />
                    <label onClick={() => props.clickBox()}>
                        <svg viewBox="0,0,50,50">
                            <path d="M5 30 L 20 45 L 45 5"></path>
                        </svg>
                    </label>
                </td>
                <td
                    className="zkpr-checkbox-label"
                    onClick={() => props.clickBox()}
                >
                    {props.label}
                </td>
            </tr>
        </table>
    );
}
