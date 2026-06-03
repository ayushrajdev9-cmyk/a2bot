const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set loop mode')
    .addStringOption(o => o.setName('mode').setDescription('Loop mode').addChoices(
      { name: 'Off', value: 'off' },
      { name: 'Song', value: 'song' },
      { name: 'Queue', value: 'queue' },
    )),
  async execute(interaction) {
    const { getQueue } = require('./play');
    const queue = getQueue(interaction.guild.id);

    const modes = ['off', 'song', 'queue'];
    const mode = interaction.options.getString('mode');
    const nextMode = mode || modes[(modes.indexOf(queue.loopMode || 'off') + 1) % modes.length];

    queue.loopMode = nextMode;

    const modeLabels = { off: 'Off', song: 'Song', queue: 'Queue' };
    await interaction.reply({ embeds: [embeds.success('Loop', `Loop mode set to **${modeLabels[nextMode]}**.`)] });
  },
};
