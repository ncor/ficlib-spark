import { Either } from "fp-ts/lib/Either";
import { IOEither } from "fp-ts/lib/IOEither";
import { TaskEither } from "fp-ts/lib/TaskEither";

export type BrokerMessagePayload = Uint8Array | string;

export interface BrokerPublishOpts {
    subject: string;
    payload?: BrokerMessagePayload;
}

export interface BrokerSubscriptionCallback {
    (data: Either<Error, any>): any;
}

export interface BrokerSubscribeOpts {
    subject: string;
    callback: BrokerSubscriptionCallback;
}

export interface BrokerConnectionError {
    type: "BrokerConnectionError";
    message: string;
    cause?: any;
}

export interface BrokerDisconnectionError {
    type: "BrokerDisconnectionError";
    message: string;
    cause?: any;
}

export interface BrokerPublishError {
    type: "BrokerPublishError";
    message: string;
    details: BrokerPublishOpts;
    cause?: any;
}

export interface BrokerSubscribeError {
    type: "BrokerSubscribeError";
    message: string;
    details: {
        subject: string;
    };
    cause?: any;
}

export interface BrokerConnection {
    info?: any;
    close(): TaskEither<BrokerDisconnectionError, BrokerConnection>;
    subscribe(
        opts: BrokerSubscribeOpts,
    ): IOEither<BrokerSubscribeError, BrokerConnection>;
    publish(opts: BrokerPublishOpts): IOEither<BrokerPublishError, void>;
}
