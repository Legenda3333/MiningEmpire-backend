import { Telegraf, Markup } from 'telegraf';
const bot = new Telegraf('7319758246:AAGam-VqfuaKwM2ys_CqNe0gjqYyGdviTlc');

bot.start((ctx) => {
    ctx.reply('Привет');
});

bot.help((ctx) => {
    ctx.reply('Это бот, который приветствует вас. Используйте команду /start, чтобы начать!');
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log('Бот запущен!');
    })
    .catch(err => {
        console.error('Ошибка при запуске бота:', err);
    });

// Обработка ошибок
process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
