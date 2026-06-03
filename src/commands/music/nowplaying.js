const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

function progressBar(current, total, length = 15) {
  if (total <= 0) return '━'.repeat(length);
  const filled = Math.round((current / total) * length);
  return '█'.repeat(filled) + '░'.repeat(length - filled);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing track'),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    if (!queue.tracks.length) {
      return interaction.reply({ embeds: [embeds.info('Now Playing', 'Nothing is playing right now.')] });
    }

    const track = queue.tracks[0];
    if (!queue.currentTrack) queue.currentTrack = { title: track.title, url: track.url, duration: track.duration || 0, startTime: Date.now() };

    const elapsed = Math.floor((Date.now() - queue.currentTrack.startTime) / 1000);
    const duration = queue.currentTrack.duration || 0;
    const bar = progressBar(elapsed, duration);
    const timestamp = duration > 0 ? `${formatTime(elapsed)} / ${formatTime(duration)}` : '🔴 Live';

    const embed = embeds.info('Now Playing', `**[${queue.currentTrack.title}](${queue.currentTrack.url})**\n\n\`${bar}\` ${timestamp}`);

    await interaction.reply({ embeds: [embed] });
  },
};
