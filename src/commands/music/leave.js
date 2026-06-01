const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the voice channel'),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Not in a voice channel.')], ephemeral: true });
    }

    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);
    queue.tracks = [];
    queue.player?.stop();
    connection.destroy();

    await interaction.reply({ embeds: [embeds.success('Left', 'Left the voice channel.')] });
  },
};
