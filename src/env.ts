import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

try {
    const config = await import('../env.yaml')
    if (config) {
        process.env = { ...process.env, ...config }
    }
} catch (error) { }

export const env = createEnv({
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,

    server: {
        REACT_NON_SPAM: z
            .string()
            .regex(/^(true|false)$/)
            .optional()
            .transform((val) => val === 'true'),
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
