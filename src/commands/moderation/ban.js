const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(o => o.setName('target').setDescription('Member to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in this server.')], ephemeral: true });
    }
    if (!target.bannable) {
      return interaction.reply({ embeds: [embeds.error('Error', 'I cannot ban that member.')], ephemeral: true });
    }

    await target.ban({ reason });
    logger.info(`${interaction.user.tag} banned ${target.user.tag}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Banned', `${target.user.tag} has been banned.\nReason: ${reason}`)] });
  },
};
