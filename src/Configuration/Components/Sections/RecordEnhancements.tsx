import Section from "../Section Components/Section";
import SectionRow from "../Section Components/SectionRow";
import RowHeader from "../Section Components/RowHeader";
import RowInput from "../Section Components/RowInput";
import { ConfigurationListType } from "../../ConfigurationList";

export default function RecordEnhancements(props: {
    config: ConfigurationListType;
    changeState: Function;
}) {
    return (
        <Section title={"Record Enhancements"} open={true}>
            <SectionRow>
                <RowHeader
                    title="Enable Sticky Header"
                    description="Lock record headers to the top of the page while scrolling."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_enable_sticky_header",
                        defaultChecked: props.config.zkpr_enable_sticky_header,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Enable Sticky Headers on Sublists"
                    description="Lock sublist header rows to the top of the sublist while scrolling."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_enable_sticky_sublists",
                        defaultChecked:
                            props.config.zkpr_enable_sticky_sublists,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Enable Record Field Search"
                    description="Add an input field to record headers to search record data."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_enable_search_record_fields",
                        defaultChecked:
                            props.config.zkpr_enable_search_record_fields,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Add Expand/Collapse To Header"
                    description="Add a button to record header's to expand/collapse subtabs."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_show_expand_collapse_toggle",
                        defaultChecked:
                            props.config.zkpr_show_expand_collapse_toggle,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Show Field Ids Toggle"
                    description="Add a toggle to record headers to hide/show field ids."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_show_field_ids_toggle",
                        defaultChecked: props.config.zkpr_show_field_ids_toggle,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Default Field Ids Toggle"
                    description='Default the field ids toggle to "show".'
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_default_field_ids_toggle",
                        defaultChecked:
                            props.config.zkpr_default_field_ids_toggle,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
            <SectionRow>
                <RowHeader
                    title="Show Delete Button"
                    description="Show a delete button."
                />
                <RowInput
                    type="checkbox"
                    data={{
                        name: "zkpr_show_delete_button",
                        defaultChecked: props.config.zkpr_show_delete_button,
                    }}
                    changeState={props.changeState}
                />
            </SectionRow>
        </Section>
    );
}
