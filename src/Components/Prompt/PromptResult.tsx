import TypewriterText from "../TypewriterText/TypewriterText";
import "./Sass/PromptResult.scss";

export default function PromptResult(props: {
    message: string;
    fromUser: boolean;
    link: string;
    linkText: string;
    useTypewriter?: boolean;
}) {
    let classString = props.fromUser
        ? "zkpr-prompt-result zkpr-user-result"
        : "zkpr-prompt-result zkpr-ai-result";

    return (
        <div className={classString}>
            {props.useTypewriter ? (
                <TypewriterText message={props.message} charsPerSecond={150} />
            ) : (
                props.message
            )}
            {props.link && (
                <a href={props.link} target="_blank">
                    {props.linkText}
                </a>
            )}
        </div>
    );
}
