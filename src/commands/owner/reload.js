const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload a command')
    .addStringOption(o => o.setName('category').setDescription('Command category folder').setRequired(true))
    .addStringOption(o => o.setName('command').setDescription('Command name').setRequired(true)),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You do not have permission to use this command.')], ephemeral: true });
    }

    const category = interaction.options.getString('category');
    const commandName = interaction.options.getString('command').toLowerCase();

    const commandPath = path.join(__dirname, '..', category, `${commandName}.js`);
    if (!fs.existsSync(commandPath)) {
      return interaction.reply({ embeds: [embeds.error('Error', `Command \`${commandName}\` not found in category \`${category}\`.`)] });
    }

    delete require.cache[require.resolve(commandPath)];
    const command = require(commandPath);

    if (!command.data || !command.execute) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Command file is missing required data/execute properties.')] });
    }

    client.commands.set(command.data.name, command);
    logger.info(`Reloaded command: ${category}/${command.data.name}`);

    await interaction.reply({ embeds: [embeds.success('Reloaded', `Successfully reloaded \`${command.data.name}\` from \`${category}\`.`)] });
  },
};
