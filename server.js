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

bot.start((ctx) => {
    ctx.reply('Привет');
});

bot.launch({
    webhook: {
        domain: 'https://mining-empire-backend.vercel.app/',
        port: 443,
    },
});


