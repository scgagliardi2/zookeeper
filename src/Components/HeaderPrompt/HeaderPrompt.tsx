import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import Loading from "../Loading/Loading";
import SubmitArrow from "../Buttons/SubmitArrow";
import Modal from "../Modal/Modal";
import Prompt from "../Prompt/Prompt";

import "../Globals/Sass/Globals.scss";
import "./Sass/HeaderPrompt.scss";
import ServerRequest from "../ServerRequest/ServerRequest";
import { ConfigurationListType } from "../../Configuration/ConfigurationList";
import User, { exampleUser } from "../User/User";

export default function HeaderInput(props: { config: ConfigurationListType }) {
    const defaultGeneralMessage: ReactElement = (
        <b>
            This feature is powered by AI and is still in training. When it
            fails reach out to a human at{" "}
            <a
                href="https://www.anchorgroup.tech/"
                target="_blank"
                style={{ color: "#F35638" }}
            >
                Anchor Group
            </a>
        </b>
    );
    const CHAT_ENDPOINT: string =
        "https://ogcyj3s4wm6zcrru7werc5e7540yowcq.lambda-url.us-east-2.on.aws/";
    const waitMessages: Array<string> = [
        "Help results may take 10-15 seconds.",
        "Help results may take 10-15 seconds. Those who seek wisdom must be patient.",
        "Help results may take 10-15 seconds. The prophet is old and slow.",
        "Patience, young grasshopper! Answers brew like fine tea, taking 10-15 seconds.",
        "Hang tight! Our virtual sage is pondering deeply. Expect results in 10-15 seconds.",
        "Our digital sage is on a coffee break. Expect a wait time of 10-15 seconds.",
        "Patience is a virtue. Expect a 10-15 second wait for enlightenment.",
        "The wheels of wisdom turn slowly, my friend. Brace for a 10-15 second wait for enlightenment.",
    ];

    const [input, setInput] = useState("");
    const inputRef = useRef("");
    const [user, setUser] = useState<User>(exampleUser);
    const userRef = useRef<User>(exampleUser);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(false);
    const [generalMessage, setGeneralMessage] = useState(defaultGeneralMessage);
    const [navigateResult, setNavigateResult] = useState("");
    const [helpResult, setHelpResult] = useState("");
    const [icon, setIcon] = useState(<Loading shift={-100} />);
    const [isAuthenticated, setIsAuth] = useState(false);

    //get user data
    useEffect(() => {
        //listen for response with user
        window.addEventListener("message", (event: any) => {
            if (event.data.dest === "zkpr_auth_complete") {
                if (
                    !!event.data.user &&
                    !!JSON.parse(event.data.user).authKey
                ) {
                    setUser(JSON.parse(event.data.user));
                    setIsAuth(true);
                    setIcon(<SubmitArrow preSendRequest={preSendRequest} />);
                }
            }
        });
    }, []);

    // required to allow current state to be grabbed in the below functions
    useEffect(() => {
        inputRef.current = input;
        userRef.current = user;
    }, [input, user]);

    function toggleResults(): void {
        setShowResults(!showResults);
    }

    function preSendRequest() {
        //do nothing for empty prompt or in progress request
        if (inputRef.current === "" || loading) return;

        //save state prior to sending the request
        setLoading(true);
        setIcon(<Loading shift={-100} />);
        setShowResults(false);

        sendRequest();
    }

    /**
     * Send request to AWS to run Open AI models on prompt
     */
    function sendRequest() {
        ServerRequest(
            CHAT_ENDPOINT,
            "post",
            {
                email: userRef.current.email,
                authKey: userRef.current.authKey,
                messages: [
                    {
                        role: "user",
                        content: inputRef.current,
                    },
                    {
                        role: "system",
                        content:
                            "You are a model that returns urls for locations in NetSuite.",
                    },
                ].reverse(),
                model: "navigate",
            },
            handleNavigateResponse,
            handleNavigateResponse,
            props.config
        );
    }

    function handleNavigateResponse(response: any): void {
        if (!!response.errors) {
            setLoading(false);
            setIcon(<SubmitArrow preSendRequest={preSendRequest} />);
            setShowResults(true);
            setGeneralMessage(<div>{response.errors[0]}</div>);
            setError(true);
        } else {
            let message = response.choices[0].message.content;
            message = JSON.parse(message);

            setIcon(<SubmitArrow preSendRequest={preSendRequest} />);
            setShowResults(true);
            setGeneralMessage(defaultGeneralMessage);
            setError(false);
            setNavigateResult(message.url);

            ServerRequest(
                CHAT_ENDPOINT,
                "post",
                {
                    email: userRef.current.email,
                    authKey: userRef.current.authKey,
                    messages: [
                        {
                            role: "user",
                            content: inputRef.current,
                        },
                        {
                            role: "system",
                            content:
                                "You are a NetSuite chat bot. Reply to all prompts with NetSuite related help info.",
                        },
                    ].reverse(),
                    model: "generalHelp",
                },
                handleHelpResponse,
                handleHelpResponse,
                props.config
            );
        }
    }

    function handleHelpResponse(response: any): void {
        setLoading(false);
        setIcon(<SubmitArrow preSendRequest={preSendRequest} />);

        if (!!response.errors) {
            setError(true);
            setGeneralMessage(<div>{response.errors[0]}</div>);
        } else {
            let message = response.choices[0].message.content;

            setHelpResult(message);
            setError(false);
            setGeneralMessage(defaultGeneralMessage);
        }
    }

    function openSearchModule(event: any) {
        event.preventDefault();

        window.postMessage(
            {
                dest: "zkpr-search",
                toggleVisibility: true,
            },
            window.location.href
        );
    }

    let helpContent = !helpResult ? (
        <div>
            <p>
                <i>
                    {
                        waitMessages[
                            Math.floor(Math.random() * waitMessages.length)
                        ]
                    }
                </i>
            </p>
            <hr />
            <Loading shift={0} />
        </div>
    ) : (
        <div>
            <p>
                <i>
                    Results are from ChatGPT, which is usually helpful but not
                    100% reliable.
                </i>
            </p>
            <hr />
            <span dangerouslySetInnerHTML={{ __html: helpResult }}></span>
        </div>
    );

    return (
        <div className="zkpr-header-prompt-container">
            <Prompt
                preSendRequest={preSendRequest}
                prompt={input}
                handlePromptChange={(promptInput: string) => {
                    setInput(promptInput);
                    setShowResults(false);
                }}
                placeholder={
                    isAuthenticated
                        ? "Ask Anchor Group's AI In-Training"
                        : "authenticating..."
                }
                loading={!isAuthenticated || loading}
                autoFocus={false}
                onFocus={() => {
                    !!input &&
                        !showResults &&
                        !!navigateResult &&
                        toggleResults();
                }}
            />
            {icon}
            <div
                className="zkpr-header-prompt-results"
                style={{
                    display: !!showResults ? "flex" : "none",
                }}
            >
                <div className="zkpr-response-container">
                    <div>{generalMessage}</div>
                    <br />
                    <div style={{ display: !error ? "block" : "none" }}>
                        <b>Looking for a location in NetSuite? Try here:</b>{" "}
                        <a href={navigateResult} target="_blank">
                            {navigateResult || "...still loading a url..."}
                        </a>
                    </div>
                    <br />
                    <div style={{ display: !error ? "block" : "none" }}>
                        {helpContent}
                    </div>
                </div>
                <Modal toggleVisibility={() => toggleResults()} />
            </div>
        </div>
    );
}
