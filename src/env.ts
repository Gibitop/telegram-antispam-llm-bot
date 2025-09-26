import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import config from "../env.yaml" with { type: "yaml" };

export const env = createEnv({
    runtimeEnv: config,
    emptyStringAsUndefined: true,

    server: {
        REACT_NON_SPAM: z.boolean().optional().default(false),
        OPEN_ROUTER_TOKEN: z.string().min(1),
        SYSTEM_PROMPT: z.string().min(1),
        MODEL: z.string().min(1),
        TELEGRAM_BOT_TOKEN: z.string().min(1),
        TELEGRAM_CHAT_IDS: z
            .string()
            .regex(/^$|(\d+,)*\d+$/)
            .optional()
            .transform((val) => val ? val.split(',').map(Number) : []),
    },
});
