import * as libschema from 'schema'

export type Endpoint<T = any> = {
    name: string;
    method: (options: any, context: T) => Promise<any>;
    schemaIn: libschema.Schema;
    schemaOut: libschema.Schema;
}

export const EndpointSchema: libschema.Schema<Endpoint> = {
    type: 'object',
    props: {
        name: { type: 'string' },
        method: { type: 'function' },
        schemaIn: { type: 'object' },
        schemaOut: { type: 'object' }
    }
}

export type Server<T> = {
    call: (payload: any, context: T) => Promise<any>;
    bind: (
        name: string,
        method: (options: any, context: T) => Promise<any>,
        schemaIn: libschema.Schema,
        schemaOut: libschema.Schema
    ) => void;
}

export const createServer = <T>(): Server<T> => {
    const _endpoints: Endpoint<T>[] = [];
    const bind = (name: string, method: (options: any, context: T) => Promise<any>, schemaIn: libschema.Schema, schemaOut: libschema.Schema) => {
        _endpoints.push({ name, method, schemaIn, schemaOut });
    }
    const call = async (payload: any, context: T) => {
        libschema.assert(payload, { type: 'any' });
        type __Call = {
            method: string;
            options: any;
        }
        const __CallSchema: libschema.Schema<__Call> = {
            type: 'object',
            props: {
                method: { type: 'string' },
                options: { type: 'object' }
            }
        }
        const json = (() => {
            try {
                return JSON.parse(payload);
            } catch (e) {
                throw new Error(`failed to serialize RPC message: ${e.message}`);
            }
        })()
        const callobj = libschema.assert<__Call>(json, __CallSchema);
        const endpoint = _endpoints.find(({ name }) => name === callobj.method);
        if (endpoint) {
            try {
                return libschema.assert(
                    await endpoint.method(
                        libschema.assert(
                            callobj.options,
                            endpoint.schemaIn
                        ),
                        context
                    ),
                    endpoint.schemaOut
                );
            } catch (e) {
                throw new Error(`failed to execute method "${callobj.method}": ${e.message}`);
            }
        } else {
            throw new Error(`method not found "${callobj.method}"`);
        }
    }
    return { bind, call }
}

export type Client = {
    call: <T = any, R = any>(method: string, options: T) => Promise<R>;
    bind: <T = any, R = any>(method: string) => (options: T) => Promise<R>;
}

export type ClientOptions = {
    url?: string;
}

export const ClientOptionsSchema: libschema.Schema = {
    type: 'object',
    props: {
        url: { type: 'string', optional: true }
    },
    optional: true
}

export const createClient = (options_?: ClientOptions): Client => {
    libschema.assert(options_, ClientOptionsSchema);
    const call = async <T = any, R = any>(method: string, options: T): Promise<R> => {
        const res = await fetch((options_?.url ?? '/api'), { method: 'POST', body: JSON.stringify({ method, options }) });
        if (res.status === 200) {
            return await res.json();
        } else {
            throw new Error(await res.text());
        }
    }
    const bind = <T = any, R = any>(method: string): (options: T) => Promise<R> => {
        return (options: T) => call(method, options);
    }
    return { call, bind }
}