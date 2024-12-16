import { flow } from "fp-ts/lib/function";
import { getEnv } from "@ficlib/shared/lib/env";
import { parseWith } from "@ficlib/shared/lib/validation";
import { baseServiceNodeConfigSchema } from "@ficlib/shared/lib/config";
import { either } from "fp-ts";

const configSchema = baseServiceNodeConfigSchema;
const parseConfig = parseWith(configSchema);

const resolveConfigFromEnv = (env: Record<string, any>) => ({
    nats: {
        serverUrl: env.NATS_SERVER_URL,
        authToken: env.NATS_AUTH_TOKEN,
    },
});

export const makeConfigFromEnv = flow(
    getEnv,
    either.map(resolveConfigFromEnv),
    either.chainW(parseConfig),
);
