const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current track'),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    if (!queue.player || !queue.tracks.length) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Nothing is playing.')], ephemeral: true });
    }

    queue.player.pause();
    await interaction.reply({ embeds: [embeds.success('Paused', 'Paused the current track.')] });
  },
};
