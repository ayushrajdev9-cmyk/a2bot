const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and clear the queue'),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    if (!queue.connection) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Not in a voice channel.')], ephemeral: true });
    }

    queue.tracks = [];
    queue.player?.stop();
    queue.connection.destroy();
    await interaction.reply({ embeds: [embeds.success('Stopped', 'Stopped playback and cleared the queue.')] });
  },
};
