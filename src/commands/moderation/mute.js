const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a member')
    .addUserOption(o => o.setName('target').setDescription('Member to timeout').setRequired(true))
    .addIntegerOption(o => o.setName('duration').setDescription('Duration in minutes').setRequired(true).setMinValue(1))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the timeout'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in this server.')], ephemeral: true });
    }
    if (!target.moderatable) {
      return interaction.reply({ embeds: [embeds.error('Error', 'I cannot timeout that member.')], ephemeral: true });
    }

    const ms = duration * 60 * 1000;
    await target.timeout(ms, reason);
    logger.info(`${interaction.user.tag} muted ${target.user.tag} for ${duration}m: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Muted', `${target.user.tag} has been timed out for ${duration} minute(s).\nReason: ${reason}`)] });
  },
};
