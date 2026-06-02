const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moveall')
    .setDescription('Move all members from your voice channel to another')
    .addChannelOption(o => o.setName('target_channel').setDescription('Target voice channel').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),
  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('target_channel');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You are not in a voice channel.')], ephemeral: true });
    }
    if (targetChannel.type !== 2) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Please select a voice channel.')], ephemeral: true });
    }

    const members = voiceChannel.members.filter(m => !m.user.bot);
    if (!members.size) {
      return interaction.reply({ embeds: [embeds.error('Error', 'No members to move.')], ephemeral: true });
    }

    let moved = 0;
    for (const [, member] of members) {
      try {
        await member.voice.setChannel(targetChannel.id);
        moved++;
      } catch (err) {
        logger.error(`Failed to move ${member.user.tag}:`, err);
      }
    }

    await interaction.reply({ embeds: [embeds.success('Moved', `Moved **${moved}** member(s) to ${targetChannel}.`)] });
  },
};
