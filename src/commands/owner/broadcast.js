const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('broadcast')
    .setDescription('Send a message to all servers')
    .addStringOption(o => o.setName('message').setDescription('The message to broadcast').setRequired(true)),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You do not have permission to use this command.')], ephemeral: true });
    }

    const message = interaction.options.getString('message');
    let sent = 0;
    let failed = 0;

    await interaction.deferReply();

    for (const guild of client.guilds.cache.values()) {
      try {
        let channel = guild.systemChannel;
        if (!channel) {
          channel = guild.channels.cache.find(c => c.name === 'announcements' && c.isTextBased());
        }
        if (channel) {
          await channel.send(message);
          sent++;
        }
      } catch (err) {
        logger.warn(`Broadcast failed to ${guild.name}: ${err.message}`);
        failed++;
      }
    }

    await interaction.editReply({ embeds: [embeds.success('Broadcast Complete', `Sent to **${sent}** servers${failed ? `, failed in **${failed}**` : ''}.`)] });
  },
};
