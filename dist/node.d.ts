export = NodeClient;
/**
 * Node Client
 * @extends {bcurl.Client}
 */
declare class NodeClient {
    /**
     * Creat a node client.
     * @param {Object?} options
     */
    constructor(options: Object | null);
    blockflowFetch(fromTs: any, toTs: any): any;
    getBalance(address: any): any;
    getGroup(address: any): any;
    selfClique(): any;
    transactionCreate(fromKey: any, toAddress: any, value: any, lockTime: any): any;
    transactionSend(tx: any, signature: any): any;
}
