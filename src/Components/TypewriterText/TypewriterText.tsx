/**
 * A simple text field that will type like a typewriter
 */

import { v4 as uuidv4 } from "uuid";
import { Component, ReactElement } from "react";
import $ from "jquery";

type Props = {
    message: string;
    charsPerSecond: number;
};

export default class TypewriterText extends Component<Props, { id: string }> {
    constructor(props: any) {
        super(props);

        this.state = { id: uuidv4() };

        this.update = this.update.bind(this);
    }

    componentDidMount() {
        this.update(this.state.id, 0);
    }

    update(id: string, counter: number): void {
        setTimeout(
            () => {
                // change the text to add a character
                $("#" + id).text(this.props.message.substring(0, counter));

                // run until the whole message is printed
                if (counter < this.props.message.length) {
                    this.update(id, counter + 1);
                }
            },
            1000 / this.props.charsPerSecond // math so that we get charsPerSecond characters every 1000 milliseconds
        );
    }

    render(): ReactElement {
        return <div id={this.state.id}></div>;
    }
}
