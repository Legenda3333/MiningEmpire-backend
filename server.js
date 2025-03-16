import { Telegraf, Markup } from 'telegraf';
const bot = new Telegraf('7319758246:AAGam-VqfuaKwM2ys_CqNe0gjqYyGdviTlc');

// Установите вебхук
bot.launch({
    webhook: {
        domain: 'https://mining-empire-backend.vercel.app/',
        port: 443,
    },
});

// Ваши обработчики
bot.start((ctx) => {
    ctx.reply('Привет');
});

// Обработка ошибок
process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
