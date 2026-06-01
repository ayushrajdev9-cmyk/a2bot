const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(o => o.setName('target').setDescription('Member to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in this server.')], ephemeral: true });
    }
    if (!target.kickable) {
      return interaction.reply({ embeds: [embeds.error('Error', 'I cannot kick that member.')], ephemeral: true });
    }

    await target.kick(reason);
    logger.info(`${interaction.user.tag} kicked ${target.user.tag}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Kicked', `${target.user.tag} has been kicked.\nReason: ${reason}`)] });
  },
};
