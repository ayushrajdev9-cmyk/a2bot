const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join your voice channel'),
  async execute(interaction) {
    const member = interaction.member;
    const channel = member.voice.channel;
    if (!channel) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You must be in a voice channel.')], ephemeral: true });
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    await interaction.reply({ embeds: [embeds.success('Joined', `Joined ${channel.name}`)] });
  },
};
