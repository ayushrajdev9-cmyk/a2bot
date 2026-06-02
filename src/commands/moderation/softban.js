const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban then immediately unban a user (clears their messages)')
    .addUserOption(o => o.setName('user').setDescription('Member to softban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the softban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in this server.')], ephemeral: true });
    }
    if (!target.bannable) {
      return interaction.reply({ embeds: [embeds.error('Error', 'I cannot softban that member.')], ephemeral: true });
    }

    await target.ban({ reason: `${reason} (Softban)` });
    await interaction.guild.members.unban(target.id, 'Softban complete');
    logger.info(`${interaction.user.tag} softbanned ${target.user.tag}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Softbanned', `${target.user.tag} has been softbanned.\nReason: ${reason}`)] });
  },
};
