const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Give a random compliment')
    .addUserOption(o => o.setName('user').setDescription('User to compliment').setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const res = await fetch('https://complimentr.com/api');
    const data = await res.json();
    await interaction.reply({
      embeds: [embeds.success('💖 Compliment', `${target}, ${data.compliment}`)],
    });
  },
};
