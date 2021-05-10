# Telegram test-bot

### Useful links:

- [node-telegram-bot-api documentation](https://github.com/yagop/node-telegram-bot-api)
- [node-telegram-bot-api webhook for heroku](https://github.com/yagop/node-telegram-bot-api/blob/master/examples/webhook/heroku.js)
- [Telegram stickers](https://tlgrm.ru/stickers)
- [Config vars heroku](https://devcenter.heroku.com/articles/config-vars)

### Try bot locally

1. Create your own bot using Telegram's [BotFather](https://core.telegram.org/bots#3-how-do-i-create-a-bot) and grab your TOKEN.
2. Clone or download and unpack this repo.
3. Go to the app's folder using `cd telegram-bot`
4. Run `npm install` or `yarn install`.
5. Rename config-example.env file into .env and set TOKEN to the value, you've got from the BotFather.
6. Run `npm start` or `yarn start` and send smth to your bot.
7. After it says "Welcome" to you, we can go to the next step.

### Deploy your bot to the heroku

1. Create the [Heroku account](https://heroku.com) and install the [Heroku Toolbelt](https://toolbelt.heroku.com/).
2. Login to your Heroku account using `heroku login`.
3. Go to the app's folder using `cd heroku-node-telegram-bot`
4. Run `heroku config:set TOKEN=SET HERE THE TOKEN YOU'VE GOT FROM THE BOTFATHER` and `heroku config:set HEROKU_URL=$(heroku info -s | grep web_url | cut -d= -f2)` or enter them manually into heroku (shown below in the screenshot) to configure environment variables on the server.
5. Run `git add . && git commit -m "Ready to run on heroku" && git push heroku master` to deploy your bot to the Heroku server.
6. Send smth to the bot to check out if it works ok.

<div align="center" >
  <h3>Screenshot</h3>
  <img style="margin:50px 0;" src="screenshot.png" />
</div>

### Code notes

- **Module todo: display datetime in 24 hour format**

  ```js
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
      const curDate = new Date().getHours() + ':' + new Date().getMinutes();
      if (notes[i]['time'] === curDate) {
        bot.sendMessage(
          notes[i]['uid'],
          'I remind you that you must: ' + notes[i]['text'] + ' now.'
        );
        notes.splice(i, 1);
      }
    }
  }, 1000);
  ```

- **Game: 'guess the number'**

  ```js
  bot.onText(/\/guess (.+)/, function (msg, match) {
    const randomNumber = Math.floor(Math.random() * 10);
    const chatId = msg.chat.id;
    const number = match[1];

    if (number == randomNumber) {
      bot.sendMessage(chatId, 'You win!');
    } else {
      bot.sendMessage(chatId, 'You lose!');
    }
  });
  ```
