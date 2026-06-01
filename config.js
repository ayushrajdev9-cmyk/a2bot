require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  openaiKey: process.env.OPENAI_API_KEY,
  ownerId: process.env.OWNER_ID || null,
  ownerName: 'Ayushrajdev Anzariqbal',
  openrouterKey: process.env.OPENROUTER_KEY,
  prefix: process.env.PREFIX || '!',
  colors: {
    primary: 0x5865F2,
    success: 0x57F287,
    warning: 0xFEE75C,
    error: 0xED4245,
  },
  emojis: {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    music: '🎵',
    fun: '🎮',
    mod: '🛡️',
    ai: '🤖',
    ticket: '🎫',
    poll: '📊',
  },
};
