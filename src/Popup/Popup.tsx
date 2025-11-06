/**
 *  Pop up window if extension is "pinned".
 */

import "../Components/Globals/Sass/Globals.scss";
import "./Popup.scss";

import { FeedbackIcon } from "../Components/Feedback/Feedback";
import SettingsIcon from "../Components/Buttons/SettingsIcon";
const emulatorImage: string = chrome.runtime.getURL(
    "img/icons/Emulator/emulator.png"
);
export default function Popup(props: any) {
    return (
        <div className="zkpr-popup-container">
            <ul>
                <li className="zkpr-popup-title">ZooKeeper</li>
                <li
                    onClick={() => {
                        chrome.runtime.sendMessage("showOptions");
                    }}
                >
                    <SettingsIcon iconSize={30} className={""} />
                    Open Extension Settings
                </li>
                {/* <li
                    onClick={() => {
                        window.postMessage(
                            {
                                dest: "zkpr_feedback",
                                toggleVisibility: true,
                            },
                            window.location.href
                        );
                    }}
                >
                    <FeedbackIcon iconSize={30} clickAction={() => {}} />
                    Submit Feedback
                </li> */}
            </ul>
        </div>
    );
}
