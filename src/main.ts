import { Telegraf } from 'telegraf';
import { detectSpam } from '~/detectSpam';

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
}

const bot = new Telegraf(telegramBotToken);

bot.on('message', async (ctx) => {
    const chatType = ctx.chat?.type;
    if (chatType !== 'group' && chatType !== 'supergroup') {
        return;
    }

    const text = (ctx.message && 'text' in ctx.message) ? ctx.message.text : undefined;
    if (!text || text.trim().length === 0) {
        return;
    }

    console.dir(ctx.message, { depth: null });

    try {
        const isSpam = await detectSpam(text);
        if (isSpam) {
            ctx.react({ type: 'emoji', emoji: '🗿' });
            console.log('[SPAM DETECTED]', {
                chatId: ctx.chat.id,
                messageId: ctx.message.message_id,
                text
            });
        }
    } catch (error) {
        console.error('Spam detection failed', error);
    }
});


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();
