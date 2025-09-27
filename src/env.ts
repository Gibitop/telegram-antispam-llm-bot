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
        LLM_ENDPOINT: z.string().min(1),
        LLM_API_KEY: z.string().min(1),
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
