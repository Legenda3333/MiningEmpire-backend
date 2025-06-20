import express from 'express';
import cors from 'cors';
import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
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
    async userAuthorization(req, res) {
        const telegramUserData = req.body.telegramUserData;
        const userID = telegramUserData.id;
        let userData = null;

        const { data: initialUserData } = await database
            .from('users')
            .select('*')
            .eq('telegramID', userID);
    
        if (initialUserData.length === 0) {
            const NewUserInfo = { 
                telegramID: userID, 
                firstName: telegramUserData.first_name, 
                lastName: telegramUserData.last_name || "", 
                username: telegramUserData.username || "NO USERNAME", 
                languageCode: telegramUserData.language_code || "", 
                isPremium: telegramUserData.is_premium || false, 
                registrationTime: Math.floor(Date.now() / 1000),
                profilePicture: telegramUserData.photo_url || "images/undefined_profilePicture.png"
            };
    
            await database
                .from('users')
                .insert([NewUserInfo]);
            
            const { data: createdUserData } = await database
                .from('users')
                .select('*')
                .eq('telegramID', userID);
            
            userData = createdUserData;
        } else { userData = initialUserData; }
    
        const { data: friendsList } = await database
            .from('users')
            .select('firstName, lastName, username, MiningPower, profilePicture, isPremium, registrationTime')
            .eq('referral_ID', userID);
        
        res.json({ user: userData[0], friends: friendsList });
    }
    

    async updateMiningPower(req, res) {
        const UserID = req.body.UserID;
        const MiningPower = req.body.MiningPower;

        await database
        .from("users")
        .update({ MiningPower: MiningPower }) 
        .eq("telegramID", UserID); 

        res.status(200).send({ message: 'MiningPower обновлён!' });
    }


    async GetTotalMiningPower(req, res) {
        const { data: users_MiningPower } = await database
        .from("users") 
        .select("MiningPower")
        .eq("role", "user");

        res.json({ users_MiningPower });
    }
    

    async updateCountMiners(req, res) {
        const UserID = req.body.UserID;
        const userInfo = req.body.userInfo;

        await database
        .from("users")
        .update({M1:userInfo.M1, M2:userInfo.M2, M3:userInfo.M3, M4:userInfo.M4, M5:userInfo.M5, M6:userInfo.M6, M7:userInfo.M7, M8:userInfo.M8, M9:userInfo.M9, M10:userInfo.M10, M11:userInfo.M11, M12:userInfo.M12, M13:userInfo.M13, M14:userInfo.M14, M15:userInfo.M15, M16:userInfo.M16}) 
        .eq("telegramID", UserID);

        res.status(200).send({ message: 'Количество майнеров обновлено!' });
    }


    async updateStatusWallet(req, res) {
        const UserID = req.body.UserID;
        const statusWallet = req.body.statusWallet;

        await database
        .from("users")
        .update({ wallet_connect: statusWallet }) 
        .eq("telegramID", UserID);

        res.status(200).send({ message: 'Статус кошелька изменён на', statusWallet });
    }


    async checkingChannelSubscription(req, res) {
        const UserID = req.body.UserID;
        const channelUsername = req.body.channelUsername;
        const chatMember = await bot.telegram.getChatMember(channelUsername, UserID);
    
        const isSubscribed = chatMember.status === 'member' || chatMember.status === 'administrator' || chatMember.status === 'creator';
    
        res.status(200).send({ 
            message: 'Проверка выполнена!', 
            isSubscribed: isSubscribed 
        });
    }


    async rewardForCompletedTask(req, res) {
        const UserID = req.body.UserID;
        const taskID = req.body.taskID;
        const TASK = `task${taskID}`;

        if (taskID[0] !== "1") {
            await database
            .from("users")
            .update({[TASK]: 'true' }) 
            .eq("telegramID", UserID);
        } else if (taskID[0] === "1") {
            const CountCompletedTasks = req.body.CountCompletedTasks;
            const COUNT_TASK = `count_task${taskID}`;

            await database
            .from("users")
            .update({[TASK]: 'true', [COUNT_TASK]: CountCompletedTasks + 1 }) 
            .eq("telegramID", UserID);
        }

        res.status(200).send({ message: `User ${UserID} выполнил задачу! ID задачи, ${taskID}` });
    }


    async getInvoiceLink(req, res) {
        const invoiceID = req.body.invoiceID;
        let result = await generate_invoice(invoiceID);
        if (result) {
            res.json({ success: true, link: result });
        } 
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
            .select('id, MiningPower, Coins')
            .eq('role', 'user');
    
        const totalMiningPower = users.reduce((sum, row) => sum + row.MiningPower, 0);
    
        const updates = users.map(user => {
            const reward = user.MiningPower / totalMiningPower * 10000; // Вычисляем награду
            return database
                .from('users') 
                .update({ Coins: user.Coins + reward }) // Обновляем Coins
                .eq('id', user.id); // Условие обновления по id
        });
    
        await Promise.all(updates);
        res.status(200).send({ message: 'Награды за добытый блок начислены!' });
    }
}

const tgController = new TgController();

const router = express.Router();

router.post('/userAuthorization', (req, res) => tgController.userAuthorization(req, res));
router.post('/updateMiningPower', (req, res) => tgController.updateMiningPower(req, res));
router.post('/GetTotalMiningPower', (req, res) => tgController.GetTotalMiningPower(req, res));
router.post('/updateCountMiners', (req, res) => tgController.updateCountMiners(req, res));
router.post('/updateStatusWallet', (req, res) => tgController.updateStatusWallet(req, res));
router.post('/checkingChannelSubscription', (req, res) => tgController.checkingChannelSubscription(req, res));
router.post('/rewardForCompletedTask', (req, res) => tgController.rewardForCompletedTask(req, res));
router.post('/getInvoiceLink', (req, res) => tgController.getInvoiceLink(req, res));
router.post('/resetting_daily_tasks', (req, res) => tgController.resetting_daily_tasks(req, res)); 
router.post('/reward_for_new_block', (req, res) => tgController.reward_for_new_block(req, res)); 

app.use(express.json());
const allowedDomains = [process.env.FRONTEND_URL];
app.use(cors({
    origin: allowedDomains,
    methods: ['POST'], 
    credentials: true 
}));
app.use('/tg', router);

app.listen(process.env.PORT);

// `
