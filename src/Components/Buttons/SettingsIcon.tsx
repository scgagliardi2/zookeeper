export const settingsImage: string = chrome.runtime.getURL(
    "img/icons/Settings/settings-gold-128px.png"
);

export default function SettingsIcon(props: {
    iconSize: number;
    className: string;
}) {
    return (
        <img
            className={props.className}
            src={settingsImage}
            width={props.iconSize}
            height={props.iconSize}
            title="Open settings"
            onClick={() => {
                chrome.runtime.sendMessage("showOptions");
            }}
        />
    );
}
