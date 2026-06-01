const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../commands');
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const stat = fs.statSync(categoryPath);
    if (!stat.isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        logger.info(`Loaded command: ${category}/${command.data.name}`);
      } else {
        logger.warn(`Command ${file} missing required data/execute`);
      }
    }
  }
}

module.exports = { loadCommands };
