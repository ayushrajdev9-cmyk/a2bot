const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    const name = file.replace('.js', '');
    if (event.once) {
      client.once(name, (...args) => event.execute(...args, client));
    } else {
      client.on(name, (...args) => event.execute(...args, client));
    }
    logger.info(`Loaded event: ${name}`);
  }
}

module.exports = { loadEvents };
