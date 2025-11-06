import "./Sass/Modal.scss";

export default function Modal(props: { toggleVisibility: () => void }) {
    return (
        <div className="zkpr-modal" onClick={() => props.toggleVisibility()} />
    );
}
