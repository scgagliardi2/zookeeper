import Section from "../Section Components/Section";
import SectionRow from "../Section Components/SectionRow";
import RowHeader from "../Section Components/RowHeader";
import RowInput from "../Section Components/RowInput";
import { ConfigurationListType } from "../../ConfigurationList";

export default function GeneralSettings(props: {
    config: ConfigurationListType;
    changeState: Function;
}) {
    return (
        <Section title={"NetSuite UI Settings"} open={true}>
            {/* <SectionRow>
                <RowHeader
                    title="Add ZooKeeper to Header"
                    description="Add an input to the NetSuite header to ask ZooKeeper general queries."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_enable_header_input",
                        defaultChecked: props.config.zkpr_enable_header_input,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Override Email"
                    description="For some users with access to multiple accounts, NetSuite APIs may read the users email as something other than the one used to log in. Override this discrepancy by populating this field with the correct email."
                />
                <RowInput
                    type="textbox"
                    data={{
                        type: "textbox",
                        id: "zkpr_override_email",
                        label: "",
                        value: props.config.zkpr_override_email,
                        placeholder: "",
                    }}
                    changeState={props.changeState}
                />
            </SectionRow> */}
            <SectionRow>
                <RowHeader
                    title="Enable Search Filtering"
                    description="Add an input on search pages that allows the user to filter the displayed results."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_enable_search_filter",
                        defaultChecked: props.config.zkpr_enable_search_filter,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Enable Session Enhancer"
                    description="Enable the ability to extend your NetSuite default session length."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_enable_session_enhancer",
                        defaultChecked:
                            props.config.zkpr_enable_session_enhancer,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Session Length"
                    description="Set the session length (in hours). Only works if Session Enhancer is enabled."
                />
                <RowInput
                    type="textbox"
                    data={{
                        type: "integer",
                        id: "zkpr_session_length",
                        label: "Session Length",
                        value: props.config.zkpr_session_length,
                        placeholder: "8",
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
        </Section>
    );
}
