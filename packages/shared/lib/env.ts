import { flow } from "fp-ts/lib/function";
import { getRuntime, Runtime } from "./runtime";
import { either } from "fp-ts";

const getNodeEnv = () => process.env;
const getBunEnv = () => Bun.env;
const getBrowserEnv = () => import.meta.env;

const getRuntimeEnv = (runtime: Runtime) =>
    ({
        node: getNodeEnv,
        bun: getBunEnv,
        browser: getBrowserEnv,
    })[runtime]();

export const getEnv = flow(getRuntime, either.map(getRuntimeEnv));

type DeploymentEnv = "dev" | "production" | "staging";

interface DeploymentEnvDetectionError {
    type: "DeploymentEnvDetectionError";
    message: string;
    details: {
        parsedValue?: any;
    };
}

const createDeploymentEnvDetectionError = (
    parsedValue?: string,
): DeploymentEnvDetectionError => ({
    type: "DeploymentEnvDetectionError",
    message:
        "Failed to detect deployment environment, " +
        `"${parsedValue}" is neither "dev", "production" or "staging"`,
    details: {
        parsedValue,
    },
});

const parseDeploymentEnvValue = (value?: string) =>
    value == "dev" || value == "production" || value == "staging"
        ? either.right(value as DeploymentEnv)
        : either.left(createDeploymentEnvDetectionError(value));

export const getDeploymentEnv = flow(
    getEnv,
    either.map((env) => env.NODE_ENV),
    either.chainW(parseDeploymentEnvValue),
);
