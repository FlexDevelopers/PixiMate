const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config();

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Replace with your actual Telegram channel username (without @)
const channelUsername = process.env.TELEGRAM_CHANNEL;

// Get the API keys from environment variables
const REMOVE_BG_API_KEY = process.env.RMBG_API_KEY;
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

// Function to check if the user is a member of the channel
async function isUserInChannel(chatId) {
    try {
        const member = await bot.getChatMember(channelUsername, chatId);
        return member.status === 'member' || member.status === 'administrator';
    } catch (error) {
        console.error('Error checking channel membership:', error.message);
        return false;
    }
}

// Respond to /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;

    const isMember = await isUserInChannel(chatId);

    if (!isMember) {
        const verificationMessage = await bot.sendMessage(chatId, `To access all features, please join our channel and verify your membership:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📢 Join Telegram Channel", url: `https://t.me/${channelUsername.substring(1)}` }],
                    [{ text: "✅ Verify", callback_data: 'verify' }]
                ]
            }
        });

        setTimeout(() => {
            bot.deleteMessage(chatId, verificationMessage.message_id);
        }, 60000);
    } else {
        const imagePath = 'https://ibb.co/dKPK4Mq';
        await bot.sendPhoto(chatId, imagePath, {
            caption: "🌟 Welcome to PixiMate! Your go-to bot for image processing. \n\nSend a photo to get started!",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🌐 Visit Website", url: "https://yourwebsite.com" }],
                    [{ text: "📚 Help", callback_data: 'help' }],
                    [{ text: "ℹ️ About", callback_data: 'about' }]
                ]
            }
        });
    }
});

// Verify button functionality
bot.on('callback_query', async (query) => {
    if (query.data === 'verify') {
        const chatId = query.message.chat.id;
        const isMember = await isUserInChannel(chatId);

        if (isMember) {
            bot.sendMessage(chatId, "✅ You are verified! You can now use the bot features.");
            const imagePath = 'https://ibb.co/dKPK4Mq';
            await bot.sendPhoto(chatId, imagePath, {
                caption: "🌟 Welcome to PixiMate! Your go-to bot for image processing. \n\nSend a photo to get started!",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🌐 Visit Website", url: "https://yourwebsite.com" }],
                        [{ text: "📚 Help", callback_data: 'help' }],
                        [{ text: "ℹ️ About", callback_data: 'about' }]
                    ]
                }
            });
            bot.deleteMessage(chatId, query.message.message_id);
        } else {
            bot.answerCallbackQuery(query.id, { text: "⚠️ You must join our Telegram channel to use this bot. Please join and then verify your membership.", show_alert: true });
        }
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    
    if (query.data === 'help') {
        bot.answerCallbackQuery(query.id, { text: "📚 This bot helps you process images. Send image to begin!", show_alert: true });
    }

    if (query.data === 'about') {
        bot.sendMessage(chatId, "ℹ️ PixiMate is designed to assist you with various image-related tasks.", { parse_mode: "Markdown" });
    }
});

// Delete non-member text messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Check if the message is a text message and not a command
    if (msg.text && !msg.text.startsWith('/')) {
        const isMember = await isUserInChannel(chatId);

        if (!isMember) {
            // Delete the user's message if they are not a member
            bot.deleteMessage(chatId, msg.message_id);

            // Send a warning message and delete it after 5 seconds
            const warningMessage = await bot.sendMessage(chatId, "⚠️ You must join our Telegram channel to use this bot.");
            setTimeout(() => {
                bot.deleteMessage(chatId, warningMessage.message_id);
            }, 5000);
        }
    }
});

// Function to remove background from the image
async function removeBg(imageURL) {
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_url", imageURL);

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": REMOVE_BG_API_KEY },
        body: formData,
    });

    if (response.ok) {
        return await response.buffer();
    } else {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
}

// Function to upload image to imgbb
async function uploadToImgbb(imageURL) {
    const formData = new FormData();
    formData.append("image", imageURL);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        const data = await response.json();
        return data.data.url;
    } else {
        throw new Error(`${response.status}: ${response.statusText}`);
    }
}

// Listen for photos
let latestPhotoFileId;
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const isMember = await isUserInChannel(chatId);

    if (!isMember) {
        // Delete the user's photo
        bot.deleteMessage(chatId, msg.message_id);

        // Send a warning message and delete it after 5 seconds
        const warningMessage = await bot.sendMessage(chatId, "⚠️ You must join our Telegram channel to use this bot.");
        setTimeout(() => {
            bot.deleteMessage(chatId, warningMessage.message_id);
        }, 5000);

        return;
    }

    const fileId = msg.photo[msg.photo.length - 1].file_id;
    latestPhotoFileId = fileId;

    const serviceKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Upload to imgbb", callback_data: "upload_imgbb" }],
                [{ text: "Remove Background", callback_data: "remove_bg" }]
            ]
        }
    };

    bot.sendMessage(chatId, "Choose a service from the following:", serviceKeyboard);
});

// Handle callback queries for image processing
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (!latestPhotoFileId) {
        //bot.answerCallbackQuery(query.id, { text: "⚠️ No image found! Please send a photo first.", show_alert: true });
        return;
    }

    const fileLink = await bot.getFileLink(latestPhotoFileId);

    if (query.data === "upload_imgbb") {
        bot.sendMessage(chatId, "*📤 Uploading to imgbb...*", { parse_mode: "Markdown" }).then(async (msg) => {
            try {
                const imgbbLink = await uploadToImgbb(fileLink);
                bot.editMessageText(`*✅ Image uploaded!*\n\n🔗 Here is your image link: ${imgbbLink}`, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown"
                });
            } catch (error) {
                console.error('Error uploading to imgbb:', error.message);
                bot.editMessageText('*⚠️ Failed to upload image to imgbb. Please try again later.*', {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown"
                });
            }
        });
    } else if (query.data === "remove_bg") {
        bot.sendMessage(chatId, "*📤 Uploading to Removebg...*", { parse_mode: "Markdown" }).then(async (msg) => {
            try {
                const rbgResultData = await removeBg(fileLink);
                const outputFilePath = 'rmbg.png';
                fs.writeFileSync(outputFilePath, rbgResultData);

                await bot.editMessageText('*🔄 Removing background...*', {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown"
                });

                await bot.sendDocument(chatId, outputFilePath, {
                    caption: '*✅ Background removed!*',
                    parse_mode: "Markdown"
                });

                fs.unlinkSync(outputFilePath);
            } catch (error) {
                console.error('Error processing the image:', error.message);
                bot.editMessageText('*⚠️ Failed to remove the background. Please try again later.*', {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown"
                });
            }
        });
    }

    bot.answerCallbackQuery(query.id);
});

console.log("Connected");
