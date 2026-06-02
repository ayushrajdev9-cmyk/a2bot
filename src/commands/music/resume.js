const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused track'),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    if (!queue.player || !queue.tracks.length) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Nothing is playing.')], ephemeral: true });
    }

    queue.player.unpause();
    await interaction.reply({ embeds: [embeds.success('Resumed', 'Resumed playback.')] });
  },
};
