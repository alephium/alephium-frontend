export var Storage: Storage;
declare function Storage(): void;
declare class Storage {
    walletsUrl: URL;
    remove: (name: any) => void;
    load: (name: any) => any;
    save: (name: any, json: any) => void;
    list: () => any[];
}
export {};
