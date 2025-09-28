import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { env } from './env';


const openAiApi = new OpenAI({
    baseURL: env.LLM_ENDPOINT,
    apiKey: env.LLM_API_KEY,
});

const spamJsonRegex = /\{(.|\n)*?\"?spam\"?\s*:\s*(?<spam>true|false)(.|\n)*?\}/i;

export async function detectSpam(messageText: string) {
    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: env.SYSTEM_PROMPT },
        { role: 'user', content: messageText }
    ];

    const completion = await openAiApi.chat.completions.create({
        model: env.MODEL,
        messages,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';

    // LLMs often almost valid JSON or JSON in the middle of some grabage text
    // So we extract it with a regex instead of JSON.parse
    const match = content.match(spamJsonRegex);
    return {
        isSpam: match?.groups?.spam?.toLowerCase() === 'true',
        fullResponse: content,
    }
}
