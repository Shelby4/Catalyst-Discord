declare type CFLookupResponse = {
    status: Number | Boolean;
    cftools_id: String | undefined;
};
export declare const getCFId: (identifier: String) => Promise<CFLookupResponse>;
export {};
