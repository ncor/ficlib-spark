import { z, ZodError, ZodIssue } from "zod";
import * as E from "fp-ts/lib/Either";

export interface ValidationError {
    type: "ValidationError";
    message: string;
    details?: any;
    cause?: any;
}

export const createValidationError = (
    message: string,
    details?: any,
    cause?: any,
): ValidationError => ({
    type: "ValidationError",
    message,
    details,
    cause,
});

export const formatZodIssue = (i: ZodIssue) =>
    `"${i.message}" at ${i.path.join(".")}${i.fatal ? " (fatal)" : ""}`;

export const fromZodError = (e: ZodError) =>
    createValidationError(
        `Value is incompatible with zod schema: ${e.issues.map(formatZodIssue).join(", ")}`,
        e.issues,
        e,
    );

export type ValueParser<S> = (value: any) => E.Either<ValidationError, S>;

export const parseWith =
    <S extends z.ZodTypeAny>(schema: S): ValueParser<z.infer<S>> =>
    (value: any) =>
        E.tryCatch(
            () => schema.parse(value) as z.infer<S>,
            (e) => fromZodError(e as ZodError),
        );
