const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the music queue'),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    if (!queue.tracks.length) {
      return interaction.reply({ embeds: [embeds.info('Queue', 'The queue is empty.')] });
    }

    const list = queue.tracks.map((t, i) => `${i === 0 ? '**Now Playing:**' : `**${i}.**`} [${t.title}](${t.url})`).join('\n');
    await interaction.reply({ embeds: [embeds.info('Music Queue', list)] });
  },
};
