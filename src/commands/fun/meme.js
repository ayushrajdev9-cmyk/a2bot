const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

const memes = [
  { title: 'When the code finally works', image: 'https://i.imgur.com/4sJqXcB.jpeg' },
  { title: 'My brain during debugging', image: 'https://i.imgur.com/6JcP0bS.jpeg' },
  { title: 'Discord bot developers', image: 'https://i.imgur.com/XqKcJbR.jpeg' },
  { title: 'When you forget a semicolon', image: 'https://i.imgur.com/9vZBqWm.jpeg' },
  { title: 'JavaScript in a nutshell', image: 'https://i.imgur.com/L2vQFgW.jpeg' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),
  async execute(interaction) {
    const meme = memes[Math.floor(Math.random() * memes.length)];
    const embed = embeds.info(meme.title).setImage(meme.image);
    await interaction.reply({ embeds: [embed] });
  },
};
