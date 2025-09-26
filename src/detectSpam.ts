import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { env } from './env';


const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: env.OPEN_ROUTER_TOKEN,
});

export async function detectSpam(messageText: string) {
    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: env.SYSTEM_PROMPT },
        { role: 'user', content: messageText }
    ];

    const completion = await openrouter.chat.completions.create({
        model: env.MODEL,
        messages,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';

    // LLMs often almost valid JSON or JSON in the middle of some grabage text
    // So we extract it with a regex instead of JSON.parse
    const match = content.match(/\{.*?\"?spam\"?\s*:\s*(true|false).*?\}/i);
    return match?.[1]?.toLowerCase() === 'true'
}
