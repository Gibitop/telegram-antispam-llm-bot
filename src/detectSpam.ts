import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openRouterToken = process.env.OPEN_ROUTER_TOKEN;
if (!openRouterToken) {
    throw new Error('OPEN_ROUTER_TOKEN is required');
}

const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openRouterToken,
});

const SPAM_MODEL = 'z-ai/glm-4-32b' as const;

const SYSTEM_PROMPT = [
    'Ты фильтр спама.',
    'Пользователь пишет сообщение, а ты отвечаешь спам это или нет.',
    'В случае, если это спам, ты отвечаешь {"spam": true}',
    'В случае, если это не спам, ты отвечаешь {"spam": false}',
    'Спамом считаются сообщение об обмене криптовалют: таких как USDT, BTC, Tether, А также сообщения с обманом, предложением быстрого легкого заработка'
].join('\n');


type SpamResult = {
    spam: boolean;
};

export async function detectSpam(messageText: string): Promise<boolean> {
    const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: messageText }
    ];

    const completion = await openrouter.chat.completions.create({
        model: SPAM_MODEL,
        messages,
    });

    const content = completion.choices?.[0]?.message?.content ?? '';

    let parsed: SpamResult | null = null;
    try {
        parsed = JSON.parse(content) as SpamResult;
    } catch {
        // attempt to extract JSON if model added text around it
        const match = content.match(/\{\s*\"spam\"\s*:\s*(true|false)\s*\}/i);
        if (match) {
            parsed = { spam: match[1]?.toLowerCase() === 'true' };
        }
    }

    return Boolean(parsed?.spam);
}
