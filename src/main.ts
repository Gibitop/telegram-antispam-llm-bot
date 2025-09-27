import { Telegraf } from 'telegraf';
import { detectSpam } from './detectSpam';
import { env } from './env';
import packageJson from '../package.json' with { type: 'json' };


const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

bot.on(['message', 'edited_message'], async (ctx) => {
    const chatType = ctx.chat?.type;
    if (chatType !== 'group' && chatType !== 'supergroup') {
        if (chatType === 'private') {
            ctx.reply('This bot is only available in groups and supergroups');
        }
        return;
    }

    if (env.TELEGRAM_CHAT_IDS.length > 0 && !env.TELEGRAM_CHAT_IDS.includes(ctx.chat.id)) {
        ctx.reply('This group is not whitelisted for this bot');
        console.log('[CHAT NOT ALLOWED]', {
            chatId: ctx.chat.id,
            chatType,
            allowedChatIds: env.TELEGRAM_CHAT_IDS,
        });
        return;
    }

    const message = ctx.message || ctx.editedMessage;

    const text = (message && 'text' in message) ? message.text : undefined;
    if (!text || text.trim().length === 0) {
        return;
    }

    try {
        const { isSpam, fullResponse } = await detectSpam(text);
        const logDetails = {
            chatId: ctx.chat.id,
            messageId: message.message_id,
            from: ctx.from
                ? `${[ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ')} @${ctx.from.username} (userId: ${ctx.from.id})`
                : 'unknown',
            text,
            llmResponse: fullResponse,
        };

        if (isSpam) {
            console.log('[SPAM DETECTED]', logDetails);
            if (env.DELETE_SPAM) {
                await ctx.deleteMessage(message.message_id).catch((error) => {
                    console.error('Failed to delete message', error);
                });
            } else {
                ctx.react({ type: 'emoji', emoji: '🗿' });
            }
        } else if (env.REACT_NON_SPAM) {
            console.log('[NON SPAM DETECTED]', logDetails);
            ctx.react({ type: 'emoji', emoji: '👌' });
        }
    } catch (error) {
        console.error('Spam detection failed', error, ctx.message);
    }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch(() => {
    console.log('Bot started', `v${packageJson.version}`);
    console.log('LLM endpoint:', env.LLM_ENDPOINT);
    console.log('React non spam:', env.REACT_NON_SPAM);
    console.log('Delete spam:', env.DELETE_SPAM);
    console.log('Allowed chat IDs:', env.TELEGRAM_CHAT_IDS);
    console.log('Model:', env.MODEL);
    console.log('System prompt:');
    console.log(env.SYSTEM_PROMPT);
});
