import express from 'express';
import cors from 'cors';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const token = '7319758246:AAGam-VqfuaKwM2ys_CqNe0gjqYyGdviTlc';
//const webAppUrl = 'https://mining-empire-game.web.app';
const webAppUrl = 'https://inquisitive-flan-7aa527.netlify.app/';

const bot = new Telegraf(token);

const SUPABASE_URL = 'https://jcynommzpdlnwdahfwdw.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeW5vbW16cGRsbndkYWhmd2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzNzgwODksImV4cCI6MjA0NTk1NDA4OX0.fzDinYOvphGxNEi4qkvYo4lCv9yPf6_XqdCD28iQd_U';
const database = createClient(SUPABASE_URL, SUPABASE_API_KEY);

async function isImageAvailable(url) {
    try {
        const response = await fetch(url);
        return response.ok && response.headers.get('content-type').startsWith('image/');
    } catch (error) {
        return false;
    }
}

bot.start(async (ctx) => {
    const referal_id = ctx.startPayload;
    const id = ctx.from.id;
    const first_name = ctx.from.first_name || '';
    const last_name = ctx.from.last_name || '';
    const username = ctx.from.username || '';
    const language_code = ctx.from.language_code || '';
    const is_premium = ctx.from.is_premium || false; 

    const LoginUser = async (id, first_name, last_name, username, language_code, is_premium, referal_id) => {
        const time_reg = Math.floor(Date.now() / 1000);

        // Проверяем, существует ли уже пользователь с данным telegram id
        const { data: existingUser } = await database
            .from('users')
            .select('*')
            .eq('telegram', id);

        // Если пользователь не найден, добавляем его
        if (existingUser.length === 0) {
            const undefined_avatar = 'images/undefined_avatar.png';
            const profilePhotos = await ctx.telegram.getUserProfilePhotos(id);
            const avatar_url = profilePhotos.total_count > 0 
                ? await ctx.telegram.getFileLink(profilePhotos.photos[0][0].file_id)
                : undefined_avatar;

            const userData = referal_id !== "" && Number(referal_id) !== id
                ? { telegram: id, avatar_url: avatar_url, first_name: first_name, last_name: last_name, username: username, language: language_code, is_premium: is_premium, time_reg: time_reg, referal_id: referal_id }
                : { telegram: id, avatar_url: avatar_url, first_name: first_name, last_name: last_name, username: username, language: language_code, is_premium: is_premium, time_reg: time_reg };

            await database
                .from('users')
                .insert([userData]);
        } else {
            // Проверяем доступность аватарки по ссылке из базы данных
            const currentAvatarUrl = existingUser[0].avatar_url;
            const isCurrentAvatarAvailable = await isImageAvailable(currentAvatarUrl);

            //Если аватарка недоступна, то заменяем её на новую
            if (!isCurrentAvatarAvailable) {
                const undefined_avatar = 'images/undefined_avatar.png';
                const profilePhotos = await ctx.telegram.getUserProfilePhotos(id);
                const avatar_url = profilePhotos.total_count > 0 
                    ? await ctx.telegram.getFileLink(profilePhotos.photos[0][0].file_id)
                    : undefined_avatar;

                await database
                .from('users')
                .update({ avatar_url })
                .eq('telegram', id);
        }
    }
};

await LoginUser(id, first_name, last_name, username, language_code, is_premium, referal_id);

ctx.reply(
    'Добро пожаловать!',
    Markup.inlineKeyboard([
        Markup.button.webApp('Open mini-app', `${webAppUrl}`)
    ]));
});


bot.launch({
    webhook: {
        domain: 'https://mining-empire-backend.vercel.app/',
        port: 443,
    },
});


