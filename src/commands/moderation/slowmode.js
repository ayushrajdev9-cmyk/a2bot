const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode')
    .addIntegerOption(o => o.setName('seconds').setDescription('Slowmode in seconds (0-21600)').setRequired(true).setMinValue(0).setMaxValue(21600))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.channel;

    await channel.setRateLimitPerUser(seconds);
    logger.info(`${interaction.user.tag} set slowmode in #${channel.name} to ${seconds}s`);
    const msg = seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode has been set to ${seconds} second(s).`;
    await interaction.reply({ embeds: [embeds.success('Slowmode Updated', `#${channel.name}: ${msg}`)] });
  },
};
