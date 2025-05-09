import express from 'express';
import cors from 'cors';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
//import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const bot = new Telegraf(process.env.TOKEN);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const database = createClient(SUPABASE_URL, SUPABASE_API_KEY);

// Функция для создания ссылки на инвойс
async function generate_invoice(invoiceID) {
    let titleText, prices;
    let descriptionText = "Purchase for telegram stars";
    let payload = { atribut: 'none' };
    let providerToken = ""; 
    let currency = "XTR";

    if (invoiceID === "telegram_stars_daily_payment") {titleText = "Telegram Stars Daily Quest"; prices = [{ label: "Price Label", amount: 25 }]}

    if (invoiceID === "miner1") {titleText = "Start Miner"; prices = [{ label: "Price Label", amount: 250 }]}
    if (invoiceID === "miner2") {titleText = "Red Miner"; prices = [{ label: "Price Label", amount: 375 }]}
    if (invoiceID === "miner3") {titleText = "LGC200"; prices = [{ label: "Price Label", amount: 500 }]}
    if (invoiceID === "miner4") {titleText = "LGC450"; prices = [{ label: "Price Label", amount: 750 }]}
    if (invoiceID === "miner5") {titleText = "LGC550"; prices = [{ label: "Price Label", amount: 1125 }]}
    if (invoiceID === "miner6") {titleText = "T100"; prices = [{ label: "Price Label", amount: 1875 }]}
    if (invoiceID === "miner7") {titleText = "T100 SUPER"; prices = [{ label: "Price Label", amount: 3000 }]}
    if (invoiceID === "miner8") {titleText = "LGC800"; prices = [{ label: "Price Label", amount: 5000 }]}
    if (invoiceID === "miner9") {titleText = "LGC900"; prices = [{ label: "Price Label", amount: 7500 }]}
    if (invoiceID === "miner10") {titleText = "Neon Miner"; prices = [{ label: "Price Label", amount: 11250 }]}
    if (invoiceID === "miner11") {titleText = "HGC-A1"; prices = [{ label: "Price Label", amount: 15625 }]}
    if (invoiceID === "miner12") {titleText = "HGC-A2"; prices = [{ label: "Price Label", amount: 18750 }]}
    if (invoiceID === "miner13") {titleText = "TMiner-V1"; prices = [{ label: "Price Label", amount: 25000 }]}
    if (invoiceID === "miner14") {titleText = "RT S22"; prices = [{ label: "Price Label", amount: 30000 }]}
    if (invoiceID === "miner15") {titleText = "TMiner-V2"; prices = [{ label: "Price Label", amount: 37500 }]}
    if (invoiceID === "miner16") {titleText = "TMiner-V3"; prices = [{ label: "Price Label", amount: 50000 }]}

    let obj = { title: titleText, description: descriptionText, payload: JSON.stringify(payload), provider_token: providerToken, currency: currency, prices: prices };
    
    let result = await bot.telegram.createInvoiceLink(obj);
    return result;
}

class TgController {
    async UserAuthorization(req, res) {
        const UserID = req.body.UserID;

        const { data } = await database
        .from('users')
        .select('*')
        .eq('telegram_id', UserID);

        if (data.length === 1) {
            res.json(data[0]);
        } else if (data.length === 0) {
            const NewUserInfo = { 
                telegram: UserID, 
                first_name: req.body.first_name, 
                last_name: req.body.last_name, 
                username: req.body.username, 
                language: req.body.language_code, 
                is_premium: req.body.is_premium, 
                time_reg: req.body.time_reg,
                avatar_url: req.body.avatar
            };

            await database
            .from('users')
            .insert([NewUserInfo]);

            const { data } = await database
            .from('users')
            .select('*')
            .eq('telegram_id', UserID);

            res.json(data[0]);
        }
    }

    async getInvoiceLink(req, res) {
        const invoiceID = req.body.invoiceID;
        let result = await generate_invoice(invoiceID);
        if (result) {
            res.json({ success: true, link: result });
        } 
    }

    async getSecrets(req, res) {
        res.json({
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_API_KEY: process.env.SUPABASE_API_KEY
        });
    }

    async resetting_daily_tasks(req, res) {
        await database
        .from('users')
        .update({ task1_1: 'false', task1_2: 'false', task1_3: 'false', task1_4: 'false' }) 
        .eq('role', 'user');

        res.status(200).send({ message: 'Успешный сброс ежедневных задач!' });
    }

    async reward_for_new_block(req, res) {
        const { data: users } = await database
            .from('users') 
            .select('id, MiningPower, MEC')
            .eq('role', 'user');
    
        const totalMiningPower = users.reduce((sum, row) => sum + row.MiningPower, 0);
    
        const updates = users.map(user => {
            const reward = user.MiningPower / totalMiningPower * 10000; // Вычисляем награду
            return database
                .from('users') 
                .update({ MEC: user.MEC + reward }) // Обновляем MEC
                .eq('id', user.id); // Условие обновления по id
        });
    
        await Promise.all(updates);
        res.status(200).send({ message: 'Награды за добытый блок начислены!' });
    }
}

const tgController = new TgController();

const router = express.Router();
router.post('/getInvoiceLink', (req, res) => tgController.getInvoiceLink(req, res));
router.get('/getSecrets', (req, res) => tgController.getSecrets(req, res));
router.post('/resetting_daily_tasks', (req, res) => tgController.resetting_daily_tasks(req, res)); 
router.post('/reward_for_new_block', (req, res) => tgController.reward_for_new_block(req, res)); 

router.post('/UserAuthorization', (req, res) => tgController.UserAuthorization(req, res));

app.use(express.json());
const allowedDomains = [process.env.FRONTEND_URL];
app.use(cors({
    origin: allowedDomains,
    methods: ['GET', 'POST'], 
    credentials: true 
}));
app.use('/tg', router);

app.listen(process.env.PORT);

// `
