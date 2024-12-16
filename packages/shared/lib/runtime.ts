import { either } from "fp-ts";
import { Either } from "fp-ts/lib/Either";
import { flow } from "fp-ts/lib/function";

export type Runtime = "node" | "bun" | "browser";

type SpecificRuntimeIdPredicate = () => Either<null, Runtime>;

interface RuntimeDetectionError {
    type: "RuntimeDetectionError";
    message: string;
    details: {
        hasProcess: any;
        hasWindow: any;
    };
}

const isProcessExist = () => typeof process !== "undefined";
const isWindowExist = () => typeof window !== "undefined";
const isBunNamespaceExist = () => typeof Bun !== "undefined";

const isNode: SpecificRuntimeIdPredicate = () =>
    !isBunNamespaceExist() &&
    isProcessExist() &&
    process.versions &&
    process.versions.node
        ? either.right("node")
        : either.left(null);

const isBun: SpecificRuntimeIdPredicate = () =>
    isBunNamespaceExist() ? either.right("bun") : either.left(null);

const isBrowser: SpecificRuntimeIdPredicate = () =>
    isWindowExist() && window.document
        ? either.right("browser")
        : either.left(null);

const createRuntimeDetectionError = (): RuntimeDetectionError => ({
    type: "RuntimeDetectionError",
    message:
        "Failed to detect runtime. This script must be run either by Node, Bun or in the browser",
    details: {
        hasProcess: isProcessExist(),
        hasWindow: isWindowExist(),
    },
});

export const getRuntime = flow(
    isNode,
    either.alt(isBun),
    either.alt(isBrowser),
    either.altW(() => either.left(createRuntimeDetectionError())),
);
