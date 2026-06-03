const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const res = await fetch('https://official-joke-api.appspot.com/random_joke');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      await interaction.editReply({
        embeds: [embeds.info('😂 Random Joke', `${data.setup}\n\n${data.punchline}`)],
      });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch a joke. Try again later.')] });
    }
  },
};
