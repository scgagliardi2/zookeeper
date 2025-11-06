import {
    ConfigurationListType,
    requestData,
} from "../../Configuration/ConfigurationList";

let feedbackEndpoint: string =
    "https://mwt26bpnf3yaopxsvdzbjb55ia0mtacz.lambda-url.us-east-2.on.aws/";

export default function ServerRequest(
    endpoint: string,
    httpsType: string,
    body: any,
    successFunction: Function,
    errorFunction: Function,
    config: ConfigurationListType
) {
    config.zkpr_requests = config.zkpr_requests || [];

    //check request type and count
    let proceed = false;
    //filter config requests to only include request from the last 24 hours
    config.zkpr_requests = config.zkpr_requests.filter(
        (request: requestData) => {
            let now = new Date().getTime();
            return now - request.millisecs > 86400000; //one day
        }
    );
    if (config.zkpr_requests.length < 500) proceed = true;

    config.zkpr_requests.push({
        millisecs: new Date().getTime(),
    });
    chrome.storage.sync.set({
        zkpr_requests: config.zkpr_requests,
    });

    if (proceed) {
        // Make a call to the server
        fetch(endpoint, {
            method: httpsType,
            body: JSON.stringify(body),
            mode: "cors",
        })
            .then((response) => {
                if (!response.ok) {
                    errorFunction({
                        code: 400,
                        errors: [
                            "A server error occured. Please try again later.",
                        ],
                    });
                } else {
                    return response.json();
                }
            })
            .then((response) => {
                successFunction(response);
                body.response = response;

                // Make a call to logging database
                fetch(feedbackEndpoint, {
                    method: "post",
                    body: JSON.stringify(body),
                    mode: "cors",
                });
            })
            .catch((error) => {
                errorFunction({
                    code: 400,
                    errors: ["A server error occured. Please try again later."],
                });

                body.error = error;

                // Make a call to logging database
                fetch(feedbackEndpoint, {
                    method: "post",
                    body: JSON.stringify(body),
                    mode: "cors",
                });
            });
    } else {
        errorFunction({
            code: 400,
            errors: [
                "You have reached your limit of 500 requests in the past 24 hours. Please try again later.",
            ],
        });
    }
}
