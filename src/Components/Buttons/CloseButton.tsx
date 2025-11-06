export default function CloseButton(props: { toggleVisibility: Function }) {
    return (
        <button
            type="button"
            className="zkpr-icon-close"
            onClick={() => props.toggleVisibility()}
        >
            <span className="zkpr-icon-cross"></span>
            <span className="zkpr-visually-hidden">Close</span>
        </button>
    );
}
