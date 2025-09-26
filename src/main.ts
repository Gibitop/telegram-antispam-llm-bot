import { Telegraf } from 'telegraf';
import { detectSpam } from './detectSpam';
import { env } from './env';


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
        const isSpam = await detectSpam(text);
        if (isSpam) {
            ctx.react({ type: 'emoji', emoji: '🗿' });
            console.log('[SPAM DETECTED]', {
                chatId: ctx.chat.id,
                messageId: message.message_id,
                from: ctx.from,
                text,
            });
        } else if (env.REACT_NON_SPAM) {
            ctx.react({ type: 'emoji', emoji: '👌' });
            console.log('[NON SPAM DETECTED]', {
                chatId: ctx.chat.id,
                messageId: message.message_id,
                from: ctx.from,
                text,
            });
        }
    } catch (error) {
        console.error('Spam detection failed', error);
    }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch(() => {
    console.log('Bot started');
    console.log('React non spam:', env.REACT_NON_SPAM);
    console.log('Allowed chat IDs:', env.TELEGRAM_CHAT_IDS);
    console.log('Model:', env.MODEL);
    console.log('System prompt:');
    console.log(env.SYSTEM_PROMPT);
});
