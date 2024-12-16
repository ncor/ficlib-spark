import { z } from "zod";

export const natsClientConfigSchema = z.object({
    serverUrl: z.string().url(),
    authToken: z.string(),
});

export const baseServiceNodeConfigSchema = z.object({
    nats: natsClientConfigSchema,
});
