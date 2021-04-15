export = CliqueClient;
/**
 * Clique Client
 */
declare class CliqueClient {
    /**
     * Creat a node client.
     */
    constructor(clique: any);
    clique: any;
    clients: NodeClient[];
    execute(method: any, params: any): Promise<any>;
    getClientIndex(address: any): Promise<number>;
    getGroupIndex(address: any): Promise<any>;
    blockflowFetch(fromTs: any, toTs: any): Promise<any>;
    getBalance(address: any): Promise<any>;
    getWebSocket(peer_i: any): WebSocket;
    transactionCreate(fromAddress: any, fromKey: any, toAddress: any, value: any, lockTime: any): Promise<any>;
    transactionSend(fromAddress: any, tx: any, signature: any): Promise<any>;
    transactionSign(txHash: any, privateKey: any): string;
}
import NodeClient = require("../lib/node");
