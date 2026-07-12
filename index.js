const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config');
const { loadEvents } = require('./src/handlers/eventHandler');
const { loadCommands } = require('./src/handlers/commandHandler');
const logger = require('./src/utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.config = config;

loadEvents(client);
loadCommands(client);

const db = require('./src/utils/database');

function checkVpsExpiry() {
  const allVps = db.all('vps');
  const { execSync } = require('child_process');
  for (const [name, vps] of Object.entries(allVps)) {
    if (vps.status !== 'expired' && vps.status !== 'stopped' && Date.now() > vps.expiresAt) {
      vps.status = 'expired';
      db.set('vps', name, vps);
      logger.info(`VPS "${name}" auto-expired`);
      try { execSync(`/usr/local/bin/vps-manager destroy "${name}"`, { timeout: 5000 }); } catch {}
    }
  }
}

setInterval(checkVpsExpiry, 60000);
checkVpsExpiry();

client.login(config.token).catch((err) => logger.error('Failed to login:', err));
