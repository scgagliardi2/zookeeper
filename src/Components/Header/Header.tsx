import "./Sass/Header.scss";
import CloseButton from "../Buttons/CloseButton";
import SettingsIcon from "../Buttons/SettingsIcon";

export default function Header(props: { toggleVisibility: Function }) {
    const LOGO: string = chrome.runtime.getURL(
        "img/logo/Horizontal/400px/zookeeper-logo-horizontal-light-400px.png"
    );
    return (
        <div className={"zkpr-header"}>
            <img src={LOGO} className="zkpr-header-logo" />
            <SettingsIcon iconSize={40} className="zkpr-settings-icon" />
            <CloseButton toggleVisibility={props.toggleVisibility} />
        </div>
    );
}
