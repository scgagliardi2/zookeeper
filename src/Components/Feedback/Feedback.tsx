import { useEffect, useState } from "react";
import { exampleUser } from "../User/User";
import "./Sass/Feedback.scss";

export const feedbackImage: string = chrome.runtime.getURL(
    "img/icons/Feedback/feedback-icon-gold-128px.png"
);

export function FeedbackIcon(props: {
    iconSize: number;
    clickAction: Function;
}) {
    return (
        <img
            src={feedbackImage}
            width={props.iconSize}
            height={props.iconSize}
            title="Give feedback"
            onClick={() => props.clickAction}
        />
    );
}

export default function Feedback(props: {}) {
    const [issue, setIssue] = useState("");
    const [issueType, setIssueType] = useState("report_a_bug");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(exampleUser);

    //get user data
    useEffect(() => {
        //listen for response with user
        window.addEventListener("message", (event: any) => {
            if (event.data.dest === "zkpr_auth_complete") {
                if (!!event.data.user) {
                    setUser(JSON.parse(event.data.user));
                }
            }
        });
    }, []);

    /**
     * Send request to AWS server
     */
    function submitForm(): void {
        //do nothing for empty prompt
        if (issue === "") return;

        // Make a call to the server
        fetch(
            "https://mwt26bpnf3yaopxsvdzbjb55ia0mtacz.lambda-url.us-east-2.on.aws/",
            {
                method: "post",
                body: JSON.stringify({
                    email: user.email,
                    authKey: user.authKey,
                    issue: issue,
                    issueType: issueType,
                    user: user,
                }),
            }
        )
            .then((response) => {
                if (!response.ok) {
                    handleResponse({
                        code: 400,
                    });
                } else {
                    handleResponse(response);
                }
            })
            .catch((error) => {
                handleResponse({
                    code: 400,
                });
            });

        setLoading(true);
        setMessage("");
    }

    /**
     * Handle response from server.
     */
    function handleResponse(response: any): void {
        setLoading(false);
        if (response.status == 200) {
            setMessage("Feedback submitted!");
            setIssue("");
        } else {
            setMessage("There was an issue submitting feedback.");
        }
    }

    return (
        <div className="zkpr-feedback-box">
            <div className="zkpr-feedback-header">
                <h1>Feedback</h1>
                <i>Report bugs or suggest an enhancement request</i>
                <h5>Why provide feedback?</h5>
                <p>
                    ZooKeeper relies on getting feedback from our active
                    customers to learn about bugs and make decisions on what
                    features or tools to build next or enhance existing learning
                    models. Please provide a detailed description to help us
                    best support you. Any existing prompts and data will be
                    submitted along with your description.
                </p>
            </div>
            <label>Select feedback type</label>
            <select
                defaultValue={"report_a_bug"}
                onChange={(e) => setIssueType(e.target.value)}
                className="zkpr-feedback-dropdown"
                data-widget="TextInput"
            >
                <option value="report_a_bug">Report a Bug</option>,
                <option value="enhancement_request">Enhancement Request</option>
                ,
            </select>
            <textarea
                autoFocus
                name="feedbackBox"
                rows={4}
                cols={100}
                placeholder="Description of bug or enhancement request....."
                className="zkpr-feedback-input"
                onChange={(e) => setIssue(e.target.value)}
                value={issue}
            />
            {loading ? (
                <div className="zkpr-submit-button">Submitting...</div>
            ) : (
                <div
                    className="zkpr-submit-button"
                    onClick={() => submitForm()}
                >
                    Submit
                </div>
            )}
            <h4 className="zkpr-feedback-response">{message}</h4>
        </div>
    );
}
