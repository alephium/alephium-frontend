export var Storage: Storage;
declare function Storage(): void;
declare class Storage {
    key: string;
    remove: (name: any) => void;
    load: (name: any) => any;
    save: (name: any, json: any) => void;
    list: () => string[];
}
export {};
