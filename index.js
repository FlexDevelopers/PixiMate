const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
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

setInterval(() => {
  require('http').get('https://your-glitch-project-name.glitch.me');
}, 280000); // Sends a request every ~4.6 minutes

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
        const imagePath = 'https://i.ibb.co/n67kfD9/file-3.jpg';
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
            bot.sendMessage(chatId, "✅ You are verified! You can now use the bot features.").then(() => {
            const imagePath = 'https://i.ibb.co/n67kfD9/file-3.jpg';
            bot.sendPhoto(chatId, imagePath, {
                caption: "🌟 Welcome to PixiMate! Your go-to bot for image processing. \n\nSend a photo to get started!",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🌐 Visit Website", url: "https://yourwebsite.com" }],
                        [{ text: "📚 Help", callback_data: 'help' }],
                        [{ text: "ℹ️ About", callback_data: 'about' }]
                    ]
                }
            });
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
        const chatId = query.message.chat.id;
      
        const emojiCounts = {
          smile: 100,
          star: 588,
          angry: 44,
          heart: 689,
          fire: 478,
          laugh: 37,
          thumbsUp: 894,
          cool: 146,
          party: 97
       };
      
     const devflex = await bot.sendSticker(chatId, "CAACAgIAAxkBAAIBH2cRbbQQtP4j95rULH9Lmgh80L9uAAJUYQACYgiISPEbzo3A7bujNgQ", {

        reply_markup: {
            inline_keyboard: [
                [
                    { text: `😁 ${emojiCounts.smile}`, callback_data: 'emoji_smile' },
                    { text: `🤩 ${emojiCounts.star}`, callback_data: 'emoji_star' },
                    { text: `😡 ${emojiCounts.angry}`, callback_data: 'emoji_angry' }
                ],
                [
                    { text: `❤️ ${emojiCounts.heart}`, callback_data: 'emoji_heart' },
                    { text: `🔥 ${emojiCounts.fire}`, callback_data: 'emoji_fire' },
                    { text: `😂 ${emojiCounts.laugh}`, callback_data: 'emoji_laugh' }
                ],
                [
                    { text: `👍 ${emojiCounts.thumbsUp}`, callback_data: 'emoji_thumbsUp' },
                    { text: `😎 ${emojiCounts.cool}`, callback_data: 'emoji_cool' },
                    { text: `🎉 ${emojiCounts.party}`, callback_data: 'emoji_party' }
                ]
            ]
        }
    });
  // Handle callback queries for emoji buttons
    bot.on('callback_query', async (query) => {
        const buttonType = query.data.split('_')[1];
        emojiCounts[buttonType]++; // Increment the counter for the pressed button

        // Update button text to show the count
        await bot.editMessageReplyMarkup({
            inline_keyboard: [
                [
                    { text: `😁 ${emojiCounts.smile}`, callback_data: 'emoji_smile' },
                    { text: `🤩 ${emojiCounts.star}`, callback_data: 'emoji_star' },
                    { text: `😡 ${emojiCounts.angry}`, callback_data: 'emoji_angry' }
                ],
                [
                    { text: `❤️ ${emojiCounts.heart}`, callback_data: 'emoji_heart' },
                    { text: `🔥 ${emojiCounts.fire}`, callback_data: 'emoji_fire' },
                    { text: `😂 ${emojiCounts.laugh}`, callback_data: 'emoji_laugh' }
                ],
                [
                    { text: `👍 ${emojiCounts.thumbsUp}`, callback_data: 'emoji_thumbsUp' },
                    { text: `😎 ${emojiCounts.cool}`, callback_data: 'emoji_cool' },
                    { text: `🎉 ${emojiCounts.party}`, callback_data: 'emoji_party' }
                ]
            ]
        }, {
            chat_id: query.message.chat.id,
            message_id: devflex.message_id
        });

        // Acknowledge the callback query
        bot.answerCallbackQuery(query.id);
    });
     
      const aboutMessage = `

🌐 <b>Welcome to DevFlex™ (Flex Developers) 🚀</b>

We are <b>DevFlex™</b>, a dynamic team of developers and designers committed to delivering flexible, top-quality software solutions. We embrace challenges, drive innovation, and prioritize client satisfaction in every project.

💻 <b>Our Expertise:</b>

• API Development & Integration
• Telegram & WhatsApp Bots
• Web & Mobile App Development
• Custom Software Solutions
• UI/UX Design

🔍 <b>Why Choose Us?</b>

• Agile Approach
• Client-Centric Solutions
• End-to-End Support

"Flexibility in Every Function." — DevFlex™

<a href="https://github.com/FlexDevelopers/">🔗 Explore our GitHub</a> for more projects and collaborations.

   `;
        bot.sendMessage(chatId, aboutMessage, { parse_mode: "HTML" });
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
                [{ text: "Remove Background", callback_data: "remove_bg" }],
                [{ text: "Create Sticker", callback_data: "create_sticker" }]
            ]
        }
    };

    bot.sendMessage(chatId, "Choose a service from the following:", serviceKeyboard);
});

// Handle callback queries for image processing
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    if (!latestPhotoFileId) {
       // bot.answerCallbackQuery(query.id, { text: "⚠️ No image found! Please send a photo first.", show_alert: true });
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
                }).then(() => {
                    setTimeout(() => {
                        bot.deleteMessage(chatId, msg.message_id);
                    }, 5000); // Delete after 5 seconds
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
    } else if (query.data === "create_sticker") {
        bot.sendMessage(chatId, "*🛠️ Creating sticker...*", { parse_mode: "Markdown" }).then(async (msg) => {
            try {
                const stickerFilePath = 'sticker.webp';
                
                // Download the file and convert to WebP format
                const response = await fetch(fileLink);
                const buffer = await response.buffer();
                fs.writeFileSync(stickerFilePath, buffer);

                // Send the sticker
                await bot.sendSticker(chatId, stickerFilePath, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "🌟 Sticker Created!", callback_data: "sticker_done" }]]
                    }
                });

                // Clean up the file after sending
                fs.unlinkSync(stickerFilePath);
                bot.editMessageText('*✅ Sticker created!*', {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown"
                }).then(() => {
                    setTimeout(() => {
                        bot.deleteMessage(chatId, msg.message_id);
                    }, 5000); // Delete after 5 seconds
                });
            } catch (error) {
                console.error('Error creating the sticker:', error.message);
                bot.editMessageText('*⚠️ Failed to create the sticker. Please try again later.*', {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: "Markdown"
                });
            }
        });
    }

    bot.answerCallbackQuery(query.id);
});

const PIXELS_API_KEY = 'Dlq0ek4Oew4C27fRq8rBgeW4iEzP1mn10MhffdTB4wU7YAp6rZn8HGh8'; // Replace with your actual Pexels API key
const imagesPerPage = 10; // Fetch 10 images at a time

let currentImages = [];
let currentPage = 1;
let currentQuery = '';
let currentImageIndex = 0;
let currentMessageId = null;

bot.onText(/\/pixels(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].trim(); // Get the query from the command

    // Check if the user is a member of the channel
    const isMember = await isUserInChannel(chatId);
    if (!isMember) {
        bot.deleteMessage(chatId, msg.message_id);
        const warningMessage = await bot.sendMessage(chatId, "⚠️ You must join our Telegram channel to use this bot.");
        setTimeout(() => {
            bot.deleteMessage(chatId, warningMessage.message_id);
        }, 5000);
      return ;
    }

    if (!query || query === '') {
        return bot.sendMessage(chatId, 'Please provide a search query like this: /pixels <query>');
    }

    currentQuery = query;
    currentPage = 1; // Reset to first page
    currentImageIndex = 0; // Reset to the first image in the batch
    currentMessageId = null; // Reset message ID for a new message

    try {
        await fetchAndSendImage(chatId, currentQuery, currentPage, currentImageIndex);
    } catch (error) {
        console.error('Error fetching images:', error);
        bot.sendMessage(chatId, 'Error fetching images from Pexels. Please try again later.');
    }
});

async function fetchAndSendImage(chatId, query, page, index) {
    try {
        if (index === 0 || currentImages.length === 0) {
            // Fetch new batch of images if index is 0 or no images are stored
            const response = await axios.get('https://api.pexels.com/v1/search', {
                headers: {
                    Authorization: PIXELS_API_KEY,
                },
                params: {
                    query: query,
                    per_page: imagesPerPage,
                    page: page,
                },
            });

            currentImages = response.data.photos;

            if (currentImages.length === 0) {
                return bot.sendMessage(chatId, 'No images found for this query.');
            }
        }

        // Send or edit the current image
        await sendOrEditImage(chatId, currentImages[index], page, index);
    } catch (error) {
        throw error;
    }
}

async function sendOrEditImage(chatId, image, page, index) {
    const caption = `${image.alt}\nPhoto by ${image.photographer} on Pexels\n(Page ${page},Image ${index + 1}/${imagesPerPage})`;

    const options = {
        chat_id: chatId,
        message_id: currentMessageId,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '⏮️ Previous', callback_data: 'previous' },
                    { text: 'Next ⏭️', callback_data: 'next' }
                ]
            ]
        }
    };

    const media = {
        type: 'photo',
        media: image.src.medium,
        caption: caption
    };

    if (currentMessageId) {
        // Edit the existing message
        await bot.editMessageMedia(media, options);
    } else {
        // Send a new message and save the message ID
        const sentMessage = await bot.sendPhoto(chatId, image.src.medium, { caption, ...options });
        currentMessageId = sentMessage.message_id;
    }
}

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'next') {
        currentImageIndex++;
        if (currentImageIndex >= currentImages.length) {
            // Move to the next page if end of batch is reached
            currentImageIndex = 0;
            currentPage++;
        }
    } else if (data === 'previous') {
        currentImageIndex--;
        if (currentImageIndex < 0) {
            // Move to the previous page if start of batch is reached
            currentImageIndex = imagesPerPage - 1;
            currentPage = Math.max(1, currentPage - 1);
        }
    }

    try {
        await fetchAndSendImage(chatId, currentQuery, currentPage, currentImageIndex);
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Error fetching images:', error);
        //bot.sendMessage(chatId, 'Error fetching images from Pexels. Please try again later.');
    }
});


console.log("Connected");
