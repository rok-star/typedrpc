import * as libschema from 'schema';
export declare type Endpoint<T = any> = {
    name: string;
    method: (options: any, context: T) => Promise<any>;
    options?: libschema.Schema;
    result?: libschema.Schema;
};
export declare const EndpointSchema: libschema.Schema<Endpoint>;
export declare type Server<T> = {
    call: (payload: any, context: T) => Promise<any>;
    bind: (name: string, method: (options: any, context: T) => Promise<any>, options?: libschema.Schema, result?: libschema.Schema) => void;
};
export declare const createServer: <T>() => Server<T>;
export declare type Client = {
    call: <T = any, R = any>(method: string, options: T) => Promise<R>;
    bind: <T = any, R = any>(method: string) => (options: T) => Promise<R>;
};
export declare type ClientOptions = {
    url?: string;
};
export declare const ClientOptionsSchema: libschema.Schema;
export declare const createClient: (options_?: ClientOptions | undefined) => Client;
