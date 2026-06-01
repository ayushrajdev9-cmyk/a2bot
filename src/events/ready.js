const logger = require('../utils/logger');

module.exports = {
  once: true,
  execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('/help | a2bot', { type: 3 });
  },
};
