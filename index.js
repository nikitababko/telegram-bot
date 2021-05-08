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

const { gameOptions, againOptions } = require('./options');

const token = process.env.TOKEN;

const bot = new TelegramApi(token, {
  polling: true,
});

const chats = {};

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    'Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать'
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, 'Отгадывай!', gameOptions);
};

const start = () => {
  bot.setMyCommands([
    {
      command: '/start',
      description: 'Начальное приветствие',
    },
    {
      command: '/info',
      description: 'Получить информацию о себе',
    },
    {
      command: '/game',
      description: 'Игра - угадай число',
    },
  ]);

  /**
   * Return нужен, чтобы при выполнении какой-нибудь команды -
   * - выполнение кода на этом завершается.
   */
  // Обрабокта сообщений
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === '/start') {
      await bot.sendSticker(
        chatId,
        'https://tlgrm.ru/_/stickers/182/af4/182af458-864d-3756-9525-c4bbe46f7426/4.webp'
      );
      return bot.sendMessage(chatId, `Добро пожаловать!`);
    }

    if (text === '/info') {
      return bot.sendMessage(
        chatId,
        `Ваше имя - ${msg.from.first_name}\nВаш никнейм - ${msg.from.username}`
      );
    }

    if (text === '/game') {
      return startGame(chatId);
    }

    return bot.sendMessage(chatId, 'Я вас не понимаю, повторите еще раз!');
  });

  // Обработка кнопок
  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    if (data === '/again') {
      return startGame(chatId);
    }
    if (data === chats[chatId]) {
      return bot.sendMessage(chatId, `Ты отгадал(а) цифру ${data}`, againOptions);
    } else {
      return bot.sendMessage(
        chatId,
        `Ты не отгадал(а) цифру, бот загадал цифру ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
