const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),
  async execute(interaction) {
    const res = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await res.json();
    await interaction.reply({
      embeds: [embeds.info('😂 Random Joke', `${data.setup}\n\n${data.punchline}`)],
    });
  },
};
