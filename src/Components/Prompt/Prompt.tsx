import "./Sass/Prompt.scss";

export default function Prompt(props: {
    preSendRequest: Function;
    prompt: string;
    handlePromptChange: Function;
    placeholder: string;
    loading: boolean;
    autoFocus: boolean;
    onFocus: Function;
}) {
    return (
        <div
            className="zkpr-prompt"
            onKeyDown={(e: any) => {
                // send request when enter is pressed
                if (e.key === "Enter" && e.target.value !== "")
                    //do nothing for empty prompt
                    props.preSendRequest(prompt);
            }}
        >
            <input
                disabled={props.loading}
                id="uif-zkpr-prompt" //added id="uif..." for new 2024 netsuite reskin to overlook our styling
                autoFocus={props.autoFocus}
                type="text"
                placeholder={props.placeholder}
                className="zkpr-prompt-input"
                data-widget="TextInput"
                onChange={(e: any) => {
                    props.handlePromptChange(e.target.value);
                }}
                value={props.prompt}
                onFocus={() => props.onFocus()}
            />
        </div>
    );
}
