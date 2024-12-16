import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import { flow, pipe } from "fp-ts/lib/function";
import { makeConfigFromEnv } from "./config";
import { makeNatsConnection } from "@ficlib/shared/lib/broker/nats/connection";

const panic = (x: any) => {
    throw x;
};

const handler = flow(
    E.match(console.error, (msg: any) =>
        console.log("Received message:", new TextDecoder().decode(msg.data)),
    ),
);

const test = async () => {
    const config = pipe(
        makeConfigFromEnv,
        IOE.match(panic, (c) => {
            console.log("loaded config from env");
            return c;
        }),
    )();

    const natsConnection = await pipe(
        makeNatsConnection(config.nats),
        TE.match(panic, (c) => {
            console.log("connected to nats server");
            return c;
        }),
    )();

    pipe(
        natsConnection?.subscribe({
            subject: "example.subject",
            callback: handler,
        }),
        IOE.match(panic, () => console.log("subscribed to example.subject")),
    )();

    pipe(
        natsConnection.close(),
        TE.match(panic, () => console.log("disconnected from nats server")),
    )();
};

test();
