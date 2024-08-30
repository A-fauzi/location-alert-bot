const express = require('express');
const path = require('path');
const { Telegraf } = require('telegraf');
const app = express();

// Load environment variables
require('dotenv').config();

// Token Bot Telegram dan Chat ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Inisialisasi bot Telegram
let bot;
try {
    bot = new Telegraf(TELEGRAM_BOT_TOKEN);
    console.log('Telegram bot initialized successfully');
} catch (error) {
    console.error('Failed to initialize Telegram bot:', error);
}

// Middleware untuk parsing JSON
app.use(express.json());

// Serve halaman HTML statis
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk menerima data lokasi dan mengirimkannya ke Telegram
app.post('/location', async (req, res) => {
    const { latitude, longitude } = req.body;

    console.log(`Received location: Latitude: ${latitude}, Longitude: ${longitude}`);

    if (!bot) {
        console.error('Telegram bot is not initialized');
        return res.status(500).json({ error: 'Telegram bot is not initialized' });
    }

    const message = `New location detected!\nLatitude: ${latitude}\nLongitude: ${longitude}`;
    
    try {
        await bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message);
        console.log('Message sent to Telegram successfully');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        res.status(500).json({ error: 'Failed to send message to Telegram' });
    }
});

// Webhook endpoint for Telegram
app.post(`/webhook/${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.handleUpdate(req.body, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Set webhook for Telegram bot
    if (bot) {
        const webhookUrl = `https://location-alert-bot.vercel.app/webhook/${TELEGRAM_BOT_TOKEN}`;
        bot.telegram.setWebhook(webhookUrl)
            .then(() => console.log('Webhook set successfully'))
            .catch((error) => console.error('Failed to set webhook:', error));
    }
});