import * as libschema from 'schema';
export declare type Endpoint = {
    name: string;
    method: (options: any) => Promise<any>;
    schemaIn: libschema.Schema;
    schemaOut: libschema.Schema;
};
export declare const EndpointSchema: libschema.Schema<Endpoint>;
export declare type Server = {
    call: (payload: any) => Promise<any>;
    bind: (name: string, method: (options: any) => Promise<any>, schemaIn: libschema.Schema, schemaOut: libschema.Schema) => void;
};
export declare const createServer: () => Server;
export declare type Client = {
    call: <T = any, R = any>(method: string, options: T) => Promise<R>;
    bind: <T = any, R = any>(method: string) => (options: T) => Promise<R>;
};
export declare type ClientOptions = {
    url?: string;
};
export declare const ClientOptionsSchema: libschema.Schema;
export declare const createClient: (options_?: ClientOptions | undefined) => Client;
