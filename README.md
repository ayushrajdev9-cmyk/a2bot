# a2bot — All-in-One Discord Bot

An all-in-one Discord bot created by **Ayushrajdev Anzariqbal**. Moderates, plays music, runs economy, chats with AI, sets up servers, generates improvement reports, and more.
you should try it its opensource 
## Features

| Category | Commands |
|----------|----------|
| 🛡️ **Moderation** | `/kick`, `/ban`, `/mute`, `/purge`, `/warn` |
| 🎵 **Music** | `/join`, `/play`, `/skip`, `/queue`, `/stop`, `/leave` |
| 🎮 **Fun** | `/meme`, `/trivia`, `/economy`, `/rps` |
| ⚙️ **Utility** | `/ping`, `/reminder`, `/poll`, `/ticket` |
| 🤖 **AI Chat** | `/chat` — powered by OpenRouter |
| 🏗️ **Server Setup** | `/setup` — auto-creates full server structure |
| 📈 **Server Improve** | `/improve` — analyzes & recommends improvements |
| 🔧 **Owner** | `/eval` — execute code (owner only) |
| 🛠️ **Configuration** | `/roles set-welcome`, `/roles set-suggestions`, `/roles set-autorole` |

## Quick Start

1. **Clone & install**
   ```bash
   git clone https://github.com/ayushrajdev9-cmyk/a2bot.git
   cd a2bot
   npm install
   ```

2. **Configure** — copy `.env.example` to `.env` and fill in:
   ```
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_bot_client_id
   OWNER_ID=your_discord_user_id
   OPENROUTER_KEY=your_openrouter_key
   ```

3. **Deploy commands & run**
   ```bash
   npm run deploy
   npm start
   ```

## Requirements

- Node.js 18+
- A [Discord Application](https://discord.com/developers/applications) with bot token
- An [OpenRouter](https://openrouter.ai) API key (free) for AI chat

## License

MIT — free to use, modify, and distribute.
yayyy i hope this repo will gaim some stars yayyyy
