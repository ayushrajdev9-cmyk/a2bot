const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

const messages = [
  'Absolutely terrible', 'Pretty bad', 'Below average', 'Meh',
  'Decent', 'Not bad', 'Pretty good', 'Great', 'Amazing', 'Outstanding',
  'Perfect!',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Rate something')
    .addStringOption(o => o.setName('thing').setDescription('Thing to rate').setRequired(true)),
  async execute(interaction) {
    const thing = interaction.options.getString('thing');
    const rating = Math.floor(Math.random() * 11);
    const msg = messages[rating];
    const stars = '⭐'.repeat(Math.max(1, Math.ceil(rating / 2)));
    await interaction.reply({
      embeds: [embeds.info('📊 Rating', `**${thing}**\n\nRating: **${rating}/10**\n${msg}\n${stars}`)],
    });
  },
};
