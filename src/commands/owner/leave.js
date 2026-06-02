const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave-server')
    .setDescription('Make the bot leave a server')
    .addStringOption(o => o.setName('server_id').setDescription('The ID of the server to leave').setRequired(true)),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You do not have permission to use this command.')], ephemeral: true });
    }

    const serverId = interaction.options.getString('server_id');
    const guild = client.guilds.cache.get(serverId);

    if (!guild) {
      return interaction.reply({ embeds: [embeds.error('Error', `No server found with ID \`${serverId}\`.`)] });
    }

    const name = guild.name;
    await guild.leave();
    logger.info(`Left server: ${name} (${serverId})`);

    await interaction.reply({ embeds: [embeds.success('Left Server', `Successfully left **${name}** (\`${serverId}\`).`)] });
  },
};
