import {
    connect,
    NatsConnection as InternalConnection,
    ServerInfo,
} from "@nats-io/transport-node";
import {
    BrokerConnection,
    BrokerConnectionError,
    BrokerDisconnectionError,
    BrokerPublishError,
    BrokerPublishOpts,
    BrokerSubscribeError,
    BrokerSubscribeOpts,
    BrokerSubscriptionCallback,
} from "../connection";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as IOE from "fp-ts/lib/IOEither";
import * as E from "fp-ts/lib/Either";

const createConnectionError = (
    server: string,
    cause?: any,
): BrokerConnectionError => ({
    type: "BrokerConnectionError",
    message: `Failed to connect to NATS server ${server}`,
    cause,
});

const createDisconnectionError = (cause?: any): BrokerDisconnectionError => ({
    type: "BrokerDisconnectionError",
    message: "Disconnection from the NATS server was fatal",
    cause,
});

const createPublishError = (
    opts: BrokerPublishOpts,
    cause?: any,
): BrokerPublishError => ({
    type: "BrokerPublishError",
    message: `Failed to publish a message to the subject ${opts.subject}`,
    details: opts,
    cause,
});

const createSubscribeError = (
    subject: string,
    cause?: any,
): BrokerSubscribeError => ({
    type: "BrokerSubscribeError",
    message: `Failed to subscribe to subject "${subject}"`,
    details: { subject },
    cause,
});

export interface NatsConnectionOpts {
    serverUrl: string;
    authToken: string;
}

export const toInternalConnectionOpts = (opts: NatsConnectionOpts) => ({
    servers: opts.serverUrl,
    authenticator: () => ({
        auth_token: opts.authToken,
    }),
});

export const makeNatsConnection = (opts: NatsConnectionOpts) =>
    pipe(
        TE.tryCatch(
            () => connect(toInternalConnectionOpts(opts)),
            (e) => createConnectionError(opts.serverUrl, e),
        ),
        TE.map((c) => new NatsConnection(c)),
    );

const toInternalSubscriptionCallback =
    (callback: BrokerSubscriptionCallback) => (err: Error | null, msg: any) =>
        callback(err ? E.left(err) : E.right(msg));

export class NatsConnection implements BrokerConnection {
    public info?: ServerInfo;

    constructor(public connection: InternalConnection) {
        this.info = connection.info;
    }

    close = () =>
        pipe(
            TE.tryCatch(
                () => this.connection.close(),
                createDisconnectionError,
            ),
            TE.map(() => new NatsConnection(this.connection)),
        );

    subscribe = (opts: BrokerSubscribeOpts) =>
        pipe(
            IOE.tryCatch(
                () =>
                    this.connection.subscribe(opts.subject, {
                        callback: toInternalSubscriptionCallback(opts.callback),
                    }),
                (e) => createSubscribeError(opts.subject, e),
            ),
            IOE.map(() => new NatsConnection(this.connection)),
        );

    publish = (opts: BrokerPublishOpts) =>
        IOE.tryCatch(
            () => this.connection.publish(opts.subject, opts.payload),
            (e) => createPublishError(opts, e),
        );
}
