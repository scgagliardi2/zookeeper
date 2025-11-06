interface recordEnhancements {
    zkpr_enable_sticky_header: boolean;
    zkpr_enable_sticky_sublists: boolean;
    zkpr_enable_search_record_fields: boolean;
    zkpr_show_expand_collapse_toggle: boolean;
    zkpr_show_field_ids_toggle: boolean;
    zkpr_default_field_ids_toggle: boolean;
    zkpr_show_delete_button: boolean;
}

interface generalEnhancements {
    zkpr_enable_search_filter: boolean;
    zkpr_enable_header_input: boolean; //not in use
    zkpr_override_email: string; //not in use
}

export interface requestData {
    millisecs: number; //not in use
}

interface sessionProps {
    zkpr_enable_session_enhancer: boolean;
    zkpr_session_length: number;
    zkpr_auth_key: string; //not in use
    zkpr_auth_key_timeout: string; //not in use
    zkpr_requests: Array<requestData>; //not in use
}

export interface ConfigurationListType
    extends recordEnhancements,
        generalEnhancements,
        sessionProps {}

//define the default config OwlSettings for initial import.
export const ConfigurationDefaults: ConfigurationListType = {
    //recordEnhancements
    zkpr_enable_sticky_header: true,
    zkpr_enable_sticky_sublists: false,
    zkpr_enable_search_record_fields: true,
    zkpr_show_expand_collapse_toggle: true,
    zkpr_show_field_ids_toggle: true,
    zkpr_default_field_ids_toggle: false,
    zkpr_show_delete_button: false,
    //generalEnhancements
    zkpr_enable_search_filter: true,
    zkpr_enable_header_input: false,
    zkpr_override_email: "",
    //sessionProps
    zkpr_enable_session_enhancer: false,
    zkpr_session_length: 8,
    zkpr_auth_key: "",
    zkpr_auth_key_timeout: "",
    zkpr_requests: [],
};

const ConfigurationList: Array<string> = Object.keys(ConfigurationDefaults);

export default ConfigurationList;
