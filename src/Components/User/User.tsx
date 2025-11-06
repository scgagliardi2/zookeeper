//define user props
export default interface User {
    //session props
    authKey: string; //not in use
    authKeyTimeout: string; //not in use
    //default netsuite props
    company: string;
    contact: string;
    department: string;
    email: string;
    environment: string;
    executioncontext: string;
    getTotalUsage: Function;
    internal: boolean;
    location: string;
    name: string;
    role: string;
    rolecenter: string;
    roleid: string;
    scriptprefs: null;
    setUsage: Function;
    subsidiary: string;
    totalBundleUsage: any;
    usage: any;
    user: string;
    version: number;
    isCurrent: number;
    isPrevious: number;
    //page props
    isEditMode: Boolean;
    isItem: Boolean;
    zkprRecord: any;
    searchAllowed: boolean;
    isRedwood: boolean;
}

export const exampleUser: User = {
    authKey: "",
    authKeyTimeout: "",
    company: "",
    contact: "",
    department: "",
    email: "",
    environment: "",
    executioncontext: "",
    getTotalUsage: () => {},
    internal: false,
    location: "",
    name: "",
    role: "",
    rolecenter: "",
    roleid: "",
    scriptprefs: null,
    setUsage: () => {},
    subsidiary: "",
    totalBundleUsage: undefined,
    usage: undefined,
    user: "",
    version: 0,
    isCurrent: 0,
    isPrevious: 0,
    isEditMode: false,
    isItem: false,
    zkprRecord: {},
    searchAllowed: true,
    isRedwood: false,
};
