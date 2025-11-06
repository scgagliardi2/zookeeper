import { useState } from "react";
import "./Sass/SearchFilter.scss";

export default function SearchFilter(props: any) {
    const [input, setInput] = useState("");

    function handleInputChange(event: any) {
        setInput(event.target.value);

        window.postMessage(
            {
                dest: "zkpr_embed_search_filter",
                input: event.target.value,
            },
            window.location.href
        );
    }

    let message = input != "" ? "case-sensitive filtering in progress" : "";
    return (
        <div>
            <input
                type="text"
                placeholder={"Filter current page with ZooKeeper"}
                onChange={handleInputChange}
                value={input}
                className="zkpr-search-filter-input"
            ></input>
            <i className="zkpr-search-filter-message">{message}</i>
        </div>
    );
}
