export default async function handler(req, res) {
    try {
        await database
            .from('users')
            .update({ wallet_connect: 'true' })
            .eq('role', 'user');

        console.log('Функция выполнена в:', new Date().toISOString());
        res.status(200).json({ message: 'Задача выполнена успешно' });
    } catch (error) {
        console.error('Ошибка при выполнении задачи:', error);
        res.status(500).json({ error: 'Ошибка при выполнении задачи' });
    }
}