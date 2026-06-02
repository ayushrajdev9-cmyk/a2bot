const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicekick')
    .setDescription('Disconnect a user from voice channel')
    .addUserOption(o => o.setName('user').setDescription('User to disconnect').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for disconnecting'))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const target = interaction.options.getMember('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!target) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in this server.')], ephemeral: true });
    }
    if (!target.voice.channel) {
      return interaction.reply({ embeds: [embeds.error('Error', 'That user is not in a voice channel.')], ephemeral: true });
    }

    await target.voice.disconnect();
    logger.info(`${interaction.user.tag} voice-kicked ${target.user.tag}: ${reason}`);
    await interaction.reply({ embeds: [embeds.success('Voice Kicked', `${target.user.tag} has been disconnected from voice.\nReason: ${reason}`)] });
  },
};
