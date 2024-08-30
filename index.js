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
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// Middleware untuk parsing JSON
app.use(express.json());

// Serve halaman HTML statis
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk menerima data lokasi dan mengirimkannya ke Telegram
app.post('/location', (req, res) => {
    const { latitude, longitude } = req.body;

    // Menampilkan data lokasi di console/log
    console.log(`Received location: Latitude: ${latitude}, Longitude: ${longitude}`);

    // Kirim koordinat ke Telegram
    const message = `New location detected!\nLatitude: ${latitude}\nLongitude: ${longitude}`;
    
    bot.telegram.sendMessage(TELEGRAM_CHAT_ID, message)
        .then(() => console.log('Message sent to Telegram'))
        .catch(err => console.error('Error sending message to Telegram:', err));

    // Kirim respons ke frontend
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});