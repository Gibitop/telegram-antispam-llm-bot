# Telegram antispam LLM bot

This is a telegram bot, that uses an LLM to scan messages in telegram groups and flag or delete them if the message is considered spam by an LLM


## Usage

### Create a bot
Go to `@BotFather` in telegram and create a bot. Write down the token `@BotFather` gave you

### Add your bot to a group
Usually you must be the admin to do it

If you want the bot to only flag the spam messages, it does not need any admin permissions

If you want the bot to delete the spam messages, make sure to give your bot permission to delete messages in your group

Make sure you give your bot access to read all messages in the group, not only ones directed to your bot


### Deployment

Any machine with access to internet will do. No public ip needed

Currently the bot only works in polling mode. The option to use telegram webhooks will be added in the future

Create a `.env` file or pass envs according to the [env section](#Env)

You can deploy the code with or without docker


#### With docker and docker-compose

Clone this repo

Run
```
docker compose up -d
```


#### Without docker

This repo is targeted towards the `bun` runtime, but there is no bun specific code in this repo. If you want, you can make it work with `node` or `deno`

Install dependecies
```
bun install --frozen-lockfile --production
```

Run the application
```
bun run start
```


## Env

### `LLM_ENDPOINT`

**Description**: OpenAI API compatible URL for LLM access

**Required**: Yes

**Example**:
```
https://openrouter.ai/api/v1
```


### `LLM_API_KEY`

**Description**: API key to authorize usage of the LLM. You can get it from your LLM API provider

**Required**: Yes


### `MODEL`

**Description**: Name of an LLM you want to use for spam detection

**Required**: Yes

**Comment**: Choose a smart enough model to have few false positive results, but small and cheap enough, so it runs fast and does not cost you much to run

**Example**:
```
z-ai/glm-4-32b
```


### `SYSTEM_PROMPT`

**Description**: OpenAI API compatible URL for LLM access

**Required**: Yes

**Comment**: The example prompt is written in russian, because the bot was originally developed for a russian telegram group. Feel free to change the prompt to suit you needs.\
Make sure your prompt asks your model to return a json object with `"spam": true` or `"spam": false`. This is required for the code to work\
Interesting thing is adding `confidence` and `trigger` fields to the spam response. The model does not actually fill out these fields with useful information, but their pure existence lowers the false positives

**Example**:
```
Ты фильтр спама.
Пользователь пишет сообщение, а ты отвечаешь спам это или нет.
В случае, если это спам, ты отвечаешь {"confidence": 0.7, "trigger": "почему спам", "spam": true}
В случае, если это не спам, ты отвечаешь {"spam": false}
Спамом считаются сообщение об обмене криптовалют: таких как USDT, BTC, Tether, А также сообщения с обманом, предложением быстрого легкого заработка
Сообщения с комментариями по типу "как надоели эти спам-боты" и другими обсуждаениями спама не считаются спамом
```


### `TELEGRAM_BOT_TOKEN`

**Description**: Bot token for your bot given to you by `@BotFather`

**Required**: Yes


### `TELEGRAM_CHAT_IDS`
**Description**: Comma separated list of chat ids of groups and supper groups this bot will work with. Basically a whitelist

**Required**: No, defaults to working with every chat the bot added to

**Example**:
```
-123123123,-456456456456,789789789
```
Or
```
-123123123
```


### `REACT_NON_SPAM`
**Description**: Whether or not to log and add an `👌🏻` reaction to messages that are considered not spam. Useful for debugging

**Required**: No, defaults `false`

**Example**:
```
true
```
Or
```
false
```



### `DELETE_SPAM`
**Description**: When `true`, the messages that are considered spam are deleted by the bot. When false, bot only adds the `🗿` reaction to spam messages. Useful for debugging

**Required**: No, defaults `false`

**Example**:
```
true
```
Or
```
false
```
