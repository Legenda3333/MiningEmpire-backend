import { Telegraf, Markup } from 'telegraf';
const bot = new Telegraf('7319758246:AAGam-VqfuaKwM2ys_CqNe0gjqYyGdviTlc');

bot.start((ctx) => {
    ctx.reply('Привет');
});

bot.launch({
    webhook: {
        domain: 'https://mining-empire-backend.vercel.app/',
        port: 443,
    },
});


