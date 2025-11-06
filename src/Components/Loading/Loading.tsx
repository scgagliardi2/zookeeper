import "./Sass/Loading.scss";

export default function Loading(props: { shift: number | string }) {
    return (
        <div className="lds-ellipsis" style={{ left: props.shift }}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}
