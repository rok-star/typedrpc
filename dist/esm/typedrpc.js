var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as libschema from 'schema';
export const EndpointSchema = {
    type: 'object',
    props: {
        name: { type: 'string' },
        method: { type: 'function' },
        options: { type: 'object', optional: true },
        result: { type: 'object', optional: true }
    }
};
export const createServer = () => {
    const _endpoints = [];
    const bind = (name, method, options, result) => {
        _endpoints.push({ name, method, options, result });
    };
    const call = (payload, context) => __awaiter(void 0, void 0, void 0, function* () {
        libschema.assert(payload, { type: 'any' });
        const __CallSchema = {
            type: 'object',
            props: {
                method: { type: 'string' },
                options: { type: 'object' }
            }
        };
        const json = (() => {
            try {
                return JSON.parse(payload);
            }
            catch (e) {
                throw new Error(`Failed to serialize RPC message: ${e.message}`);
            }
        })();
        const callobj = libschema.assert(json, __CallSchema);
        const endpoint = _endpoints.find(({ name }) => name === callobj.method);
        if (endpoint) {
            try {
                if (endpoint.options) {
                    libschema.assert(callobj.options, endpoint.options);
                }
                const ret = yield endpoint.method(callobj.options, context);
                if (endpoint.result) {
                    libschema.assert(ret, endpoint.result);
                }
                return ret;
            }
            catch (e) {
                throw new Error(`Failed to execute method "${callobj.method}": ${e.message}`);
            }
        }
        else {
            throw new Error(`Method not found "${callobj.method}"`);
        }
    });
    return { bind, call };
};
export const ClientOptionsSchema = {
    type: 'object',
    props: {
        url: { type: 'string', optional: true }
    },
    optional: true
};
export const createClient = (options_) => {
    libschema.assert(options_, ClientOptionsSchema);
    const call = (method, options) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const res = yield fetch(((_a = options_ === null || options_ === void 0 ? void 0 : options_.url) !== null && _a !== void 0 ? _a : '/api'), { method: 'POST', body: JSON.stringify({ method, options }) });
        if (res.status === 200) {
            return yield res.json();
        }
        else {
            throw new Error(yield res.text());
        }
    });
    const bind = (method) => {
        return (options) => call(method, options);
    };
    return { call, bind };
};
