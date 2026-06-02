const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set playback volume')
    .addIntegerOption(o => o.setName('level').setDescription('Volume level (0-100)').setRequired(true).setMinValue(0).setMaxValue(100)),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    const level = interaction.options.getInteger('level');
    queue.volume = level;

    await interaction.reply({ embeds: [embeds.success('Volume', `Volume set to **${level}%**.${queue.player ? ' It will be applied to the next track.' : ''}`)] });
  },
};
