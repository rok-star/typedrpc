"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.ClientOptionsSchema = exports.createServer = exports.EndpointSchema = void 0;
const libschema = require("schema");
exports.EndpointSchema = {
    type: 'object',
    props: {
        name: { type: 'string' },
        method: { type: 'function' },
        schemaIn: { type: 'object', optional: true },
        schemaOut: { type: 'object', optional: true }
    }
};
const createServer = () => {
    const _endpoints = [];
    const bind = (name, method, schemaIn, schemaOut) => {
        _endpoints.push({ name, method, schemaIn, schemaOut });
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
                throw new Error(`failed to serialize RPC message: ${e.message}`);
            }
        })();
        const callobj = libschema.assert(json, __CallSchema);
        const endpoint = _endpoints.find(({ name }) => name === callobj.method);
        if (endpoint) {
            try {
                if (endpoint.schemaIn) {
                    libschema.assert(callobj.options, endpoint.schemaIn);
                }
                const ret = yield endpoint.method(callobj.options, context);
                if (endpoint.schemaOut) {
                    libschema.assert(ret, endpoint.schemaOut);
                }
                return ret;
            }
            catch (e) {
                throw new Error(`failed to execute method "${callobj.method}": ${e.message}`);
            }
        }
        else {
            throw new Error(`method not found "${callobj.method}"`);
        }
    });
    return { bind, call };
};
exports.createServer = createServer;
exports.ClientOptionsSchema = {
    type: 'object',
    props: {
        url: { type: 'string', optional: true }
    },
    optional: true
};
const createClient = (options_) => {
    libschema.assert(options_, exports.ClientOptionsSchema);
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
exports.createClient = createClient;
