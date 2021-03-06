/**
 * process.env['NTBA_FIX_319'] = 1 - Fixes the problem below
 * node-telegram-bot-api deprecated Automatic enabling of cancellation of promises is deprecated.
 * In the future, you will have to enable it yourself.
 * See https://github.com/yagop/node-telegram-bot-api/issues/319. internal\modules\cjs\loader.js:1236:30
 */
process.env['NTBA_FIX_319'] = 1;

// Env cofig
require('dotenv').config({
  path: 'config.env',
});

const TelegramApi = require('node-telegram-bot-api');

const { gameOptions, againOptions, webHookOptions } = require('./options');

const TOKEN = process.env.TOKEN;
const URL = process.env.APP_URL;

const bot = new TelegramApi(TOKEN, {
  polling: true,
  webHookOptions,
});

bot.setWebHook(`${URL}/bot${TOKEN}`);

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    'Now I will guess a number from 0 to 9, and you have to guess it.'
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Guess!', gameOptions);
};

const start = () => {
  bot.setMyCommands([
    {
      command: '/start',
      description: 'Initial greeting.',
    },
    {
      command: '/help',
      description: 'Get information about commands.',
    },
    {
      command: '/info',
      description: 'Get list of available commands.',
    },
    {
      command: '/game',
      description: 'Game "guess the number".',
    },
    {
      command: '/remind',
      description: 'Todo list.',
    },
  ]);

  /**
   * Return нужен, чтобы при выполнении какой-нибудь команды -
   * - выполнение кода на этом завершается.
   */
  // Обработка сообщений
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text === '/start') {
      await bot.sendSticker(
        chatId,
        'https://tlgrm.ru/_/stickers/182/af4/182af458-864d-3756-9525-c4bbe46f7426/4.webp'
      );
      return bot.sendMessage(
        chatId,
        `Welcome!\nList of available commands:\n/start - initial greeting.\n/help - get list of available commands.\n/info - Get information about yourself.\n/game - game 'guess the number'.\n/remind - todo list(For example: remind me to 'eat' at '4:25 PM(AM)').`
      );
    }

    const greetingsWords = ['hello', 'hi', 'hey'];
    for (let i = 0; i < greetingsWords.length; i++) {
      const word = greetingsWords[i];
      if (text.includes(word)) {
        return bot.sendMessage(chatId, `Hello, ${msg.from.first_name} :)`);
      }
    }

    const goodbyeWords = ['bye', 'goodbye'];
    for (let i = 0; i < goodbyeWords.length; i++) {
      const word = goodbyeWords[i];
      if (text.includes(word)) {
        return bot.sendMessage(chatId, `Hope to see you around again, Bye :)`);
      }
    }

    if (text === '/help') {
      await bot.sendSticker(
        chatId,
        'https://tlgrm.ru/_/stickers/182/af4/182af458-864d-3756-9525-c4bbe46f7426/6.webp'
      );
      return bot.sendMessage(
        chatId,
        `List of available commands:\n/start - initial greeting.\n/help - get list of available commands.\n/info - Get information about yourself.\n/game - game 'guess the number'.\n/remind - todo list(For example: remind me to 'eat' at '4:25 PM(AM)').`
      );
    }

    if (text === '/info') {
      return bot.sendMessage(
        chatId,
        `Your name - ${msg.from.first_name}\nYour username - ${msg.from.username}`
      );
    }

    if (text === '/game') {
      return startGame(chatId);
    }

    // return bot.sendMessage(chatId, `I don't understand you, please repeat again!`);
  });

  // Обработка кнопок
  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === '/again') {
      return startGame(chatId);
    }
    if (data == chats[chatId]) {
      return bot.sendMessage(chatId, `You guessed the number ${data}`, againOptions);
    } else {
      return bot.sendMessage(
        chatId,
        `You have not guessed the number, the bot guessed the number: ${chats[chatId]}`,
        againOptions
      );
    }
  });

  // Module todo
  let notes = [];

  bot.onText(/\/remind me to (.+) at (.+)/, function (msg, match) {
    const chatId = msg.chat.id;
    const text = match[1];
    const time = match[2];

    notes.push({ uid: chatId, time: time, text: text });

    bot.sendMessage(chatId, 'Excellent! I will definitely remind you!');
  });

  setInterval(function () {
    for (let i = 0; i < notes.length; i++) {
      const curDate = new Date().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
      if (notes[i]['time'] === curDate) {
        bot.sendMessage(
          notes[i]['uid'],
          'I remind you that you must: ' + notes[i]['text'] + ' now.'
        );
        notes.splice(i, 1);
      }
    }
  }, 1000);
};

start();
