const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const channelUsername = process.env.TELEGRAM_CHANNEL;

// Command to start the bot
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if user is in the channel
    const member = await bot.getChatMember(channelUsername, userId);
    
    if (member.status === 'member' || member.status === 'administrator' || member.status === 'creator') {
        // User is a member of the channel
        const photoPath = 'path_to_your_image.png'; // Update with your image path

        // Send an image with caption and buttons
        bot.sendPhoto(chatId, photoPath, {
            caption: "Welcome to FotoBot! Click the button below to start.",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Verify", callback_data: "verify" },
                        { text: "Join Channel", url: `https://t.me/${channelUsername.substring(1)}` } // Create a URL for the channel
                    ]
                ]
            }
        });
    } else {
        // User is not a member of the channel
        bot.sendMessage(chatId, `To use this bot, please join our channel: ${channelUsername}`);
    }
});

// Handle button press
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === "verify") {
        bot.sendMessage(chatId, "Thank you for verifying! You can now start processing images.");
        // Additional functionality can be added here
    }
});

