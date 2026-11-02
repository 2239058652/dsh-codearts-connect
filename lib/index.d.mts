/// <reference types="node" />
import z from "@deepseek-ai/schemastery";
import { PiAiAdapter } from "@deepseek-ai/dsh-llm-pi-ai";
import { SettingsNamespace } from "@deepseek-ai/dsh-settings";
import { Context } from "@deepseek-ai/cordis";
import { URL as URL$1, URLSearchParams as URLSearchParams$1 } from "url";
import { Duplex, Readable, Writable } from "stream";
import { EventEmitter } from "events";
import { Blob as Blob$1 } from "buffer";
import { ConnectionOptions, TLSSocket } from "tls";
import { IpcNetConnectOpts, Socket, TcpNetConnectOpts } from "net";
import { URL as URL$2, URLSearchParams as URLSearchParams$2 } from "node:url";
import { Duplex as Duplex$1, Readable as Readable$1, Writable as Writable$1 } from "node:stream";
import { EventEmitter as EventEmitter$1 } from "node:events";
import { Blob as Blob$2, File as File$1 } from "node:buffer";
import { SessionOptions } from "node:http2";
import { ConnectionOptions as ConnectionOptions$1, TLSSocket as TLSSocket$1 } from "node:tls";
import { IpcNetConnectOpts as IpcNetConnectOpts$1, Socket as Socket$1, TcpNetConnectOpts as TcpNetConnectOpts$1 } from "node:net";
import { AttachmentStore } from "@deepseek-ai/dsh-attachment";
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/header.d.ts
/**
 * The header type declaration of `undici`.
 */
type IncomingHttpHeaders$1 = Record<string, string | string[] | undefined>;
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/readable.d.ts
declare class BodyReadable$1 extends Readable {
  constructor(resume?: (this: Readable, size: number) => void | null, abort?: () => void | null, contentType?: string);
  /** Consumes and returns the body as a string
   *  https://fetch.spec.whatwg.org/#dom-body-text
   */
  text(): Promise<string>;
  /** Consumes and returns the body as a JavaScript Object
   *  https://fetch.spec.whatwg.org/#dom-body-json
   */
  json(): Promise<unknown>;
  /** Consumes and returns the body as a Blob
   *  https://fetch.spec.whatwg.org/#dom-body-blob
   */
  blob(): Promise<Blob$1>;
  /** Consumes and returns the body as an Uint8Array
   *  https://fetch.spec.whatwg.org/#dom-body-bytes
   */
  bytes(): Promise<Uint8Array>;
  /** Consumes and returns the body as an ArrayBuffer
   *  https://fetch.spec.whatwg.org/#dom-body-arraybuffer
   */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Not implemented
   *
   *  https://fetch.spec.whatwg.org/#dom-body-formdata
   */
  formData(): Promise<never>;
  /** Returns true if the body is not null and the body has been consumed
   *
   *  Otherwise, returns false
   *
   * https://fetch.spec.whatwg.org/#dom-body-bodyused
   */
  readonly bodyUsed: boolean;
  /**
   * If body is null, it should return null as the body
   *
   *  If body is not null, should return the body as a ReadableStream
   *
   *  https://fetch.spec.whatwg.org/#dom-body-body
   */
  readonly body: never | undefined;
  /** Dumps the response body by reading `limit` number of bytes.
   * @param opts.limit Number of bytes to read (optional) - Default: 262144
   */
  dump(opts?: {
    limit: number;
  }): Promise<void>;
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/file.d.ts
interface BlobPropertyBag {
  type?: string;
  endings?: 'native' | 'transparent';
}
interface FilePropertyBag extends BlobPropertyBag {
  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  lastModified?: number;
}
declare class File$2 extends Blob$1 {
  /**
   * Creates a new File instance.
   *
   * @param fileBits An `Array` strings, or [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`ArrayBufferView`](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView), [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) objects, or a mix of any of such objects, that will be put inside the [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File).
   * @param fileName The name of the file.
   * @param options An options object containing optional attributes for the file.
   */
  constructor(fileBits: ReadonlyArray<string | NodeJS.ArrayBufferView | Blob$1>, fileName: string, options?: FilePropertyBag);
  /**
   * Name of the file referenced by the File object.
   */
  readonly name: string;
  /**
   * The last modified date of the file as the number of milliseconds since the Unix epoch (January 1, 1970 at midnight). Files without a known last modified date return the current date.
   */
  readonly lastModified: number;
  readonly [Symbol.toStringTag]: string;
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/fetch.d.ts
type BodyInit$1 = ArrayBuffer | AsyncIterable<Uint8Array> | Blob$1 | FormData$2 | Iterable<Uint8Array> | NodeJS.ArrayBufferView | URLSearchParams$1 | null | string;
interface SpecIterator$1<T, TReturn = any, TNext = undefined> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
}
interface SpecIterableIterator$1<T> extends SpecIterator$1<T> {
  [Symbol.iterator](): SpecIterableIterator$1<T>;
}
interface SpecIterable$1<T> {
  [Symbol.iterator](): SpecIterator$1<T>;
}
type HeadersInit$2 = string[][] | Record<string, string | ReadonlyArray<string>> | Headers$2;
declare class Headers$2 implements SpecIterable$1<[string, string]> {
  constructor(init?: HeadersInit$2);
  readonly append: (name: string, value: string) => void;
  readonly delete: (name: string) => void;
  readonly get: (name: string) => string | null;
  readonly has: (name: string) => boolean;
  readonly set: (name: string, value: string) => void;
  readonly getSetCookie: () => string[];
  readonly forEach: (callbackfn: (value: string, key: string, iterable: Headers$2) => void, thisArg?: unknown) => void;
  readonly keys: () => SpecIterableIterator$1<string>;
  readonly values: () => SpecIterableIterator$1<string>;
  readonly entries: () => SpecIterableIterator$1<[string, string]>;
  readonly [Symbol.iterator]: () => SpecIterableIterator$1<[string, string]>;
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/formdata.d.ts
/**
 * A `string` or `File` that represents a single value from a set of `FormData` key-value pairs.
 */
declare type FormDataEntryValue$1 = string | File$2;
/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using fetch().
 */
declare class FormData$2 {
  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * The difference between `set()` and `append()` is that if the specified key already exists, `set()` will overwrite all existing values with the new one, whereas `append()` will append the new value onto the end of the existing set of values.
   *
   * @param name The name of the field whose data is contained in `value`.
   * @param value The field's value. This can be [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File). If none of these are specified the value is converted to a string.
   * @param fileName The filename reported to the server, when a Blob or File is passed as the second parameter. The default filename for Blob objects is "blob". The default filename for File objects is the file's filename.
   */
  append(name: string, value: unknown, fileName?: string): void;
  /**
   * Set a new value for an existing key inside FormData,
   * or add the new field if it does not already exist.
   *
   * @param name The name of the field whose data is contained in `value`.
   * @param value The field's value. This can be [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File). If none of these are specified the value is converted to a string.
   * @param fileName The filename reported to the server, when a Blob or File is passed as the second parameter. The default filename for Blob objects is "blob". The default filename for File objects is the file's filename.
   *
   */
  set(name: string, value: unknown, fileName?: string): void;
  /**
   * Returns the first value associated with a given key from within a `FormData` object.
   * If you expect multiple values and want all of them, use the `getAll()` method instead.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @returns A `FormDataEntryValue` containing the value. If the key doesn't exist, the method returns null.
   */
  get(name: string): FormDataEntryValue$1 | null;
  /**
   * Returns all the values associated with a given key from within a `FormData` object.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @returns An array of `FormDataEntryValue` whose key matches the value passed in the `name` parameter. If the key doesn't exist, the method returns an empty list.
   */
  getAll(name: string): FormDataEntryValue$1[];
  /**
   * Returns a boolean stating whether a `FormData` object contains a certain key.
   *
   * @param name A string representing the name of the key you want to test for.
   *
   * @return A boolean value.
   */
  has(name: string): boolean;
  /**
   * Deletes a key and its value(s) from a `FormData` object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string): void;
  /**
   * Executes given callback function for each field of the FormData instance
   */
  forEach: (callbackfn: (value: FormDataEntryValue$1, key: string, iterable: FormData$2) => void, thisArg?: unknown) => void;
  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all keys contained in this `FormData` object.
   * Each key is a `string`.
   */
  keys: () => SpecIterableIterator$1<string>;
  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all values contained in this object `FormData` object.
   * Each value is a [`FormDataValue`](https://developer.mozilla.org/en-US/docs/Web/API/FormDataEntryValue).
   */
  values: () => SpecIterableIterator$1<FormDataEntryValue$1>;
  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the `FormData` key/value pairs.
   * The key of each pair is a string; the value is a [`FormDataValue`](https://developer.mozilla.org/en-US/docs/Web/API/FormDataEntryValue).
   */
  entries: () => SpecIterableIterator$1<[string, FormDataEntryValue$1]>;
  /**
   * An alias for FormData#entries()
   */
  [Symbol.iterator]: () => SpecIterableIterator$1<[string, FormDataEntryValue$1]>;
  readonly [Symbol.toStringTag]: string;
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/connector.d.ts
declare function buildConnector$1(options?: buildConnector$1.BuildOptions): buildConnector$1.connector;
declare namespace buildConnector$1 {
  export type BuildOptions = (ConnectionOptions | TcpNetConnectOpts | IpcNetConnectOpts) & {
    allowH2?: boolean;
    maxCachedSessions?: number | null;
    socketPath?: string | null;
    timeout?: number | null;
    port?: number;
    keepAlive?: boolean | null;
    keepAliveInitialDelay?: number | null;
  };
  export interface Options {
    hostname: string;
    host?: string;
    protocol: string;
    port: string;
    servername?: string;
    localAddress?: string | null;
    httpSocket?: Socket;
  }
  export type Callback = (...args: CallbackArgs) => void;
  type CallbackArgs = [null, Socket | TLSSocket] | [Error, null];
  export interface connector {
    (options: buildConnector$1.Options, callback: buildConnector$1.Callback): void;
  }
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/client.d.ts
type ClientConnectOptions$1 = Omit<Dispatcher$1.ConnectOptions, "origin">;
/**
 * A basic HTTP/1.1 client, mapped on top a single TCP/TLS connection. Pipelining is disabled by default.
 */
declare class Client$1 extends Dispatcher$1 {
  constructor(url: string | URL$1, options?: Client$1.Options);
  /** Property to get and set the pipelining factor. */
  pipelining: number;
  /** `true` after `client.close()` has been called. */
  closed: boolean;
  /** `true` after `client.destroyed()` has been called or `client.close()` has been called and the client shutdown has completed. */
  destroyed: boolean;
  // Override dispatcher APIs.
  override connect(options: ClientConnectOptions$1): Promise<Dispatcher$1.ConnectData>;
  override connect(options: ClientConnectOptions$1, callback: (err: Error | null, data: Dispatcher$1.ConnectData) => void): void;
}
declare namespace Client$1 {
  export interface OptionsInterceptors {
    Client: readonly Dispatcher$1.DispatchInterceptor[];
  }
  export interface Options {
    /** TODO */
    interceptors?: OptionsInterceptors;
    /** The maximum length of request headers in bytes. Default: Node.js' `--max-http-header-size` or `16384` (16KiB). */
    maxHeaderSize?: number;
    /** The amount of time, in milliseconds, the parser will wait to receive the complete HTTP headers (Node 14 and above only). Default: `300e3` milliseconds (300s). */
    headersTimeout?: number;
    /** @deprecated unsupported socketTimeout, use headersTimeout & bodyTimeout instead */
    socketTimeout?: never;
    /** @deprecated unsupported requestTimeout, use headersTimeout & bodyTimeout instead */
    requestTimeout?: never;
    /** TODO */
    connectTimeout?: number;
    /** The timeout after which a request will time out, in milliseconds. Monitors time between receiving body data. Use `0` to disable it entirely. Default: `300e3` milliseconds (300s). */
    bodyTimeout?: number;
    /** @deprecated unsupported idleTimeout, use keepAliveTimeout instead */
    idleTimeout?: never;
    /** @deprecated unsupported keepAlive, use pipelining=0 instead */
    keepAlive?: never;
    /** the timeout, in milliseconds, after which a socket without active requests will time out. Monitors time between activity on a connected socket. This value may be overridden by *keep-alive* hints from the server. Default: `4e3` milliseconds (4s). */
    keepAliveTimeout?: number;
    /** @deprecated unsupported maxKeepAliveTimeout, use keepAliveMaxTimeout instead */
    maxKeepAliveTimeout?: never;
    /** the maximum allowed `idleTimeout`, in milliseconds, when overridden by *keep-alive* hints from the server. Default: `600e3` milliseconds (10min). */
    keepAliveMaxTimeout?: number;
    /** A number of milliseconds subtracted from server *keep-alive* hints when overriding `idleTimeout` to account for timing inaccuracies caused by e.g. transport latency. Default: `1e3` milliseconds (1s). */
    keepAliveTimeoutThreshold?: number;
    /** TODO */
    socketPath?: string;
    /** The amount of concurrent requests to be sent over the single TCP/TLS connection according to [RFC7230](https://tools.ietf.org/html/rfc7230#section-6.3.2). Default: `1`. */
    pipelining?: number;
    /** @deprecated use the connect option instead */
    tls?: never;
    /** If `true`, an error is thrown when the request content-length header doesn't match the length of the request body. Default: `true`. */
    strictContentLength?: boolean;
    /** TODO */
    maxCachedSessions?: number;
    /** TODO */
    maxRedirections?: number;
    /** TODO */
    connect?: buildConnector$1.BuildOptions | buildConnector$1.connector;
    /** TODO */
    maxRequestsPerClient?: number;
    /** TODO */
    localAddress?: string;
    /** Max response body size in bytes, -1 is disabled */
    maxResponseSize?: number;
    /** Enables a family autodetection algorithm that loosely implements section 5 of RFC 8305. */
    autoSelectFamily?: boolean;
    /** The amount of time in milliseconds to wait for a connection attempt to finish before trying the next address when using the `autoSelectFamily` option. */
    autoSelectFamilyAttemptTimeout?: number;
    /**
     * @description Enables support for H2 if the server has assigned bigger priority to it through ALPN negotiation.
     * @default false
     */
    allowH2?: boolean;
    /**
     * @description Dictates the maximum number of concurrent streams for a single H2 session. It can be overridden by a SETTINGS remote frame.
     * @default 100
     */
    maxConcurrentStreams?: number;
  }
  export interface SocketInfo {
    localAddress?: string;
    localPort?: number;
    remoteAddress?: string;
    remotePort?: number;
    remoteFamily?: string;
    timeout?: number;
    bytesWritten?: number;
    bytesRead?: number;
  }
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/errors.d.ts
declare namespace Errors$1 {
  export class UndiciError extends Error {
    name: string;
    code: string;
  }
  /** Connect timeout error. */
  export class ConnectTimeoutError extends UndiciError {
    name: 'ConnectTimeoutError';
    code: 'UND_ERR_CONNECT_TIMEOUT';
  }
  /** A header exceeds the `headersTimeout` option. */
  export class HeadersTimeoutError extends UndiciError {
    name: 'HeadersTimeoutError';
    code: 'UND_ERR_HEADERS_TIMEOUT';
  }
  /** Headers overflow error. */
  export class HeadersOverflowError extends UndiciError {
    name: 'HeadersOverflowError';
    code: 'UND_ERR_HEADERS_OVERFLOW';
  }
  /** A body exceeds the `bodyTimeout` option. */
  export class BodyTimeoutError extends UndiciError {
    name: 'BodyTimeoutError';
    code: 'UND_ERR_BODY_TIMEOUT';
  }
  export class ResponseStatusCodeError extends UndiciError {
    constructor(message?: string, statusCode?: number, headers?: IncomingHttpHeaders$1 | string[] | null, body?: null | Record<string, any> | string);
    name: 'ResponseStatusCodeError';
    code: 'UND_ERR_RESPONSE_STATUS_CODE';
    body: null | Record<string, any> | string;
    status: number;
    statusCode: number;
    headers: IncomingHttpHeaders$1 | string[] | null;
  }
  /** Passed an invalid argument. */
  export class InvalidArgumentError extends UndiciError {
    name: 'InvalidArgumentError';
    code: 'UND_ERR_INVALID_ARG';
  }
  /** Returned an invalid value. */
  export class InvalidReturnValueError extends UndiciError {
    name: 'InvalidReturnValueError';
    code: 'UND_ERR_INVALID_RETURN_VALUE';
  }
  /** The request has been aborted by the user. */
  export class RequestAbortedError extends UndiciError {
    name: 'AbortError';
    code: 'UND_ERR_ABORTED';
  }
  /** Expected error with reason. */
  export class InformationalError extends UndiciError {
    name: 'InformationalError';
    code: 'UND_ERR_INFO';
  }
  /** Request body length does not match content-length header. */
  export class RequestContentLengthMismatchError extends UndiciError {
    name: 'RequestContentLengthMismatchError';
    code: 'UND_ERR_REQ_CONTENT_LENGTH_MISMATCH';
  }
  /** Response body length does not match content-length header. */
  export class ResponseContentLengthMismatchError extends UndiciError {
    name: 'ResponseContentLengthMismatchError';
    code: 'UND_ERR_RES_CONTENT_LENGTH_MISMATCH';
  }
  /** Trying to use a destroyed client. */
  export class ClientDestroyedError extends UndiciError {
    name: 'ClientDestroyedError';
    code: 'UND_ERR_DESTROYED';
  }
  /** Trying to use a closed client. */
  export class ClientClosedError extends UndiciError {
    name: 'ClientClosedError';
    code: 'UND_ERR_CLOSED';
  }
  /** There is an error with the socket. */
  export class SocketError extends UndiciError {
    name: 'SocketError';
    code: 'UND_ERR_SOCKET';
    socket: Client$1.SocketInfo | null;
  }
  /** Encountered unsupported functionality. */
  export class NotSupportedError extends UndiciError {
    name: 'NotSupportedError';
    code: 'UND_ERR_NOT_SUPPORTED';
  }
  /** No upstream has been added to the BalancedPool. */
  export class BalancedPoolMissingUpstreamError extends UndiciError {
    name: 'MissingUpstreamError';
    code: 'UND_ERR_BPL_MISSING_UPSTREAM';
  }
  export class HTTPParserError extends UndiciError {
    name: 'HTTPParserError';
    code: string;
  }
  /** The response exceed the length allowed. */
  export class ResponseExceededMaxSizeError extends UndiciError {
    name: 'ResponseExceededMaxSizeError';
    code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE';
  }
  export class RequestRetryError extends UndiciError {
    constructor(message: string, statusCode: number, headers?: IncomingHttpHeaders$1 | string[] | null, body?: null | Record<string, any> | string);
    name: 'RequestRetryError';
    code: 'UND_ERR_REQ_RETRY';
    statusCode: number;
    data: {
      count: number;
    };
    headers: Record<string, string | string[]>;
  }
  export class SecureProxyConnectionError extends UndiciError {
    name: 'SecureProxyConnectionError';
    code: 'UND_ERR_PRX_TLS';
  }
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/dispatcher.d.ts
type AbortSignal$1 = unknown;
/** Dispatcher is the core API used to dispatch requests. */
declare class Dispatcher$1 extends EventEmitter {
  /** Dispatches a request. This API is expected to evolve through semver-major versions and is less stable than the preceding higher level APIs. It is primarily intended for library developers who implement higher level APIs on top of this. */
  dispatch(options: Dispatcher$1.DispatchOptions, handler: Dispatcher$1.DispatchHandlers): boolean;
  /** Starts two-way communications with the requested resource. */
  connect(options: Dispatcher$1.ConnectOptions): Promise<Dispatcher$1.ConnectData>;
  connect(options: Dispatcher$1.ConnectOptions, callback: (err: Error | null, data: Dispatcher$1.ConnectData) => void): void;
  /** Compose a chain of dispatchers */
  compose(dispatchers: Dispatcher$1.DispatcherComposeInterceptor[]): Dispatcher$1.ComposedDispatcher;
  compose(...dispatchers: Dispatcher$1.DispatcherComposeInterceptor[]): Dispatcher$1.ComposedDispatcher;
  /** Performs an HTTP request. */
  request(options: Dispatcher$1.RequestOptions): Promise<Dispatcher$1.ResponseData>;
  request(options: Dispatcher$1.RequestOptions, callback: (err: Error | null, data: Dispatcher$1.ResponseData) => void): void;
  /** For easy use with `stream.pipeline`. */
  pipeline(options: Dispatcher$1.PipelineOptions, handler: Dispatcher$1.PipelineHandler): Duplex;
  /** A faster version of `Dispatcher.request`. */
  stream(options: Dispatcher$1.RequestOptions, factory: Dispatcher$1.StreamFactory): Promise<Dispatcher$1.StreamData>;
  stream(options: Dispatcher$1.RequestOptions, factory: Dispatcher$1.StreamFactory, callback: (err: Error | null, data: Dispatcher$1.StreamData) => void): void;
  /** Upgrade to a different protocol. */
  upgrade(options: Dispatcher$1.UpgradeOptions): Promise<Dispatcher$1.UpgradeData>;
  upgrade(options: Dispatcher$1.UpgradeOptions, callback: (err: Error | null, data: Dispatcher$1.UpgradeData) => void): void;
  /** Closes the client and gracefully waits for enqueued requests to complete before invoking the callback (or returning a promise if no callback is provided). */
  close(): Promise<void>;
  close(callback: () => void): void;
  /** Destroy the client abruptly with the given err. All the pending and running requests will be asynchronously aborted and error. Waits until socket is closed before invoking the callback (or returning a promise if no callback is provided). Since this operation is asynchronously dispatched there might still be some progress on dispatched requests. */
  destroy(): Promise<void>;
  destroy(err: Error | null): Promise<void>;
  destroy(callback: () => void): void;
  destroy(err: Error | null, callback: () => void): void;
  on(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  on(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  on(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  on(eventName: 'drain', callback: (origin: URL$1) => void): this;
  once(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  once(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  once(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  once(eventName: 'drain', callback: (origin: URL$1) => void): this;
  off(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  off(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  off(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  off(eventName: 'drain', callback: (origin: URL$1) => void): this;
  addListener(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  addListener(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  addListener(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  addListener(eventName: 'drain', callback: (origin: URL$1) => void): this;
  removeListener(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  removeListener(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  removeListener(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  removeListener(eventName: 'drain', callback: (origin: URL$1) => void): this;
  prependListener(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  prependListener(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  prependListener(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  prependListener(eventName: 'drain', callback: (origin: URL$1) => void): this;
  prependOnceListener(eventName: 'connect', callback: (origin: URL$1, targets: readonly Dispatcher$1[]) => void): this;
  prependOnceListener(eventName: 'disconnect', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  prependOnceListener(eventName: 'connectionError', callback: (origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void): this;
  prependOnceListener(eventName: 'drain', callback: (origin: URL$1) => void): this;
  listeners(eventName: 'connect'): ((origin: URL$1, targets: readonly Dispatcher$1[]) => void)[];
  listeners(eventName: 'disconnect'): ((origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void)[];
  listeners(eventName: 'connectionError'): ((origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void)[];
  listeners(eventName: 'drain'): ((origin: URL$1) => void)[];
  rawListeners(eventName: 'connect'): ((origin: URL$1, targets: readonly Dispatcher$1[]) => void)[];
  rawListeners(eventName: 'disconnect'): ((origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void)[];
  rawListeners(eventName: 'connectionError'): ((origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError) => void)[];
  rawListeners(eventName: 'drain'): ((origin: URL$1) => void)[];
  emit(eventName: 'connect', origin: URL$1, targets: readonly Dispatcher$1[]): boolean;
  emit(eventName: 'disconnect', origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError): boolean;
  emit(eventName: 'connectionError', origin: URL$1, targets: readonly Dispatcher$1[], error: Errors$1.UndiciError): boolean;
  emit(eventName: 'drain', origin: URL$1): boolean;
}
declare namespace Dispatcher$1 {
  export interface ComposedDispatcher extends Dispatcher$1 {}
  export type DispatcherComposeInterceptor = (dispatch: Dispatcher$1['dispatch']) => Dispatcher$1['dispatch'];
  export interface DispatchOptions {
    origin?: string | URL$1;
    path: string;
    method: HttpMethod;
    /** Default: `null` */
    body?: string | Buffer | Uint8Array | Readable | null | FormData$2;
    /** Default: `null` */
    headers?: IncomingHttpHeaders$1 | string[] | Iterable<[string, string | string[] | undefined]> | null;
    /** Query string params to be embedded in the request URL. Default: `null` */
    query?: Record<string, any>;
    /** Whether the requests can be safely retried or not. If `false` the request won't be sent until all preceding requests in the pipeline have completed. Default: `true` if `method` is `HEAD` or `GET`. */
    idempotent?: boolean;
    /** Whether the response is expected to take a long time and would end up blocking the pipeline. When this is set to `true` further pipelining will be avoided on the same connection until headers have been received. */
    blocking?: boolean;
    /** Upgrade the request. Should be used to specify the kind of upgrade i.e. `'Websocket'`. Default: `method === 'CONNECT' || null`. */
    upgrade?: boolean | string | null;
    /** The amount of time, in milliseconds, the parser will wait to receive the complete HTTP headers. Defaults to 300 seconds. */
    headersTimeout?: number | null;
    /** The timeout after which a request will time out, in milliseconds. Monitors time between receiving body data. Use 0 to disable it entirely. Defaults to 300 seconds. */
    bodyTimeout?: number | null;
    /** Whether the request should stablish a keep-alive or not. Default `false` */
    reset?: boolean;
    /** Whether Undici should throw an error upon receiving a 4xx or 5xx response from the server. Defaults to false */
    throwOnError?: boolean;
    /** For H2, it appends the expect: 100-continue header, and halts the request body until a 100-continue is received from the remote server*/
    expectContinue?: boolean;
  }
  export interface ConnectOptions {
    origin: string | URL$1;
    path: string;
    /** Default: `null` */
    headers?: IncomingHttpHeaders$1 | string[] | null;
    /** Default: `null` */
    signal?: AbortSignal$1 | EventEmitter | null;
    /** This argument parameter is passed through to `ConnectData` */
    opaque?: unknown;
    /** Default: 0 */
    maxRedirections?: number;
    /** Default: false */
    redirectionLimitReached?: boolean;
    /** Default: `null` */
    responseHeader?: 'raw' | null;
  }
  export interface RequestOptions extends DispatchOptions {
    /** Default: `null` */
    opaque?: unknown;
    /** Default: `null` */
    signal?: AbortSignal$1 | EventEmitter | null;
    /** Default: 0 */
    maxRedirections?: number;
    /** Default: false */
    redirectionLimitReached?: boolean;
    /** Default: `null` */
    onInfo?: (info: {
      statusCode: number;
      headers: Record<string, string | string[]>;
    }) => void;
    /** Default: `null` */
    responseHeader?: 'raw' | null;
    /** Default: `64 KiB` */
    highWaterMark?: number;
  }
  export interface PipelineOptions extends RequestOptions {
    /** `true` if the `handler` will return an object stream. Default: `false` */
    objectMode?: boolean;
  }
  export interface UpgradeOptions {
    path: string;
    /** Default: `'GET'` */
    method?: string;
    /** Default: `null` */
    headers?: IncomingHttpHeaders$1 | string[] | null;
    /** A string of comma separated protocols, in descending preference order. Default: `'Websocket'` */
    protocol?: string;
    /** Default: `null` */
    signal?: AbortSignal$1 | EventEmitter | null;
    /** Default: 0 */
    maxRedirections?: number;
    /** Default: false */
    redirectionLimitReached?: boolean;
    /** Default: `null` */
    responseHeader?: 'raw' | null;
  }
  export interface ConnectData {
    statusCode: number;
    headers: IncomingHttpHeaders$1;
    socket: Duplex;
    opaque: unknown;
  }
  export interface ResponseData {
    statusCode: number;
    headers: IncomingHttpHeaders$1;
    body: BodyReadable$1 & BodyMixin;
    trailers: Record<string, string>;
    opaque: unknown;
    context: object;
  }
  export interface PipelineHandlerData {
    statusCode: number;
    headers: IncomingHttpHeaders$1;
    opaque: unknown;
    body: BodyReadable$1;
    context: object;
  }
  export interface StreamData {
    opaque: unknown;
    trailers: Record<string, string>;
  }
  export interface UpgradeData {
    headers: IncomingHttpHeaders$1;
    socket: Duplex;
    opaque: unknown;
  }
  export interface StreamFactoryData {
    statusCode: number;
    headers: IncomingHttpHeaders$1;
    opaque: unknown;
    context: object;
  }
  export type StreamFactory = (data: StreamFactoryData) => Writable;
  export interface DispatchHandlers {
    /** Invoked before request is dispatched on socket. May be invoked multiple times when a request is retried when the request at the head of the pipeline fails. */
    onConnect?(abort: (err?: Error) => void): void;
    /** Invoked when an error has occurred. */
    onError?(err: Error): void;
    /** Invoked when request is upgraded either due to a `Upgrade` header or `CONNECT` method. */
    onUpgrade?(statusCode: number, headers: Buffer[] | string[] | null, socket: Duplex): void;
    /** Invoked when response is received, before headers have been read. **/
    onResponseStarted?(): void;
    /** Invoked when statusCode and headers have been received. May be invoked multiple times due to 1xx informational headers. */
    onHeaders?(statusCode: number, headers: Buffer[], resume: () => void, statusText: string): boolean;
    /** Invoked when response payload data is received. */
    onData?(chunk: Buffer): boolean;
    /** Invoked when response payload and trailers have been received and the request has completed. */
    onComplete?(trailers: string[] | null): void;
    /** Invoked when a body chunk is sent to the server. May be invoked multiple times for chunked requests */
    onBodySent?(chunkSize: number, totalBytesSent: number): void;
  }
  export type PipelineHandler = (data: PipelineHandlerData) => Readable;
  export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
  /**
   * @link https://fetch.spec.whatwg.org/#body-mixin
   */
  interface BodyMixin {
    readonly body?: never;
    readonly bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob$1>;
    bytes(): Promise<Uint8Array>;
    formData(): Promise<never>;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }
  export interface DispatchInterceptor {
    (dispatch: Dispatcher$1['dispatch']): Dispatcher$1['dispatch'];
  }
}
//#endregion
//#region node_modules/.pnpm/undici-types@6.21.0/node_modules/undici-types/mock-interceptor.d.ts
/** The scope associated with a mock dispatch. */
declare class MockScope$1<TData extends object = object> {
  constructor(mockDispatch: MockInterceptor$1.MockDispatch<TData>);
  /** Delay a reply by a set amount of time in ms. */
  delay(waitInMs: number): MockScope$1<TData>;
  /** Persist the defined mock data for the associated reply. It will return the defined mock data indefinitely. */
  persist(): MockScope$1<TData>;
  /** Define a reply for a set amount of matching requests. */
  times(repeatTimes: number): MockScope$1<TData>;
}
/** The interceptor for a Mock. */
declare class MockInterceptor$1 {
  constructor(options: MockInterceptor$1.Options, mockDispatches: MockInterceptor$1.MockDispatch[]);
  /** Mock an undici request with the defined reply. */
  reply<TData extends object = object>(replyOptionsCallback: MockInterceptor$1.MockReplyOptionsCallback<TData>): MockScope$1<TData>;
  reply<TData extends object = object>(statusCode: number, data?: TData | Buffer | string | MockInterceptor$1.MockResponseDataHandler<TData>, responseOptions?: MockInterceptor$1.MockResponseOptions): MockScope$1<TData>;
  /** Mock an undici request by throwing the defined reply error. */
  replyWithError<TError extends Error = Error>(error: TError): MockScope$1;
  /** Set default reply headers on the interceptor for subsequent mocked replies. */
  defaultReplyHeaders(headers: IncomingHttpHeaders$1): MockInterceptor$1;
  /** Set default reply trailers on the interceptor for subsequent mocked replies. */
  defaultReplyTrailers(trailers: Record<string, string>): MockInterceptor$1;
  /** Set automatically calculated content-length header on subsequent mocked replies. */
  replyContentLength(): MockInterceptor$1;
}
declare namespace MockInterceptor$1 {
  /** MockInterceptor options. */
  export interface Options {
    /** Path to intercept on. */
    path: string | RegExp | ((path: string) => boolean);
    /** Method to intercept on. Defaults to GET. */
    method?: string | RegExp | ((method: string) => boolean);
    /** Body to intercept on. */
    body?: string | RegExp | ((body: string) => boolean);
    /** Headers to intercept on. */
    headers?: Record<string, string | RegExp | ((body: string) => boolean)> | ((headers: Record<string, string>) => boolean);
    /** Query params to intercept on */
    query?: Record<string, any>;
  }
  export interface MockDispatch<TData extends object = object, TError extends Error = Error> extends Options {
    times: number | null;
    persist: boolean;
    consumed: boolean;
    data: MockDispatchData<TData, TError>;
  }
  export interface MockDispatchData<TData extends object = object, TError extends Error = Error> extends MockResponseOptions {
    error: TError | null;
    statusCode?: number;
    data?: TData | string;
  }
  export interface MockResponseOptions {
    headers?: IncomingHttpHeaders$1;
    trailers?: Record<string, string>;
  }
  export interface MockResponseCallbackOptions {
    path: string;
    method: string;
    headers?: Headers$2 | Record<string, string>;
    origin?: string;
    body?: BodyInit$1 | Dispatcher$1.DispatchOptions['body'] | null;
    maxRedirections?: number;
  }
  export type MockResponseDataHandler<TData extends object = object> = (opts: MockResponseCallbackOptions) => TData | Buffer | string;
  export type MockReplyOptionsCallback<TData extends object = object> = (opts: MockResponseCallbackOptions) => {
    statusCode: number;
    data?: TData | Buffer | string;
    responseOptions?: MockResponseOptions;
  };
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/utility.d.ts
type AutocompletePrimitiveBaseType<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : never;
type Autocomplete<T> = T | (AutocompletePrimitiveBaseType<T> & Record<never, never>);
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/header.d.ts
/**
 * The header type declaration of `undici`.
 */
type IncomingHttpHeaders = Record<string, string | string[] | undefined>;
/**
 * The header type declaration of `undici` for outgoing requests.
 */
type OutgoingHttpHeaders = Record<string, number | string | string[] | undefined>;
type HeaderNames = Autocomplete<'Accept' | 'Accept-CH' | 'Accept-Charset' | 'Accept-Encoding' | 'Accept-Language' | 'Accept-Patch' | 'Accept-Post' | 'Accept-Ranges' | 'Access-Control-Allow-Credentials' | 'Access-Control-Allow-Headers' | 'Access-Control-Allow-Methods' | 'Access-Control-Allow-Origin' | 'Access-Control-Expose-Headers' | 'Access-Control-Max-Age' | 'Access-Control-Request-Headers' | 'Access-Control-Request-Method' | 'Age' | 'Allow' | 'Alt-Svc' | 'Alt-Used' | 'Authorization' | 'Cache-Control' | 'Clear-Site-Data' | 'Connection' | 'Content-Disposition' | 'Content-Encoding' | 'Content-Language' | 'Content-Length' | 'Content-Location' | 'Content-Range' | 'Content-Security-Policy' | 'Content-Security-Policy-Report-Only' | 'Content-Type' | 'Cookie' | 'Cross-Origin-Embedder-Policy' | 'Cross-Origin-Opener-Policy' | 'Cross-Origin-Resource-Policy' | 'Date' | 'Device-Memory' | 'ETag' | 'Expect' | 'Expect-CT' | 'Expires' | 'Forwarded' | 'From' | 'Host' | 'If-Match' | 'If-Modified-Since' | 'If-None-Match' | 'If-Range' | 'If-Unmodified-Since' | 'Keep-Alive' | 'Last-Modified' | 'Link' | 'Location' | 'Max-Forwards' | 'Origin' | 'Permissions-Policy' | 'Priority' | 'Proxy-Authenticate' | 'Proxy-Authorization' | 'Range' | 'Referer' | 'Referrer-Policy' | 'Retry-After' | 'Sec-Fetch-Dest' | 'Sec-Fetch-Mode' | 'Sec-Fetch-Site' | 'Sec-Fetch-User' | 'Sec-Purpose' | 'Sec-WebSocket-Accept' | 'Server' | 'Server-Timing' | 'Service-Worker-Navigation-Preload' | 'Set-Cookie' | 'SourceMap' | 'Strict-Transport-Security' | 'TE' | 'Timing-Allow-Origin' | 'Trailer' | 'Transfer-Encoding' | 'Upgrade' | 'Upgrade-Insecure-Requests' | 'User-Agent' | 'Vary' | 'Via' | 'WWW-Authenticate' | 'X-Content-Type-Options' | 'X-Frame-Options'>;
type IANARegisteredMimeType = Autocomplete<'audio/aac' | 'video/x-msvideo' | 'image/avif' | 'video/av1' | 'application/octet-stream' | 'image/bmp' | 'text/css' | 'text/csv' | 'application/vnd.ms-fontobject' | 'application/epub+zip' | 'image/gif' | 'application/gzip' | 'text/html' | 'image/x-icon' | 'text/calendar' | 'image/jpeg' | 'text/javascript' | 'application/json' | 'application/ld+json' | 'audio/x-midi' | 'audio/mpeg' | 'video/mp4' | 'video/mpeg' | 'audio/ogg' | 'video/ogg' | 'application/ogg' | 'audio/opus' | 'font/otf' | 'application/pdf' | 'image/png' | 'application/rtf' | 'image/svg+xml' | 'image/tiff' | 'video/mp2t' | 'font/ttf' | 'text/plain' | 'application/wasm' | 'video/webm' | 'audio/webm' | 'image/webp' | 'font/woff' | 'font/woff2' | 'application/xhtml+xml' | 'application/xml' | 'application/zip' | 'video/3gpp' | 'video/3gpp2' | 'model/gltf+json' | 'model/gltf-binary'>;
type KnownHeaderValues = {
  'content-type': IANARegisteredMimeType;
};
type HeaderRecord = { [K in HeaderNames | Lowercase<HeaderNames>]?: Lowercase<K> extends keyof KnownHeaderValues ? KnownHeaderValues[Lowercase<K>] : string; };
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/readable.d.ts
declare class BodyReadable extends Readable$1 {
  constructor(opts: {
    resume: (this: Readable$1, size: number) => void | null;
    abort: () => void | null;
    contentType?: string;
    contentLength?: number;
    highWaterMark?: number;
  });
  /** Consumes and returns the body as a string
   *  https://fetch.spec.whatwg.org/#dom-body-text
   */
  text(): Promise<string>;
  /** Consumes and returns the body as a JavaScript Object
   *  https://fetch.spec.whatwg.org/#dom-body-json
   */
  json(): Promise<unknown>;
  /** Consumes and returns the body as a Blob
   *  https://fetch.spec.whatwg.org/#dom-body-blob
   */
  blob(): Promise<Blob$2>;
  /** Consumes and returns the body as an Uint8Array
   *  https://fetch.spec.whatwg.org/#dom-body-bytes
   */
  bytes(): Promise<Uint8Array>;
  /** Consumes and returns the body as an ArrayBuffer
   *  https://fetch.spec.whatwg.org/#dom-body-arraybuffer
   */
  arrayBuffer(): Promise<ArrayBuffer>;
  /** Not implemented
   *
   *  https://fetch.spec.whatwg.org/#dom-body-formdata
   */
  formData(): Promise<never>;
  /** Returns true if the body is not null and the body has been consumed
   *
   *  Otherwise, returns false
   *
   * https://fetch.spec.whatwg.org/#dom-body-bodyused
   */
  readonly bodyUsed: boolean;
  /**
   * If body is null, it should return null as the body
   *
   *  If body is not null, should return the body as a ReadableStream
   *
   *  https://fetch.spec.whatwg.org/#dom-body-body
   */
  readonly body: never | undefined;
  /** Dumps the response body by reading `limit` number of bytes.
   * @param opts.limit Number of bytes to read (optional) - Default: 131072
   * @param opts.signal AbortSignal to cancel the operation (optional)
   */
  dump(opts?: {
    limit: number;
    signal?: AbortSignal;
  }): Promise<void>;
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/fetch.d.ts
type BodyInit = ArrayBuffer | AsyncIterable<Uint8Array> | Blob$2 | FormData$1 | Iterable<Uint8Array> | NodeJS.ArrayBufferView | URLSearchParams$2 | null | string;
interface SpecIterator<T, TReturn = any, TNext = undefined> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
}
interface SpecIteratorObject<T, TReturn = undefined, TNext = unknown> extends SpecIterator<T, TReturn, TNext> {
  [Symbol.iterator](): SpecIteratorObject<T, TReturn, TNext>;
  map<U>(callbackfn: (value: T, index: number) => U): SpecIteratorObject<U>;
  filter<S extends T>(predicate: (value: T, index: number) => value is S): SpecIteratorObject<S>;
  filter(predicate: (value: T, index: number) => unknown): SpecIteratorObject<T>;
  take(limit: number): SpecIteratorObject<T>;
  drop(count: number): SpecIteratorObject<T>;
  flatMap<U>(callbackfn: (value: T, index: number) => Iterator<U> | Iterable<U>): SpecIteratorObject<U>;
  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T;
  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue: T): T;
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
  toArray(): T[];
  forEach(callbackfn: (value: T, index: number) => void): void;
  some(predicate: (value: T, index: number) => unknown): boolean;
  every(predicate: (value: T, index: number) => unknown): boolean;
  find<S extends T>(predicate: (value: T, index: number) => value is S): S | undefined;
  find(predicate: (value: T, index: number) => unknown): T | undefined;
  readonly [Symbol.toStringTag]: string;
}
interface SpecIterableIterator<T> extends SpecIteratorObject<T> {
  [Symbol.iterator](): SpecIterableIterator<T>;
}
interface SpecIterable<T> {
  [Symbol.iterator](): SpecIterableIterator<T>;
}
type HeadersInit$1 = [string, string][] | HeaderRecord | Headers$1;
declare class Headers$1 implements SpecIterable<[string, string]> {
  constructor(init?: HeadersInit$1);
  readonly append: (name: string, value: string) => void;
  readonly delete: (name: string) => void;
  readonly get: (name: string) => string | null;
  readonly has: (name: string) => boolean;
  readonly set: (name: string, value: string) => void;
  readonly getSetCookie: () => string[];
  readonly forEach: (callbackfn: (value: string, key: string, iterable: Headers$1) => void, thisArg?: unknown) => void;
  readonly keys: () => SpecIterableIterator<string>;
  readonly values: () => SpecIterableIterator<string>;
  readonly entries: () => SpecIterableIterator<[string, string]>;
  readonly [Symbol.iterator]: () => SpecIterableIterator<[string, string]>;
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/formdata.d.ts
/**
 * A `string` or `File` that represents a single value from a set of `FormData` key-value pairs.
 */
declare type FormDataEntryValue = string | File$1;
/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using fetch().
 */
declare class FormData$1 {
  /**
   * Appends a new value onto an existing key inside a FormData object,
   * or adds the key if it does not already exist.
   *
   * The difference between `set()` and `append()` is that if the specified key already exists, `set()` will overwrite all existing values with the new one, whereas `append()` will append the new value onto the end of the existing set of values.
   *
   * @param name The name of the field whose data is contained in `value`.
   * @param value The field's value. This can be [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File). If none of these are specified the value is converted to a string.
   * @param fileName The filename reported to the server, when a Blob or File is passed as the second parameter. The default filename for Blob objects is "blob". The default filename for File objects is the file's filename.
   */
  append(name: string, value: unknown, fileName?: string): void;
  /**
   * Set a new value for an existing key inside FormData,
   * or add the new field if it does not already exist.
   *
   * @param name The name of the field whose data is contained in `value`.
   * @param value The field's value. This can be [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
    or [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File). If none of these are specified the value is converted to a string.
   * @param fileName The filename reported to the server, when a Blob or File is passed as the second parameter. The default filename for Blob objects is "blob". The default filename for File objects is the file's filename.
   *
   */
  set(name: string, value: unknown, fileName?: string): void;
  /**
   * Returns the first value associated with a given key from within a `FormData` object.
   * If you expect multiple values and want all of them, use the `getAll()` method instead.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @returns A `FormDataEntryValue` containing the value. If the key doesn't exist, the method returns null.
   */
  get(name: string): FormDataEntryValue | null;
  /**
   * Returns all the values associated with a given key from within a `FormData` object.
   *
   * @param {string} name A name of the value you want to retrieve.
   *
   * @returns An array of `FormDataEntryValue` whose key matches the value passed in the `name` parameter. If the key doesn't exist, the method returns an empty list.
   */
  getAll(name: string): FormDataEntryValue[];
  /**
   * Returns a boolean stating whether a `FormData` object contains a certain key.
   *
   * @param name A string representing the name of the key you want to test for.
   *
   * @return A boolean value.
   */
  has(name: string): boolean;
  /**
   * Deletes a key and its value(s) from a `FormData` object.
   *
   * @param name The name of the key you want to delete.
   */
  delete(name: string): void;
  /**
   * Executes given callback function for each field of the FormData instance
   */
  forEach: (callbackfn: (value: FormDataEntryValue, key: string, iterable: FormData$1) => void, thisArg?: unknown) => void;
  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all keys contained in this `FormData` object.
   * Each key is a `string`.
   */
  keys: () => SpecIterableIterator<string>;
  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through all values contained in this object `FormData` object.
   * Each value is a [`FormDataValue`](https://developer.mozilla.org/en-US/docs/Web/API/FormDataEntryValue).
   */
  values: () => SpecIterableIterator<FormDataEntryValue>;
  /**
   * Returns an [`iterator`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) allowing to go through the `FormData` key/value pairs.
   * The key of each pair is a string; the value is a [`FormDataValue`](https://developer.mozilla.org/en-US/docs/Web/API/FormDataEntryValue).
   */
  entries: () => SpecIterableIterator<[string, FormDataEntryValue]>;
  /**
   * An alias for FormData#entries()
   */
  [Symbol.iterator]: () => SpecIterableIterator<[string, FormDataEntryValue]>;
  readonly [Symbol.toStringTag]: string;
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/connector.d.ts
declare function buildConnector(options?: buildConnector.BuildOptions): buildConnector.connector;
declare namespace buildConnector {
  export type BuildOptions = (ConnectionOptions$1 | TcpNetConnectOpts$1 | IpcNetConnectOpts$1) & {
    allowH2?: boolean;
    preferH2?: boolean;
    maxCachedSessions?: number | null;
    socketPath?: string | null;
    timeout?: number | null;
    port?: number;
    keepAlive?: boolean | null;
    keepAliveInitialDelay?: number | null;
    typeOfService?: number | null;
  };
  export interface Options {
    hostname: string;
    host?: string;
    protocol: string;
    port: string;
    servername?: string;
    localAddress?: string | null;
    socketPath?: string | null;
    httpSocket?: Socket$1;
  }
  export type Callback = (...args: CallbackArgs) => void;
  type CallbackArgs = [null, Socket$1 | TLSSocket$1] | [Error, null];
  export interface connector {
    (options: buildConnector.Options, callback: buildConnector.Callback): void;
  }
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/client-stats.d.ts
declare class ClientStats {
  constructor(pool: Client);
  /** If socket has open connection. */
  connected: boolean;
  /** Number of open socket connections in this client that do not have an active request. */
  pending: number;
  /** Number of currently active requests of this client. */
  running: number;
  /** Number of active, pending, or queued requests of this client. */
  size: number;
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/client.d.ts
type ClientConnectOptions<TOpaque = null> = Omit<Dispatcher.ConnectOptions<TOpaque>, 'origin'>;
// TODO: Pendings
// 1. Reflect this on Client instantiation
// 2. Client H2 should use this namespaced options instead.
/**
 * A basic HTTP/1.1 client, mapped on top a single TCP/TLS connection. Pipelining is disabled by default.
 */
declare class Client extends Dispatcher {
  constructor(url: string | URL$2, options?: Client.Options);
  /** Property to get and set the pipelining factor. */
  pipelining: number;
  /** `true` after `client.close()` has been called. */
  closed: boolean;
  /** `true` after `client.destroyed()` has been called or `client.close()` has been called and the client shutdown has completed. */
  destroyed: boolean;
  /** Aggregate stats for a Client. */
  readonly stats: ClientStats;
  // Override dispatcher APIs.
  override connect<TOpaque = null>(options: ClientConnectOptions<TOpaque>): Promise<Dispatcher.ConnectData<TOpaque>>;
  override connect<TOpaque = null>(options: ClientConnectOptions<TOpaque>, callback: (err: Error | null, data: Dispatcher.ConnectData<TOpaque>) => void): void;
}
declare namespace Client {
  export interface Options {
    /** The maximum length of request headers in bytes. Default: Node.js' `--max-http-header-size` or `16384` (16KiB). */
    maxHeaderSize?: number;
    /** The amount of time, in milliseconds, the parser will wait to receive the complete HTTP headers (Node 14 and above only). Default: `300e3` milliseconds (300s). HTTP/1.1 parser timeouts are not guaranteed to fire with exact millisecond precision: delays up to 1000ms use native timers, while larger delays use lower-overhead fast timers with a target resolution around 500ms. */
    headersTimeout?: number;
    /** @deprecated unsupported socketTimeout, use headersTimeout & bodyTimeout instead */
    socketTimeout?: never;
    /** @deprecated unsupported requestTimeout, use headersTimeout & bodyTimeout instead */
    requestTimeout?: never;
    /** The timeout for establishing a socket connection, in milliseconds. Use `0` to disable it entirely. Default: `10e3` milliseconds (10s). */
    connectTimeout?: number;
    /** The timeout after which a request will time out, in milliseconds. Monitors time between receiving body data. Use `0` to disable it entirely. Default: `300e3` milliseconds (300s). HTTP/1.1 parser timeouts are not guaranteed to fire with exact millisecond precision: delays up to 1000ms use native timers, while larger delays use lower-overhead fast timers with a target resolution around 500ms. */
    bodyTimeout?: number;
    /** @deprecated unsupported idleTimeout, use keepAliveTimeout instead */
    idleTimeout?: never;
    /** @deprecated unsupported keepAlive, use pipelining=0 instead */
    keepAlive?: never;
    /** the timeout, in milliseconds, after which a socket without active requests will time out. Monitors time between activity on a connected socket. This value may be overridden by *keep-alive* hints from the server. Default: `4e3` milliseconds (4s). */
    keepAliveTimeout?: number;
    /** @deprecated unsupported maxKeepAliveTimeout, use keepAliveMaxTimeout instead */
    maxKeepAliveTimeout?: never;
    /** the maximum allowed `idleTimeout`, in milliseconds, when overridden by *keep-alive* hints from the server. Default: `600e3` milliseconds (10min). */
    keepAliveMaxTimeout?: number;
    /** A number of milliseconds subtracted from server *keep-alive* hints when overriding `idleTimeout` to account for timing inaccuracies caused by e.g. transport latency. Default: `1e3` milliseconds (1s). */
    keepAliveTimeoutThreshold?: number;
    /** An IPC endpoint, either a Unix domain socket or Windows named pipe. Default: `null`. */
    socketPath?: string;
    /** The amount of concurrent requests to be sent over the single TCP/TLS connection according to [RFC7230](https://tools.ietf.org/html/rfc7230#section-6.3.2). Only enable values greater than `1` when the remote server is trusted. Default: `1`. */
    pipelining?: number;
    /** @deprecated use the connect option instead */
    tls?: never;
    /** If `true`, an error is thrown when the request content-length header doesn't match the length of the request body. Default: `true`. */
    strictContentLength?: boolean;
    /** Maximum number of TLS cached sessions used by the built-in connector. Use `0` to disable TLS session caching. Default: `100`. */
    maxCachedSessions?: number;
    /** Connector options passed to `buildConnector`, or a custom connector function. Default: `null`. */
    connect?: Partial<buildConnector.BuildOptions> | buildConnector.connector;
    /** The maximum number of requests to send over a single connection before it is reset. Use `0` to disable this limit. Default: `null`. */
    maxRequestsPerClient?: number;
    /** Local IP address the socket should connect from. */
    localAddress?: string;
    /** Max response body size in bytes, -1 is disabled */
    maxResponseSize?: number;
    /** WebSocket-specific options */
    webSocket?: Client.WebSocketOptions;
    /** EventSource-specific options */
    eventSource?: Client.EventSourceOptions;
    /** Enables a family autodetection algorithm that loosely implements section 5 of RFC 8305. */
    autoSelectFamily?: boolean;
    /** The amount of time in milliseconds to wait for a connection attempt to finish before trying the next address when using the `autoSelectFamily` option. */
    autoSelectFamilyAttemptTimeout?: number;
    /**
     * @description Enables support for H2 if the server has assigned bigger priority to it through ALPN negotiation.
     * @default true
     */
    allowH2?: boolean;
    /**
     * @description Dictates the maximum number of concurrent streams for a single H2 session. It can be overridden by a SETTINGS remote frame.
     * @default 100
     * @deprecated Use h2Options.maxConcurrentStreams instead
     */
    maxConcurrentStreams?: number;
    /**
     * @description Sets the HTTP/2 stream-level flow-control window size (SETTINGS_INITIAL_WINDOW_SIZE).
     * @default 262144
     * @deprecated Use h2Options.settings.initialWindowSize instead
     */
    initialWindowSize?: number;
    /**
     * @description Sets the HTTP/2 connection-level flow-control window size (ClientHttp2Session.setLocalWindowSize).
     * @default 524288
     * @deprecated Use h2Options.connectionWindowSize instead
     */
    connectionWindowSize?: number;
    /**
     * @description Time interval between PING frames dispatch
     * @default 60000
     * @deprecated Use h2Options.connectionWindowSize instead
     */
    pingInterval?: number;
    /**
     * @description HTTP/2 configuration options
     */
    h2Options?: Client.H2Options;
  }
  export interface SocketInfo {
    localAddress?: string;
    localPort?: number;
    remoteAddress?: string;
    remotePort?: number;
    remoteFamily?: string;
    timeout?: number;
    bytesWritten?: number;
    bytesRead?: number;
  }
  export interface WebSocketOptions {
    /**
     * Maximum number of fragments in a message. Set to 0 to disable the limit.
     * @default 131072
     */
    maxFragments?: number;
    /**
     * Maximum allowed payload size in bytes for WebSocket messages.
     * Applied to uncompressed messages, compressed frame payloads, and decompressed (permessage-deflate) messages.
     * Set to 0 to disable the limit.
     * @default 134217728 (128 MB)
     */
    maxPayloadSize?: number;
  }
  export interface H2Options extends Omit<SessionOptions, keyof buildConnector.BuildOptions> {
    /**
     * @description Sets the HTTP/2 connection-level flow-control window size (ClientHttp2Session.setLocalWindowSize).
     * @default 524288
     */
    connectionWindowSize?: number;
    /**
     * @description Time interval between PING frames dispatch
     * @default 60000
     */
    pingInterval?: number;
    /**
     * @description Dictates the maximum number of concurrent streams for a single H2 session. It can be overridden by a SETTINGS remote frame.
     * @default 100
     */
    maxConcurrentStreams?: number;
    /**
     * @description Enable support for H2C (plain text)
     * @default false
     */
    useH2c?: boolean;
    /**
     * @description SETTINGS frame object. Default to 'node:http2' defaults
     */
    settings?: Omit<SessionOptions['settings'], 'enablePush' | 'maxConcurrentStreams' | 'enableConnectProtocol'>;
  }
  export interface EventSourceOptions {
    /**
     * Maximum allowed event size in bytes for EventSource messages.
     * Set to 0 to disable the limit.
     * @default buffer.kStringMaxLength
     */
    maxEventSize?: number;
  }
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/errors.d.ts
declare namespace Errors {
  export class UndiciError extends Error {
    name: string;
    code: string;
  }
  /** Connect timeout error. */
  export class ConnectTimeoutError extends UndiciError {
    name: 'ConnectTimeoutError';
    code: 'UND_ERR_CONNECT_TIMEOUT';
  }
  /** A header exceeds the `headersTimeout` option. */
  export class HeadersTimeoutError extends UndiciError {
    name: 'HeadersTimeoutError';
    code: 'UND_ERR_HEADERS_TIMEOUT';
  }
  /** Headers overflow error. */
  export class HeadersOverflowError extends UndiciError {
    name: 'HeadersOverflowError';
    code: 'UND_ERR_HEADERS_OVERFLOW';
  }
  /** A body exceeds the `bodyTimeout` option. */
  export class BodyTimeoutError extends UndiciError {
    name: 'BodyTimeoutError';
    code: 'UND_ERR_BODY_TIMEOUT';
  }
  export class ResponseError extends UndiciError {
    constructor(message: string, code: number, options: {
      headers?: IncomingHttpHeaders | string[] | null;
      body?: null | Record<string, any> | string;
    });
    name: 'ResponseError';
    code: 'UND_ERR_RESPONSE';
    statusCode: number;
    body: null | Record<string, any> | string;
    headers: IncomingHttpHeaders | string[] | null;
  }
  /** Passed an invalid argument. */
  export class InvalidArgumentError extends UndiciError {
    name: 'InvalidArgumentError';
    code: 'UND_ERR_INVALID_ARG';
  }
  /** Returned an invalid value. */
  export class InvalidReturnValueError extends UndiciError {
    name: 'InvalidReturnValueError';
    code: 'UND_ERR_INVALID_RETURN_VALUE';
  }
  /** The request has been aborted by the user. */
  export class RequestAbortedError extends UndiciError {
    name: 'AbortError';
    code: 'UND_ERR_ABORTED';
  }
  /** Expected error with reason. */
  export class InformationalError extends UndiciError {
    name: 'InformationalError';
    code: 'UND_ERR_INFO';
  }
  /** Request body length does not match content-length header. */
  export class RequestContentLengthMismatchError extends UndiciError {
    name: 'RequestContentLengthMismatchError';
    code: 'UND_ERR_REQ_CONTENT_LENGTH_MISMATCH';
  }
  /** Response body length does not match content-length header. */
  export class ResponseContentLengthMismatchError extends UndiciError {
    name: 'ResponseContentLengthMismatchError';
    code: 'UND_ERR_RES_CONTENT_LENGTH_MISMATCH';
  }
  /** Trying to use a destroyed client. */
  export class ClientDestroyedError extends UndiciError {
    name: 'ClientDestroyedError';
    code: 'UND_ERR_DESTROYED';
  }
  /** Trying to use a closed client. */
  export class ClientClosedError extends UndiciError {
    name: 'ClientClosedError';
    code: 'UND_ERR_CLOSED';
  }
  /** There is an error with the socket. */
  export class SocketError extends UndiciError {
    name: 'SocketError';
    code: 'UND_ERR_SOCKET';
    socket: Client.SocketInfo | null;
  }
  /** Encountered unsupported functionality. */
  export class NotSupportedError extends UndiciError {
    name: 'NotSupportedError';
    code: 'UND_ERR_NOT_SUPPORTED';
  }
  /** No upstream has been added to the BalancedPool. */
  export class BalancedPoolMissingUpstreamError extends UndiciError {
    name: 'MissingUpstreamError';
    code: 'UND_ERR_BPL_MISSING_UPSTREAM';
  }
  export class HTTPParserError extends UndiciError {
    name: 'HTTPParserError';
    code: string;
  }
  /** The response exceed the length allowed. */
  export class ResponseExceededMaxSizeError extends UndiciError {
    name: 'ResponseExceededMaxSizeError';
    code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE';
  }
  export class RequestRetryError extends UndiciError {
    constructor(message: string, statusCode: number, headers?: IncomingHttpHeaders | string[] | null, body?: null | Record<string, any> | string);
    name: 'RequestRetryError';
    code: 'UND_ERR_REQ_RETRY';
    statusCode: number;
    data: {
      count: number;
    };
    headers: Record<string, string | string[]>;
  }
  export class SecureProxyConnectionError extends UndiciError {
    constructor(cause?: Error, message?: string, options?: Record<any, any>);
    name: 'SecureProxyConnectionError';
    code: 'UND_ERR_PRX_TLS';
  }
  export class ProxyConnectionError extends UndiciError {
    constructor(cause?: Error, message?: string, options?: Record<any, any>);
    name: 'ProxyConnectionError';
    code: 'UND_ERR_PRX_CONN';
  }
  export class MaxOriginsReachedError extends UndiciError {
    name: 'MaxOriginsReachedError';
    code: 'UND_ERR_MAX_ORIGINS_REACHED';
  }
  /** SOCKS5 proxy related error. */
  export class Socks5ProxyError extends UndiciError {
    constructor(message?: string, code?: string);
    name: 'Socks5ProxyError';
    code: string;
  }
  /** WebSocket decompressed message exceeded maximum size. */
  export class MessageSizeExceededError extends UndiciError {
    name: 'MessageSizeExceededError';
    code: 'UND_ERR_WS_MESSAGE_SIZE_EXCEEDED';
  }
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/dispatcher.d.ts
type UndiciHeaders = OutgoingHttpHeaders | string[] | Iterable<[string, string | string[] | undefined]> | null;
/** Dispatcher is the core API used to dispatch requests. */
declare class Dispatcher extends EventEmitter$1 {
  /** Dispatches a request. This API is expected to evolve through semver-major versions and is less stable than the preceding higher level APIs. It is primarily intended for library developers who implement higher level APIs on top of this. */
  dispatch(options: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandler): boolean;
  /** Starts two-way communications with the requested resource. */
  connect<TOpaque = null>(options: Dispatcher.ConnectOptions<TOpaque>, callback: (err: Error | null, data: Dispatcher.ConnectData<TOpaque>) => void): void;
  connect<TOpaque = null>(options: Dispatcher.ConnectOptions<TOpaque>): Promise<Dispatcher.ConnectData<TOpaque>>;
  /** Compose a chain of dispatchers */
  compose(dispatchers: Dispatcher.DispatcherComposeInterceptor[]): Dispatcher.ComposedDispatcher;
  compose(...dispatchers: Dispatcher.DispatcherComposeInterceptor[]): Dispatcher.ComposedDispatcher;
  /** Performs an HTTP request. */
  request<TOpaque = null>(options: Dispatcher.RequestOptions<TOpaque>, callback: (err: Error | null, data: Dispatcher.ResponseData<TOpaque>) => void): void;
  request<TOpaque = null>(options: Dispatcher.RequestOptions<TOpaque>): Promise<Dispatcher.ResponseData<TOpaque>>;
  /** For easy use with `stream.pipeline`. */
  pipeline<TOpaque = null>(options: Dispatcher.PipelineOptions<TOpaque>, handler: Dispatcher.PipelineHandler<TOpaque>): Duplex$1;
  /** A faster version of `Dispatcher.request`. */
  stream<TOpaque = null>(options: Dispatcher.RequestOptions<TOpaque>, factory: Dispatcher.StreamFactory<TOpaque>, callback: (err: Error | null, data: Dispatcher.StreamData<TOpaque>) => void): void;
  stream<TOpaque = null>(options: Dispatcher.RequestOptions<TOpaque>, factory: Dispatcher.StreamFactory<TOpaque>): Promise<Dispatcher.StreamData<TOpaque>>;
  /** Upgrade to a different protocol. */
  upgrade(options: Dispatcher.UpgradeOptions, callback: (err: Error | null, data: Dispatcher.UpgradeData) => void): void;
  upgrade(options: Dispatcher.UpgradeOptions): Promise<Dispatcher.UpgradeData>;
  /** Closes the client and gracefully waits for enqueued requests to complete before invoking the callback (or returning a promise if no callback is provided). */
  close(callback: () => void): void;
  close(): Promise<void>;
  /** Destroy the client abruptly with the given err. All the pending and running requests will be asynchronously aborted and error. Waits until socket is closed before invoking the callback (or returning a promise if no callback is provided). Since this operation is asynchronously dispatched there might still be some progress on dispatched requests. */
  destroy(err: Error | null, callback: () => void): void;
  destroy(callback: () => void): void;
  destroy(err: Error | null): Promise<void>;
  destroy(): Promise<void>;
  on(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  on(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  on(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  on(eventName: 'drain', callback: (origin: URL$2) => void): this;
  once(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  once(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  once(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  once(eventName: 'drain', callback: (origin: URL$2) => void): this;
  off(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  off(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  off(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  off(eventName: 'drain', callback: (origin: URL$2) => void): this;
  addListener(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  addListener(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  addListener(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  addListener(eventName: 'drain', callback: (origin: URL$2) => void): this;
  removeListener(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  removeListener(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  removeListener(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  removeListener(eventName: 'drain', callback: (origin: URL$2) => void): this;
  prependListener(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  prependListener(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  prependListener(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  prependListener(eventName: 'drain', callback: (origin: URL$2) => void): this;
  prependOnceListener(eventName: 'connect', callback: (origin: URL$2, targets: readonly Dispatcher[]) => void): this;
  prependOnceListener(eventName: 'disconnect', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  prependOnceListener(eventName: 'connectionError', callback: (origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void): this;
  prependOnceListener(eventName: 'drain', callback: (origin: URL$2) => void): this;
  listeners(eventName: 'connect'): ((origin: URL$2, targets: readonly Dispatcher[]) => void)[];
  listeners(eventName: 'disconnect'): ((origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void)[];
  listeners(eventName: 'connectionError'): ((origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void)[];
  listeners(eventName: 'drain'): ((origin: URL$2) => void)[];
  rawListeners(eventName: 'connect'): ((origin: URL$2, targets: readonly Dispatcher[]) => void)[];
  rawListeners(eventName: 'disconnect'): ((origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void)[];
  rawListeners(eventName: 'connectionError'): ((origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError) => void)[];
  rawListeners(eventName: 'drain'): ((origin: URL$2) => void)[];
  emit(eventName: 'connect', origin: URL$2, targets: readonly Dispatcher[]): boolean;
  emit(eventName: 'disconnect', origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError): boolean;
  emit(eventName: 'connectionError', origin: URL$2, targets: readonly Dispatcher[], error: Errors.UndiciError): boolean;
  emit(eventName: 'drain', origin: URL$2): boolean;
}
declare namespace Dispatcher {
  export interface ComposedDispatcher extends Dispatcher {}
  export type Dispatch = Dispatcher['dispatch'];
  export type DispatcherComposeInterceptor = (dispatch: Dispatch) => Dispatch;
  export interface DispatchOptions {
    origin?: string | URL$2;
    path: string;
    method: HttpMethod;
    /** Default: `null` */
    body?: string | Buffer | Uint8Array | Readable$1 | null | FormData$1;
    /** Default: `null` */
    headers?: UndiciHeaders;
    /** Query string params to be embedded in the request URL. Default: `null` */
    query?: Record<string, any>;
    /** Whether the requests can be safely retried or not. If `false` the request won't be sent until all preceding requests in the pipeline have completed. Default: `true` if `method` is `HEAD` or `GET`. */
    idempotent?: boolean;
    /** Whether the response is expected to take a long time and would end up blocking the pipeline. When this is set to `true` further pipelining will be avoided on the same connection until headers have been received. Defaults to `method !== 'HEAD'`. */
    blocking?: boolean;
    /** The IP Type of Service (ToS) value for the request socket. Must be an integer between 0 and 255. */
    typeOfService?: number | null;
    /** Upgrade the request. Should be used to specify the kind of upgrade i.e. `'Websocket'`. Default: `method === 'CONNECT' || null`. */
    upgrade?: boolean | string | null;
    /** The amount of time, in milliseconds, the parser will wait to receive the complete HTTP headers. Defaults to 300 seconds. HTTP/1.1 parser timeouts are not guaranteed to fire with exact millisecond precision: delays up to 1000ms use native timers, while larger delays use lower-overhead fast timers with a target resolution around 500ms. */
    headersTimeout?: number | null;
    /** The timeout after which a request will time out, in milliseconds. Monitors time between receiving body data. Use 0 to disable it entirely. Defaults to 300 seconds. HTTP/1.1 parser timeouts are not guaranteed to fire with exact millisecond precision: delays up to 1000ms use native timers, while larger delays use lower-overhead fast timers with a target resolution around 500ms. */
    bodyTimeout?: number | null;
    /** Whether the request should stablish a keep-alive or not. Default `false` */
    reset?: boolean;
    /** For H2, it appends the expect: 100-continue header, and halts the request body until a 100-continue is received from the remote server */
    expectContinue?: boolean;
  }
  export interface ConnectOptions<TOpaque = null> {
    origin: string | URL$2;
    path: string;
    /** Default: `null` */
    headers?: UndiciHeaders;
    /** Default: `null` */
    signal?: AbortSignal | EventEmitter$1 | null;
    /** This argument parameter is passed through to `ConnectData` */
    opaque?: TOpaque;
    /** Default: `null` */
    responseHeaders?: 'raw' | null;
  }
  export interface RequestOptions<TOpaque = null> extends DispatchOptions {
    /** Default: `null` */
    opaque?: TOpaque;
    /** Default: `null` */
    signal?: AbortSignal | EventEmitter$1 | null;
    /** Default: `null` */
    onInfo?: (info: {
      statusCode: number;
      headers: Record<string, string | string[]>;
    }) => void;
    /** Default: `null` */
    responseHeaders?: 'raw' | null;
    /** Default: `64 KiB` */
    highWaterMark?: number;
  }
  export interface PipelineOptions<TOpaque = null> extends RequestOptions<TOpaque> {
    /** `true` if the `handler` will return an object stream. Default: `false` */
    objectMode?: boolean;
  }
  export interface UpgradeOptions {
    path: string;
    /** Default: `'GET'` */
    method?: string;
    /** Default: `null` */
    headers?: UndiciHeaders;
    /** A string of comma separated protocols, in descending preference order. Default: `'Websocket'` */
    protocol?: string;
    /** Default: `null` */
    signal?: AbortSignal | EventEmitter$1 | null;
    /** Default: `null` */
    responseHeaders?: 'raw' | null;
  }
  export interface ConnectData<TOpaque = null> {
    statusCode: number;
    headers: IncomingHttpHeaders;
    socket: Duplex$1;
    opaque: TOpaque;
  }
  export interface ResponseData<TOpaque = null> {
    statusCode: number;
    statusText: string;
    headers: IncomingHttpHeaders;
    body: BodyReadable & BodyMixin;
    trailers: Record<string, string>;
    opaque: TOpaque;
    context: object;
  }
  export interface PipelineHandlerData<TOpaque = null> {
    statusCode: number;
    headers: IncomingHttpHeaders;
    opaque: TOpaque;
    body: BodyReadable;
    context: object;
  }
  export interface StreamData<TOpaque = null> {
    opaque: TOpaque;
    trailers: Record<string, string>;
  }
  export interface UpgradeData<TOpaque = null> {
    headers: IncomingHttpHeaders;
    socket: Duplex$1;
    opaque: TOpaque;
  }
  export interface StreamFactoryData<TOpaque = null> {
    statusCode: number;
    headers: IncomingHttpHeaders;
    opaque: TOpaque;
    context: object;
  }
  export type StreamFactory<TOpaque = null> = (data: StreamFactoryData<TOpaque>) => Writable$1;
  export interface DispatchController {
    get aborted(): boolean;
    get paused(): boolean;
    get reason(): Error | null;
    rawHeaders?: Buffer[] | string[] | IncomingHttpHeaders | null;
    rawTrailers?: Buffer[] | string[] | IncomingHttpHeaders | null;
    abort(reason: Error): void;
    pause(): void;
    resume(): void;
  }
  export interface DispatchHandler {
    onRequestStart?(controller: DispatchController, context: any): void;
    onRequestUpgrade?(controller: DispatchController, statusCode: number, headers: IncomingHttpHeaders, socket: Duplex$1): void;
    onResponseStart?(controller: DispatchController, statusCode: number, headers: IncomingHttpHeaders, statusMessage?: string): void;
    onResponseData?(controller: DispatchController, chunk: Buffer): void;
    onResponseEnd?(controller: DispatchController, trailers: IncomingHttpHeaders): void;
    onResponseError?(controller: DispatchController, error: Error): void;
    /** Invoked when response is received, before headers have been read. **/
    onResponseStarted?(): void;
    /** Invoked when a body chunk is sent to the server. May be invoked multiple times for chunked requests */
    onBodySent?(chunk: Buffer): void;
    /** Invoked after the request body is fully sent. */
    onRequestSent?(): void;
  }
  export type PipelineHandler<TOpaque = null> = (data: PipelineHandlerData<TOpaque>) => Readable$1;
  export type HttpMethod = Autocomplete<'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'>;
  /**
   * @link https://fetch.spec.whatwg.org/#body-mixin
   */
  interface BodyMixin {
    readonly body?: never;
    readonly bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob$2>;
    bytes(): Promise<Uint8Array>;
    formData(): Promise<never>;
    json(): Promise<unknown>;
    text(): Promise<string>;
  }
  export interface DispatchInterceptor {
    (dispatch: Dispatch): Dispatch;
  }
}
//#endregion
//#region ../../../AppData/Local/pnpm/store/v11/links/@/undici/8.11.2/540de117f520e26eb366da359d3efedef88ef85230031e43dab3cd8a442720f9/node_modules/undici/types/mock-interceptor.d.ts
/** The scope associated with a mock dispatch. */
declare class MockScope<TData extends object = object> {
  constructor(mockDispatch: MockInterceptor.MockDispatch<TData>);
  /** Delay a reply by a set amount of time in ms. */
  delay(waitInMs: number): MockScope<TData>;
  /** Persist the defined mock data for the associated reply. It will return the defined mock data indefinitely. */
  persist(): MockScope<TData>;
  /** Define a reply for a set amount of matching requests. */
  times(repeatTimes: number): MockScope<TData>;
}
/** The interceptor for a Mock. */
declare class MockInterceptor {
  constructor(options: MockInterceptor.Options, mockDispatches: MockInterceptor.MockDispatch[]);
  /** Mock an undici request with the defined reply. */
  reply<TData extends object = object>(replyOptionsCallback: MockInterceptor.MockReplyOptionsCallback<TData>): MockScope<TData>;
  reply<TData extends object = object>(statusCode: number, data?: TData | Buffer | string | MockInterceptor.MockResponseDataHandler<TData>, responseOptions?: MockInterceptor.MockResponseOptions): MockScope<TData>;
  /** Mock an undici request by throwing the defined reply error. */
  replyWithError<TError extends Error = Error>(error: TError): MockScope;
  /** Set default reply headers on the interceptor for subsequent mocked replies. */
  defaultReplyHeaders(headers: IncomingHttpHeaders): MockInterceptor;
  /** Set default reply trailers on the interceptor for subsequent mocked replies. */
  defaultReplyTrailers(trailers: Record<string, string>): MockInterceptor;
  /** Set automatically calculated content-length header on subsequent mocked replies. */
  replyContentLength(): MockInterceptor;
}
declare namespace MockInterceptor {
  /** MockInterceptor options. */
  export interface Options {
    /** Path to intercept on. */
    path: string | RegExp | ((path: string) => boolean);
    /** Method to intercept on. Defaults to GET. */
    method?: string | RegExp | ((method: string) => boolean);
    /** Body to intercept on. */
    body?: string | RegExp | ((body: string) => boolean);
    /** Headers to intercept on. */
    headers?: Record<string, string | RegExp | ((body: string) => boolean)> | ((headers: Record<string, string>) => boolean);
    /** Query params to intercept on */
    query?: Record<string, any>;
  }
  export interface MockDispatch<TData extends object = object, TError extends Error = Error> extends Options {
    times: number | null;
    persist: boolean;
    consumed: boolean;
    data: MockDispatchData<TData, TError>;
  }
  export interface MockDispatchData<TData extends object = object, TError extends Error = Error> extends MockResponseOptions {
    error: TError | null;
    statusCode?: number;
    data?: TData | string;
  }
  export interface MockResponseOptions {
    headers?: IncomingHttpHeaders;
    trailers?: Record<string, string>;
  }
  export interface MockResponseCallbackOptions {
    path: string;
    method: string;
    headers?: Headers$1 | Record<string, string>;
    origin?: string;
    body?: BodyInit | Dispatcher.DispatchOptions['body'] | null;
  }
  export type MockResponseDataHandler<TData extends object = object> = (opts: MockResponseCallbackOptions) => TData | Buffer | string;
  export type MockReplyOptions<TData extends object = object> = {
    statusCode: number;
    data?: TData | Buffer | string;
    responseOptions?: MockResponseOptions;
  };
  export type MockReplyOptionsCallback<TData extends object = object> = (opts: MockResponseCallbackOptions) => MockReplyOptions<TData> | Promise<MockReplyOptions<TData>>;
}
//#endregion
//#region src/catalog.d.ts
/**
 * CodeArts model catalog.
 *
 * **目录只放上游给的东西。** 唯一来源是动态发现（`src/discovery.ts` +
 * `upstream.fetchModels`）：启动、每小时、以及卡片上「刷新模型列表」各拉一次，
 * 取内置 / 限时福利 / agent-center 三路的并集。上游没返回的模型就是没有，
 * 未登录或三路全失败时目录是空的 —— 不拿一份历史名单冒充「可用模型」。
 *
 * `FALLBACK_CODEARTS_MODELS` 因此**不再往目录里塞模型**，只剩一个按 id 的参数表：
 * 上游有时不给 `contextWindow` / `maxTokens`，而写错的 `maxTokens` 会让每个请求
 * 直接失败（见 `MEASURED_MAX_TOKENS`）。它只给发现到的模型补参数，别的什么都不管。
 *
 * 福利路由同理：只有 `gateway/config` 亲口给出的模型才算福利（见 `isBenefitModel`）。
 * 这条渠道 2026-10-21 起整体不可用，于是福利模型当天就从目录里消失 —— 那是事实，
 * 不是故障，硬撑只会把能正常用的积分模型推到一条不存在的渠道上。
 *
 * @module dsh-codearts-connect/catalog
 */
/** One model the adapter exposes to DSH. */
interface CodeArtsModelThinking {
  /** 上游提供的思考强度（`thinking-variants` 的 `strengths`，如 `['high','max']`）。 */
  strengths: readonly string[];
  /** 上游默认强度（`default_strength`）。宿主不强制使用，只作诊断。 */
  default?: string;
}
interface CodeArtsModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  maxTokens: number;
  supportsImages: boolean;
  /**
   * 图片不是模型原生支持的：请求层会先按原图发一次，被上游判 `not multimodal`
   * 后再由视觉模型转述成文字重发。设置里的「图片转述」开关打开时，被图片黑名单
   * 挡住的模型会临时带上这个标记。
   */
  imageBridge?: boolean;
  /**
   * 该模型可选的思考强度。
   *
   * 由动态发现填入（`POST /v1/model/thinking-variants`，按账号授予）：空/缺省表示
   * 上游没给这条模型开关，宿主就不该显示推理档位选择器。
   */
  thinking?: CodeArtsModelThinking;
  /**
   * 积分消耗倍率（上游 `credit[].ratio_display` 的原值，如 `0.18x`）。
   *
   * 来自模型发现；福利模型由展示层强制成 `x0.00`，不依赖上游是否给 credit。
   */
  ratio?: string;
  /**
   * 该模型走限时福利（免费套餐）路由。
   *
   * 由动态发现填入：福利是按账号授予的，只有拉过 `gateway/config` 才知道某个账号
   * 到底有没有它。种子里那份静态名单只是冷启动兜底（见 `isBenefitModel`）。
   */
  benefit?: boolean;
}
/**
 * 参数表（不是模型名单）：只给**发现到的**模型补 `contextWindow` / `maxTokens` /
 * `supportsImages`，绝不会因为这里有条目就把模型塞进目录。
 *
 * maxTokens 注记（2026-09-30 实测，scripts/param-probe.mjs 直连上游二分验证）：
 * 福利 DeepSeek 模型的 max_tokens 服务端硬上限是 **65536**，更大的值
 * （73728 / 98304 / 131072 / 384000 / 393216）一律流内报
 * InferHub.001001005.400 "The request param is invalid, Please check it"。
 * 此前的 384000/393216 是占位值：DSH 会把 catalog 的 maxTokens 作为
 * max_tokens 原样发给上游，导致所有请求直接失败。
 */
declare const FALLBACK_CODEARTS_MODELS: readonly CodeArtsModelInfo[];
/** Mutable catalog shared by the shim's `/v1/models` and the adapter. */
declare class CodeArtsCatalog {
  /** 空目录起步：没发现过就是没有模型，不拿历史名单冒充。 */
  private models;
  private normalized;
  /** 上次归一化时图片黑名单的大小 —— 黑名单是运行时长的，变了就得重算。 */
  private normalizedWithBlocked;
  /** 上次归一化时的转述开关状态。 */
  private normalizedBridge;
  current(): readonly CodeArtsModelInfo[];
  set(models: readonly CodeArtsModelInfo[]): void;
  /**
   * 上游清单爱把纯文本模型标成 `supports_images: true`（GLM-5.2、-1017 实测都这样），
   * 被它骗过一次的模型在这里一律摘掉图片能力；开了图片转述则改挂 `imageBridge`，
   * 让宿主允许贴图，由请求层负责转述。
   */
  private normalize;
}
/**
 * Narrow a catalog to the user's enabled selection (allowlist of model ids).
 * Same semantics as the codebuddy plugin: absent or empty => serve all.
 */
declare function filterEnabledModels(models: readonly CodeArtsModelInfo[], enabled: readonly string[] | undefined): readonly CodeArtsModelInfo[];
/** 清空福利缺失记录 —— 手动刷新模型列表时调，给用户一个自救出口。 */
declare function clearBenefitBlocked(): void;
/** 该模型是否不收图（人工确认或运行时被拒过）。 */
declare function isImageBlocked(id: string): boolean;
/** 记一次「这个模型不收图」。 */
declare function markImageBlocked(id: string): void;
/** 运行时被拒过图片的模型（排序副本，供诊断输出；不含人工名单）。 */
declare function imageBlockedModels(): readonly string[];
/** 清空图片能力黑名单 —— 与福利标记一起，由手动刷新模型列表重置。 */
declare function clearImageBlocked(): void;
//#endregion
//#region src/dpop.d.ts
/**
 * DPoP（RFC 9449）证明 JWT：ES256 + P-256，供 oauth2/tokens 请求头使用。
 * 翻译自 codearts2api 的 internal/upstream/dpop.go。
 *
 * 关键约束：refresh_token 与首次换取时的 DPoP 公钥绑定，刷新时必须复用同一
 * 私钥，否则 STS 报 InvalidDPoPHeader。因此该私钥必须随 refresh_token 一起落盘。
 *
 * @module dsh-codearts-connect/dpop
 */
/** 可持久化的 P-256 DPoP 私钥（JWK 形式，含 d）。 */
type DPoPPrivateJWK = {
  kty: string;
  crv: string;
  x: string;
  y: string;
  d: string;
};
//#endregion
//#region src/oauth.d.ts
interface OAuthToken {
  userId: string;
  userName: string;
  domainId: string;
  securityToken: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiration: string;
  refreshToken: string;
  clientId: string;
  dpopPrivateKey: DPoPPrivateJWK;
}
//#endregion
//#region src/upstream.d.ts
declare const SNAP_HOST = "https://snap-access.cn-north-4.myhuaweicloud.com";
type UpstreamErrorKind = 'hard_credit' | 'soft_rate' | 'session_dead' | 'not_found' | 'server' | 'client';
interface ChatResultOk {
  ok: true;
  /** 已转成 OpenAI 增量 SSE 的 ReadableStream（文本，data: ...\n\n）。 */
  stream: ReadableStream<Uint8Array>;
}
interface ChatResultErr {
  ok: false;
  kind: UpstreamErrorKind;
  status: number;
  message: string;
}
type ChatResult = ChatResultOk | ChatResultErr;
/** 给 shim 用的凭证（来自 credentialStore.resolve）。 */
interface CodeArtsResolved {
  token: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  securityToken: string;
}
declare function canonicalModel(id: string): string;
/** 该模型可用的 max_tokens 上限（实测值与会话内学到的更低值取小）。 */
declare function maxTokensCeilingFor(id: string): number;
interface PreparedChatBody {
  url: string;
  body: string;
  model: string;
  chatId: string;
  /**
   * 不用发出去就能判定的失败（目前是「上下文放不下」）。非空时调用方必须直接把它
   * 回给 DSH —— 上游遇到同类问题只会给一句 "The request param is invalid"，
   * 那句话里没有模型、没有 token 数，用户无从下手。
   */
  error?: string;
}
/**
 * 把 OpenAI 风格 chat body 适配给 CodeArts /api/v2/chat/completions。
 * 该端点虽是 OpenAI 兼容，但网关按自己的 schema 严格校验参数。所以这里
 * 不做原样透传，而是：
 *  1. model 走 canonicalModel（大小写敏感）
 *  2. max_completion_tokens → max_tokens（华为只认后者），并钳到该模型的上限；
 *     再按 contextWindow 扣掉 prompt 估算，保证 prompt + max_tokens 装得下
 *     （两者任一超限，上游都只会流内回 InferHub.001001005.400
 *     "The request param is invalid, Please check it"，不告诉我们是哪一个）
 *  3. 丢弃非白名单字段（stream_options / store / logprobs 等虽实测可容忍，
 *     但按 codearts2api 观察到的真实流量收窄，避免网关后续收紧）；
 *     例外是 `reasoning_effort`（DSH 的思考档位）：官方内核同样以这个顶层字段
 *     透传 variant，见 kernel 的 `inferhub getArgs`。
 *  4. tools[].function 去掉 strict（OpenAI 专有）
 *  5. 注入 CodeArts 特有字段：chat_id（按对话派生，见 conversationChatId）、
 *     prompt_cache_key、tool_stream
 *
 * @param contextWindow 该模型的上下文窗口（来自 catalog）。传 0 表示不知道，
 *   此时只做上限钳制、不做「装不下」判断。
 */
declare function prepareChatBody(rawJson: string, contextWindow?: number): PreparedChatBody;
/**
 * 把上游累计快照 SSE 转换成 OpenAI 增量流。
 *
 * 上游行为（reverse-engineering.md §5）：
 *  - {"type":"answer", ...} 起始
 *  - {"text": "<累计全文>"} 全文快照（用替换语义）
 *  - {"delta":{"content":"..."}} 真增量
 *  - {"text":"[DONE]","error_code":"0"} 结束；error_code != 0 为错误
 */
declare function chatStream(credential: CodeArtsResolved, prepared: {
  url: string;
  body: string;
  model: string;
  chatId?: string;
}, signal?: AbortSignal): Promise<ChatResult>;
/** 登录身份（上游对同一账号恒定，可用来当账号的自然键）。 */
interface CallerIdentity {
  userId: string;
  userName: string;
  domainId: string;
}
/**
 * 模型清单的来源。前三路是目录本身（任一路失败都不阻断，只有三路全失败才算失败），
 * `thinking` 只是目录之上的可选增强：它失败时模型照常可用，只是没有思考档位选择器。
 */
type ModelSource = 'builtin' | 'benefit' | 'agent' | 'thinking';
interface ModelDiscoveryResult {
  /** 合并后的清单（已去重、已排序）。 */
  models: readonly CodeArtsModelInfo[];
  /** 本轮成功应答的来源。 */
  sources: readonly ModelSource[];
  /** 失败来源及原因（不阻断，供 doctor/日志展示）。 */
  errors: readonly {
    source: ModelSource;
    message: string;
  }[];
}
/** 一条请求在上游队列里的位置。 */
interface CodeArtsQueueStatus {
  status: string;
  queueLength: number;
  queuePosition: number;
  message: string;
}
/**
 * 动态发现当前账号可用的模型清单（三路合并）。
 *
 * 与 codearts2api 的 `Client.FetchModels` 等价：内置、限时福利、agent-center 三路
 * 各自独立，任一路失败只记进 `errors` 不阻断 —— 福利网关抖动时仍能拿到内置模型。
 *
 * 上标的两个「实测 vs 标称」处理（很重要，别照搬标称值）：
 *  - **maxTokens 钳到该模型的实测上限**（`MEASURED_MAX_TOKENS`）。上游
 *    `gateway/config` 给福利模型标的是 393216 / 384000，而聊天端点实测超过 65536
 *    就流内报 InferHub.001001005.400；DSH 会把 catalog 的 maxTokens 原样当
 *    max_tokens 发出去，照抄标称值等于让每个请求都失败。
 *  - contextWindow 用发现值（只影响 DSH 的上下文计量与截断余量，不影响路由）。
 *
 * @throws 三路全失败，或合并结果为空。
 */
declare function fetchModels(credential: CodeArtsResolved, signal?: AbortSignal): Promise<ModelDiscoveryResult>;
//#endregion
//#region src/auth.d.ts
/** 持久化的完整凭证。 */
interface CodeArtsCredential {
  token: string;
  /** 临时 AK/SK（HMAC 签名用）。手动粘贴场景可能为空。 */
  accessKeyId?: string;
  secretAccessKey?: string;
  /** refresh_token（续期用）。 */
  refreshToken?: string;
  /** 续期绑定的 DPoP 私钥（JWK）。 */
  dpopPrivateKey?: OAuthToken['dpopPrivateKey'];
  /** OAuth client_id（刷新需与登录时一致）。 */
  clientId?: string;
  /** STS 过期时间（ISO）。 */
  expiration?: string;
  /** 用户标识。 */
  userId?: string;
  userName?: string;
  /** 华为云账号的 domain（`/snap-manager/v1/current/user` 会返回）。 */
  domainId?: string;
  /** 可选标注。 */
  label?: string;
  /** 存盘时间（epoch ms）。 */
  storedAt?: number;
  /** 续期已尝试且失败（多半已过期），需用户重新登录。 */
  stale?: boolean;
}
declare function codeartsAuthPath(home?: string): string;
interface ResolvedCredential {
  token: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  securityToken: string;
}
declare class CodeArtsCredentialStore {
  private _current;
  private _path;
  /** 正在进行的刷新。并发请求必须共用它，不能各刷一次。 */
  private _inflight;
  /**
   * 凭证代际。重登/清除会推进它，让还在飞的刷新发现自己过期，
   * 从而不把刷新结果写回去覆盖掉刚拿到的新凭证。
   */
  private _gen;
  /** 作废在飞的刷新；任何直接写凭证的路径都要先调它。 */
  private invalidateInflight;
  constructor(path: string);
  setPath(path: string): void;
  /** 给 shim 用：返回签名所需全套。 */
  resolve(): Promise<ResolvedCredential | undefined>;
  current(): Promise<CodeArtsCredential | undefined>;
  /** 从 OAuth 登录结果落库。 */
  setFromOAuth(t: OAuthToken, label?: string): Promise<void>;
  /** 领取限时福利（幂等）；无 AK/SK 时静默跳过。 */
  private claimIfPossible;
  /** 手动粘贴 security_token（降级态，无 AK/SK）。 */
  set(token: string, label?: string): Promise<void>;
  clear(): Promise<void>;
  hasCredential(): Promise<boolean>;
  /**
   * 自动续期：若距过期不足 5 分钟且具备 refresh 条件，则刷新并落库。
   * 返回当前（可能已刷新）凭证。
   */
  ensureFresh(): Promise<CodeArtsCredential | undefined>;
  /** 真正去刷一次；失败则把凭证标成 stale 落库，让卡片提示重新登录。 */
  private refresh;
}
interface CodeArtsAccountSummary {
  id: string;
  label?: string;
  userName?: string;
  expiration?: string;
  storedAt?: number;
  /** 上次续期失败，需要重新登录。 */
  stale: boolean;
  /** 带 AK/SK，能产生签名（只有 security_token 的降级凭证不能）。 */
  signable: boolean;
}
declare function codeartsAccountsPath(home?: string): string;
/** 多账号凭证存储：一个账号一份槽位，共用一个文档文件。 */
declare class CodeArtsAccountStore {
  private _doc;
  private _slots;
  private _loading;
  /** 落库串行化：多个账号的续期可能同时想写同一个文档。 */
  private _writeChain;
  private readonly path;
  /** 旧版单凭证文件；新文档不存在时把它收编成第一个账号。 */
  private readonly legacyPath;
  constructor(path: string, legacyPath?: string);
  private loaded;
  private load;
  private adopt;
  private persisterFor;
  private persistDoc;
  /** 按展示顺序返回账号摘要。 */
  list(): Promise<CodeArtsAccountSummary[]>;
  ids(): Promise<string[]>;
  credential(id: string): Promise<CodeArtsCredential | undefined>;
  /** 首个账号——卡片顶部与 CLI 的「当前」。 */
  current(): Promise<CodeArtsCredential | undefined>;
  hasCredential(): Promise<boolean>;
  /** 新增或更新一个账号，返回它的 id。 */
  upsert(cred: CodeArtsCredential, id?: string): Promise<string>;
  /**
   * 从一次 OAuth 登录结果新增/更新账号。
   *
   * 「再登录一次」天然就是「添加账号」：同一账号是更新，别的账号就是新增。
   *
   * 传了 `identity`（来自 `fetchCallerIdentity` 的稳定 user_id）就用它当账号键 ——
   * 这正是「对同一个账号重新登录会被当成新账号」的解药；拿不到身份时退回旧行为
   * （DPoP 公钥当键），也就是每次登录各自成一条。
   */
  upsertFromOAuth(t: OAuthToken, label?: string, identity?: CallerIdentity): Promise<string>;
  /**
   * 把一条已有账号迁移到它的稳定身份键上（同键则合并）。
   *
   * 用在两处：登录后回填身份（老条目已经存在时合并掉），以及 `dsh-codearts-connect identity --fix`
   * 清理历史遗留的重复条目。合并时保留 `storedAt` 较新的一份凭证，位置沿用目标键原有的顺序。
   *
   * @returns 迁移结果：`merged` 表示并入了已存在的那条，`moved` 表示只换了键，`noop` 表示键没变
   */
  adoptIdentity(id: string, identity: CallerIdentity): Promise<'merged' | 'moved' | 'noop'>;
  /** 手工粘贴 security_token（降级态，无 AK/SK）——固定覆盖同一个「手工」账号。 */
  set(token: string, label?: string): Promise<void>;
  remove(id: string): Promise<void>;
  /** 清空全部账号（整体登出）。 */
  clear(): Promise<void>;
  /** 给 shim 用：解析某账号的签名材料（内部含续期）。 */
  resolve(id: string): Promise<ResolvedCredential | undefined>;
}
//#endregion
//#region src/account-pool.d.ts
interface AccountRuntime {
  id: string;
  /** 我们这边正在飞的请求数。 */
  activeConcurrent: number;
  maxConcurrent: number;
  /** 冷却截止时间（epoch ms）；0 表示没在冷却。 */
  coolUntil: number;
  /** 撞上游并发上限后的「优先避开」截止时间。 */
  cappedUntil: number;
  disabled: boolean;
  lastError?: string;
  /** 上次被选中的时间，用于「最久未用优先」。 */
  lastUsed: number;
  errorCount: number;
}
interface PoolOptions {
  maxConcurrent?: number;
  /** 可注入的时钟，便于测试。 */
  now?: () => number;
}
declare class CodeArtsAccountPool {
  private readonly accounts;
  private maxConcurrent;
  private readonly now;
  constructor(ids: readonly string[], options?: PoolOptions);
  /** 设置改动后同步每账号的本地并发上限（已在跑的请求不会被踢掉）。 */
  setMaxConcurrent(value: number): void;
  /** 让池与账号文档对齐：新增的进来，删掉的出去。已有账号的运行时状态保留。 */
  sync(ids: readonly string[]): void;
  list(): AccountRuntime[];
  get(id: string): AccountRuntime | undefined;
  /** 账号本身可用（没被禁用、不在冷却中）。 */
  healthy(id: string): boolean;
  /** 现在就能接活的账号（健康 + 本地还有空槽位），按「最久未用」排序。 */
  private available;
  /**
   * 选一个账号。
   *
   * 给了 `preferred` 且它现在能接活，就直接选它 —— 这是设置卡片里「使用此账号」
   * 的手动指定。指定账号不健康、在冷却或本地槽位已满时不硬塞，退回正常的
   * 「最久未用」轮转：指定的意义是不再盲目换号，不是让请求直接失败。
   *
   * 没给指定时，优先挑没人撞上限的（`cappedUntil` 已过的）；如果全都撞了，就退回
   * 其中任意一个 —— 排它的队总比直接失败强。都没得选（全禁用/全在冷却）时返回
   * undefined。
   */
  pick(exclude?: ReadonlySet<string>, preferred?: string): string | undefined;
  /**
   * 只选指定的那一个账号，不做任何轮转回退。
   *
   * 手动指定账号后的固定模式用它：账号被禁用、在冷却或本地槽位满时返回
   * undefined，由调用方给出「指定账号忙」的明确错误，绝不偷偷换号去扣另一个号。
   */
  pickOnly(id: string): string | undefined;
  /** 占一个本地槽位。占用失败（已满/不存在）返回 false。 */
  acquire(id: string): boolean;
  /** 释放槽位；重复释放不会把计数压到负数。 */
  release(id: string): void;
  /**
   * 撞到上游并发上限。
   *
   * **不冷却账号** —— 账号没坏，只是会话槽位暂时满了（约 52 秒释放）。冷却会
   * 让它在一分钟内彻底不可用，反而把后续请求也一起误伤（Go 参考里也是这么
   * 处理的）。这里只记一个「优先避开」的提示，好让并发的请求先去用别的账号。
   */
  noteConcurrencyCap(id: string): void;
  /** 凭据失效等硬错误：直接停用，等用户重新登录。 */
  disable(id: string, reason: string): void;
  /**
   * 用户重新登录（凭据已换新）后调用：把账号从禁用/冷却里捞出来。
   *
   * `sync()` 只对齐成员、特意保留运行时状态（account-pool 不读凭据文档），所以
   * 「同一账号重新登录」不会自动清掉 disabled —— 以前只能靠重启（见 issue #1）。
   * 登录成功的语义就是「这个号现在该能用了」，由登录路径显式调这里复位。
   */
  revive(id: string): void;
  /** 上游 5xx / 软限流：短时冷却。 */
  cooldown(id: string, ms: number, reason: string): void;
  /** 累计错误；达到阈值就冷却。 */
  noteError(id: string, threshold: number, cooldownMs: number, reason: string): void;
  /** 一次成功：清掉错误计数与冷却。 */
  noteSuccess(id: string): void;
  /** 有没有任何账号可用（含被撞上限提示的）。 */
  hasUsable(): boolean;
}
//#endregion
//#region src/queue.d.ts
interface CodeArtsQueueEntry {
  /** chat_id，与上游 task_id 的尾段一致。 */
  id: string;
  model: string;
  position: number;
  length: number;
  status: string;
  message?: string;
  updatedAt: number;
}
type CodeArtsQueueOutcome =
/** 轮到了（或模型本来就不排队），可以发请求。 */
{
  kind: 'working';
} |
/** 等了 `maxWaitMs` 还在队里：把位置报给用户，让他稍后再发。 */
{
  kind: 'queued';
  position: number;
  length: number;
  message: string;
} |
/** 队列本身已满，上游让用户换模型/升级套餐。 */
{
  kind: 'queue_full';
  message: string;
} |
/** 排队接口连续失败，放弃排队并报出原因。 */
{
  kind: 'error';
  message: string;
} |
/** 用户取消或插件退出。 */
{
  kind: 'aborted';
};
interface CodeArtsQueueGateOptions {
  /** 两次查询之间的间隔（官方客户端是 5 秒）。 */
  intervalMs?: number;
  /** 最多替用户等多久。超过就回 `queued`，别把请求挂着。 */
  maxWaitMs?: number;
  /** 连续失败几次就放弃。 */
  maxErrors?: number;
  /** 注入查询函数（测试用）。 */
  fetchStatus?: (credential: CodeArtsResolved, chatId: string, model: string, signal: AbortSignal) => Promise<CodeArtsQueueStatus>;
  /** 注入清号函数（测试用）。 */
  clearStatus?: (credential: CodeArtsResolved, chatId: string, model: string) => Promise<void>;
  now?: () => number;
}
declare class CodeArtsQueueGate {
  private readonly entries;
  private readonly controllers;
  private readonly intervalMs;
  private readonly maxWaitMs;
  private readonly maxErrors;
  private readonly query;
  private readonly clear;
  private readonly now;
  constructor(options?: CodeArtsQueueGateOptions);
  /**
   * 占号并**最多等 `maxWaitMs`** 轮到。调用方拿到 `working` 后才发 chat 请求；
   * 其余结果（含 `queued`）都不要再发 —— `queued` 是要把位置原样告诉用户。
   */
  wait(credential: CodeArtsResolved, chatId: string, model: string, signal?: AbortSignal): Promise<CodeArtsQueueOutcome>;
  /** 正在排队的条目（给底部条）。 */
  snapshot(): readonly CodeArtsQueueEntry[];
  dispose(): void;
  private pause;
}
//#endregion
//#region src/usage.d.ts
/**
 * 用量账本：把聊天流里的 usage 帧累计成「今天用了多少」。
 *
 * 为什么还要自己记：账号总额度有积分接口了（见 credits.ts，2026-10 从官方 Agent
 * 客户端挖出并实测通过），但**本机经插件发出的请求**仍需自己累计 —— 上游不按
 * 「这台机器」维度给统计。能拿到的真实数据有三样：
 *   1. 每个请求的 token `usage`（上游在流末尾回一帧 `{choices:[],usage:{...}}`）；
 *   2. 插件自己知道的账号会话槽位占用（见 account-pool：每账号 3 个并发会话）；
 *   3. 账号积分/额度（见 credits.ts）。
 *
 * 所以这里累计的是**本机经插件发出的请求**，与卡片上的积分区块互补 —— 一个是本机
 * 级、一个是账号级。官方额度明细在 `codearts.huaweicloud.com/portal/settings/personal-usage`。
 *
 * 落盘在 `$DSH_HOME/.codearts-usage.json`，按天存，保留最近 `RETENTION_DAYS` 天。
 *
 * @module dsh-codearts-connect/usage
 */
/** 用量账本路径：与账号文档同一层（`$DSH_HOME` 或 `~/.dsh`）。 */
declare function codeartsUsagePath(home?: string): string;
/** 累计计数。 */
interface UsageTotals {
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
/** 上游 usage 帧里我们关心的字段。 */
interface RawUsage {
  prompt_tokens?: unknown;
  completion_tokens?: unknown;
  total_tokens?: unknown;
}
interface UsageSnapshot {
  /** 今天的合计。 */
  today: UsageTotals;
  /** 账本里所有保留天数的合计。 */
  allTime: UsageTotals;
  /** 最近 30 天（含今天）的合计。 */
  last30: UsageTotals;
  /** 今天按模型的合计，按 totalTokens 降序。 */
  byModelToday: {
    id: string;
    totals: UsageTotals;
  }[];
  /** 今天按账号的合计。 */
  byAccountToday: Record<string, UsageTotals>;
  /** 账本覆盖的天数（便于「数据从哪天开始」的说明）。 */
  days: number;
  /** 最近一次记账时间（epoch ms）。 */
  lastAt?: number;
}
interface UsageTrackerOptions {
  /** 账本文件路径；省略则只记在内存里（测试用）。 */
  path?: string;
  /** 可注入的时钟。 */
  now?: () => number;
  /** 落盘防抖毫秒数（流式请求里每帧都写盘太浪费）。 */
  saveDebounceMs?: number;
}
/**
 * 用量账本。
 *
 * 记账分两步，因为一次请求可能只有其一：
 *  - `noteRequest()` 在请求发出时调用（拿不到 usage 的流也要计入请求数）；
 *  - `noteUsage()` 在收到 usage 帧时调用（补 token 数）。
 */
declare class CodeArtsUsageTracker {
  private days;
  private lastAt;
  private loaded;
  private loading;
  private saveTimer;
  private saving;
  private readonly path;
  private readonly now;
  private readonly saveDebounceMs;
  constructor(options?: UsageTrackerOptions);
  /** 读账本（懒加载，只读一次）。 */
  load(): Promise<void>;
  private readFile;
  private day;
  private bucket;
  /** 记一次请求（不等到 usage 帧）。 */
  noteRequest(accountId: string, model: string, at?: number): void;
  /** 记一次 usage 帧。 */
  noteUsage(accountId: string, model: string, raw: RawUsage | undefined, at?: number): void;
  /** 丢弃保留期之外的天（按日期键比较即可，YYYY-MM-DD 是字典序）。 */
  private prune;
  /** 当前快照（卡片与 CLI 都读它）。 */
  snapshot(at?: number): UsageSnapshot;
  private scheduleSave;
  /** 立即落盘（关停时调用，别丢最后几秒的账）。 */
  flush(): Promise<void>;
  private save;
}
//#endregion
//#region src/shim.d.ts
interface ShimLogger {
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
interface CodeArtsShim {
  ready: Promise<void>;
  baseUrl(): string;
  token(): string;
  close(): Promise<void>;
}
/** 最近一次成功请求实际用的账号；卡片/弹层据此解释「为什么扣了另一个号」。 */
interface CodeArtsAccountUse {
  accountId: string;
  model: string;
  at: number;
  /** 这次是否偏离了指定/会话粘住的账号。 */
  fallback: boolean;
  /** 回退原因（上游错误或本地槽位满）；没有回退时省略。 */
  reason?: string;
}
interface CodeArtsShimOptions {
  store: CodeArtsAccountStore;
  catalog: CodeArtsCatalog;
  /** 账号池。不传则内部自建一个，并在每次请求前与账号文档对齐。 */
  pool?: CodeArtsAccountPool;
  /** 用量账本。给了就在转发流的同时把 usage 帧记下来（卡片上的「今日用量」）。 */
  usage?: CodeArtsUsageTracker;
  /**
   * 上游排队闸门。给了就在发请求前占号、轮询到轮到再开流
   * （底部积分条旁边展示「排队第 N 位」）。
   */
  queue?: CodeArtsQueueGate;
  /**
   * 用户在设置卡片里手动指定的账号 id（空 = 自动轮转）。
   *
   * 指定后默认是**固定账号**：账号忙/冷却/本地槽位满时直接报错，不换号。
   * 只有 `allowAccountFallback()` 返回 true 时才按池的规则回退。
   */
  preferredAccount?: () => string | undefined;
  /** 指定账号不可用时是否允许自动换号。默认 false（固定）。 */
  allowAccountFallback?: () => boolean;
  /** 每次成功开流后回报实际账号，供状态弹层显示「上次实际使用」。 */
  onAccountUsed?: (info: CodeArtsAccountUse) => void;
  /** 图片转述用的视觉模型 id；缺省 Qwen3-VL-235B。 */
  imageBridgeModel?: () => string;
  logger?: ShimLogger;
}
declare function createCodeArtsShim(options: CodeArtsShimOptions): CodeArtsShim;
//#endregion
//#region src/adapter.d.ts
/** Provider route this bundle owns. Keep in sync with cordis.patch.yml. */
declare const CODEARTS_PROVIDER = "codearts";
interface CodeArtsAdapterOptions {
  shim: CodeArtsShim;
  catalog: CodeArtsCatalog;
  enabledModels?: () => readonly string[] | undefined;
  resolveAttachments?: () => AttachmentStore | undefined;
}
interface CodeArtsAdapter {
  adapter: PiAiAdapter;
  invalidate: () => void;
}
declare function createCodeArtsAdapter(options: CodeArtsAdapterOptions): CodeArtsAdapter;
//#endregion
//#region src/credits.d.ts
/** 福利网关：token 余额接口在这里（与 benefit/claim、gateway/config 同一个 host）。 */
declare const BENEFIT_GATEWAY_HOST = "https://opengw.developer.huaweicloud.com";
/** 一类积分（总量/已用/剩余/即将过期）。上游给不出的字段留 undefined。 */
interface CodeArtsCreditCategory {
  total: number;
  used: number;
  remain: number;
  /** 会在本周期结束时作废的部分。 */
  expiring: number;
}
/** 积分快照（来自 statistics/plugin）。 */
interface CodeArtsCredits {
  /** 套餐显示名，例如「体验版」。 */
  planName: string;
  /** 套餐英文名（中文缺失时的兜底）。 */
  planNameEn: string;
  /** 上游给的 spec_code，例如 codearts.agent.individual.trial。 */
  specCode: string;
  /** normal → active、closed → expired、freeze → frozen。 */
  planStatus: 'active' | 'expired' | 'frozen' | 'unknown';
  /** 是否按积分计费（false 表示 token 套餐）。 */
  isCreditPackage: boolean;
  /** 变更/购买套餐的官方页面。 */
  packageUrl?: string;
  /** 额度周期起止（end 就是「限额重置日期」）。 */
  periodStart?: string;
  periodEnd?: string;
  /** 总积分（usageTotalPackageCredit）。 */
  total: CodeArtsCreditCategory;
  /** 赠送积分（usageBonusPackageCredit）。 */
  bonus?: CodeArtsCreditCategory;
  /** 基础套餐积分（usageBasicPackageCredit）。 */
  basic?: CodeArtsCreditCategory;
  /** 按需积分（usageOnDemandPackageCredit）。 */
  onDemand?: CodeArtsCreditCategory;
  /** 抓取时刻（毫秒）。 */
  fetchedAt: number;
}
/** token 额度快照（来自 tokens/balance）。 */
interface CodeArtsTokenQuota {
  dailyLimit: number;
  dailyUsed: number;
  monthlyLimit: number;
  monthlyUsed: number;
  /** 剩余额度。 */
  balance: number;
  /** 总额度。 */
  quota: number;
}
/** 每日签到活动当前状态（来自福利中心 `/v1/ops/delivery`）。 */
interface CodeArtsDailyWelfare {
  /** 上游说这条活动现在点得动吗。 */
  claimable: boolean;
  /**
   * 「今天已经领过了」。单独判出来给卡片改按钮文案用 —— 不可领的原因有好几种
   * （已领 / 要先去官网登录 / 账号没资格），只有这一种该把按钮变成「今日已领」。
   */
  claimedToday: boolean;
  /** 领一次给多少积分。 */
  amount: number;
}
interface CodeArtsCreditSnapshot {
  credits: CodeArtsCredits;
  /** 拿不到（接口失败/不支持）时为 undefined，不影响积分本身。 */
  tokens?: CodeArtsTokenQuota;
  /** 没有这个活动（或账号是 token 套餐）时为 undefined。 */
  welfare?: CodeArtsDailyWelfare;
}
/** 缓存里的一个结果：成功给值，失败给消息 —— 失败也要能被卡片看见。 */
type CodeArtsCreditState = {
  phase: 'ok';
  value: CodeArtsCreditSnapshot;
  at: number;
} | {
  phase: 'error';
  message: string;
  at: number;
};
/**
 * 解析 `GET /snap-manager/v1/statistics/plugin` 的响应。
 *
 * 返回 undefined 表示这不是一份能用的积分文档（上游改了形状/账号没有积分体系）——
 * 调用方据此报「积分不可用」，而不是显示一排 0 假装是真的。
 */
declare function parseCreditStatistics(raw: unknown): CodeArtsCredits | undefined;
/** 解析 `GET /api/v1/user/tokens/balance` 的响应（`result` 里是额度口径）。 */
declare function parseTokenBalance(raw: unknown): CodeArtsTokenQuota | undefined;
/**
 * 拉一次积分与 token 额度。
 *
 * 积分是主口径：它失败就整体失败（卡片要能看见原因）。token 额度是附带的，
 * 它失败只让 `tokens` 缺席 —— 别让一个次要接口把主数字一起拖没。
 */
declare function fetchCredits(credential: CodeArtsResolved, signal?: AbortSignal): Promise<CodeArtsCreditSnapshot>;
interface CreditCacheOptions {
  ttlMs?: number;
  failureTtlMs?: number;
  /** 便于测试注入。 */
  load?: (credential: CodeArtsResolved, signal?: AbortSignal) => Promise<CodeArtsCreditSnapshot>;
  now?: () => number;
}
/**
 * 积分缓存（TTL + 单飞）。
 *
 * 单飞很重要：卡片刷新、对话底部的轮询可能同时打进来，没有它就会并发问上游好几次；
 * 而上游对同一账号的并发是有成本/风险的。
 */
declare class CodeArtsCreditCache {
  /** 按账号分槽：多账号下每个号有自己的余额，不能共用一个快照。 */
  private readonly states;
  private readonly inflights;
  private readonly ttlMs;
  private readonly failureTtlMs;
  private readonly load;
  private readonly now;
  constructor(options?: CreditCacheOptions);
  /** 某账号的缓存内容（不触发请求），供只想读快照的场景使用。 */
  peek(accountId: string): CodeArtsCreditState | undefined;
  /** 丢掉缓存，下次 get 会重新拉（重新登录/添加账号后调用）。省略账号则清空全部。 */
  invalidate(accountId?: string): void;
  /**
   * 取一次某账号的积分。命中缓存直接返回；否则合并成一次上游请求。
   * **不抛异常**：失败以 `phase: 'error'` 返回，调用方（状态路由）照样能渲染。
   */
  get(accountId: string, credential: CodeArtsResolved, signal?: AbortSignal): Promise<CodeArtsCreditState>;
  private run;
}
//#endregion
//#region src/discovery.d.ts
interface AccountDiscovery {
  accountId: string;
  label?: string;
  ok: boolean;
  models: readonly CodeArtsModelInfo[];
  sources: readonly ModelSource[];
  errors: readonly {
    source: ModelSource;
    message: string;
  }[];
}
interface DiscoveryOutcome {
  /** 合并所有账号后的目录（已去重、已排序、已钳制上限）。 */
  models: readonly CodeArtsModelInfo[];
  /** 逐账号的结果，含失败原因。 */
  accounts: readonly AccountDiscovery[];
  /** 至少一个账号成功。 */
  anySucceeded: boolean;
}
/**
 * 逐账号发现并合并（不改全局状态）。
 *
 * @param store 账号文档；逐个 `resolve()` 以拿到已续期的签名材料
 * @param signal 取消信号（宿主关停时用）
 */
declare function discoverModels(store: CodeArtsAccountStore, signal?: AbortSignal): Promise<DiscoveryOutcome>;
/**
 * 发现并**提交**到全局目录：目录内容 + 福利集合。
 *
 * @returns 提交后的目录；没有任何账号成功时返回 `undefined`（调用方保留原目录）
 */
declare function refreshCatalog(store: CodeArtsAccountStore, catalog: CodeArtsCatalog, signal?: AbortSignal): Promise<DiscoveryOutcome | undefined>;
//#endregion
//#region src/index.d.ts
/** Stable Cordis plugin name. */
declare const name = "llm-codearts";
/** The llm service is required before the provider can register. */
declare const inject: string[];
/** Settings namespace owning the configuration card. */
declare const CODEARTS_SETTINGS_NS: SettingsNamespace;
/** Plugin configuration. */
interface Config {
  /** Allowlist of CodeArts model ids offered in the model pickers. */
  enabledModels?: string[];
  /** 对话输入框下方那行「积分 N」是否显示。缺省 = 显示（老配置不改行为）。 */
  showCreditDock?: boolean;
  /** 等上游开流时那行「排队第 N 位」是否显示。缺省 = 显示。 */
  showQueueDock?: boolean;
  /**
   * 手动指定优先使用的账号 id。空/未设置 = 自动轮转。
   *
   * 指定后默认是**固定账号**：账号忙/冷却/不可用时不会偷偷换号去扣另一个号；
   * 要把「忙时允许换号」打开才会回退。自动轮转模式仍按会话粘性 + 回退。
   */
  preferredAccountId?: string;
  /**
   * 每账号本地并发上限。默认 3，与上游的 3 个流式会话对齐；
   * 设为 1 可以强制串行。设置改动会立即作用到账号池。
   */
  maxConcurrentPerAccount?: number;
  /**
   * 手动指定账号后，账号忙/冷却时是否允许自动换到其它账号。默认 false（固定）。
   * 自动轮转模式不受此开关影响。
   */
  allowAccountFallback?: boolean;
  /**
   * 图片转述：纯文本模型收到图片时，先用视觉模型转述成文字再发送。
   * 打开后这些模型会临时声明可收图（标记为 imageBridge），DSH 才允许贴图。
   */
  imageBridgeEnabled?: boolean;
  /** 图片转述使用的视觉模型，缺省 Qwen3-VL-235B。 */
  imageBridgeModel?: string;
}
declare const Config: z<Config>;
declare function apply(ctx: Context, rawConfig: Config): void;
//#endregion
export { type AccountRuntime, BENEFIT_GATEWAY_HOST, CODEARTS_PROVIDER, CODEARTS_SETTINGS_NS, CodeArtsAccountPool, CodeArtsAccountStore, type CodeArtsAccountSummary, type CodeArtsAdapter, CodeArtsCatalog, type CodeArtsCredential, CodeArtsCredentialStore, CodeArtsCreditCache, type CodeArtsCreditCategory, type CodeArtsCreditSnapshot, type CodeArtsCreditState, type CodeArtsCredits, type CodeArtsModelInfo, type CodeArtsShim, type CodeArtsTokenQuota, CodeArtsUsageTracker, Config, type DiscoveryOutcome, FALLBACK_CODEARTS_MODELS, type ModelDiscoveryResult, SNAP_HOST, type UpstreamErrorKind, type UsageSnapshot, type UsageTotals, apply, canonicalModel, chatStream, clearBenefitBlocked, clearImageBlocked, codeartsAccountsPath, codeartsAuthPath, codeartsUsagePath, createCodeArtsAdapter, createCodeArtsShim, discoverModels, fetchCredits, fetchModels, filterEnabledModels, imageBlockedModels, inject, isImageBlocked, markImageBlocked, maxTokensCeilingFor, name, parseCreditStatistics, parseTokenBalance, prepareChatBody, refreshCatalog };