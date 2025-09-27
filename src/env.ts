import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";


export const env = createEnv({
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,

    server: {
        REACT_NON_SPAM: z
            .string()
            .regex(/^(true|false)$/)
            .optional()
            .transform((val) => val === 'true'),
        DELETE_SPAM: z
            .string()
            .regex(/^(true|false)$/)
            .optional()
            .transform((val) => val === 'true'),
        OPEN_ROUTER_TOKEN: z.string().min(1),
        SYSTEM_PROMPT: z
            .string()
            .min(1)
            .transform(val => {
                const errorMessage = 'SYSTEM_PROMPT must be a JSON containing a string';
                try {
                    const parsed = JSON.parse(val);
                    if (typeof parsed !== 'string') {
                        throw new Error(errorMessage);
                    }
                    return parsed;
                } catch {
                    throw new Error(errorMessage);
                }
            }),
        MODEL: z.string().min(1),
        TELEGRAM_BOT_TOKEN: z.string().min(1),
        TELEGRAM_CHAT_IDS: z
            .string()
            .regex(/^$|(\d+,)*\d+$/)
            .optional()
            .transform((val) => val ? val.split(',').map(Number) : []),
    },
});
