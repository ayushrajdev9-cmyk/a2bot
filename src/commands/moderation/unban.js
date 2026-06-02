const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by ID')
    .addStringOption(o => o.setName('user_id').setDescription('ID of the user to unban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the unban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const ban = await interaction.guild.bans.fetch(userId);
      if (!ban) {
        return interaction.reply({ embeds: [embeds.error('Error', 'That user is not banned.')], ephemeral: true });
      }
      await interaction.guild.members.unban(userId, reason);
      logger.info(`${interaction.user.tag} unbanned ${ban.user.tag} (${userId}): ${reason}`);
      await interaction.reply({ embeds: [embeds.success('Unbanned', `${ban.user.tag} has been unbanned.\nReason: ${reason}`)] });
    } catch {
      return interaction.reply({ embeds: [embeds.error('Error', 'Could not find or unban that user.')], ephemeral: true });
    }
  },
};
