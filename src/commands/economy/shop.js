const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const items = [
  { name: 'Fishing Rod', price: 100 },
  { name: 'Hunting Rifle', price: 150 },
  { name: 'Mining Pick', price: 200 },
  { name: 'Lottery Ticket', price: 50 },
  { name: 'Healing Potion', price: 75 },
  { name: 'Lucky Charm', price: 300 },
  { name: 'Pizza', price: 25 },
  { name: 'Laptop', price: 500 },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View items available for purchase'),
  async execute(interaction) {
    const embed = embeds.info()
      .setTitle('🛒 Shop')
      .setDescription('Use `/buy <item> [quantity]` to purchase.');

    items.forEach(item => {
      embed.addFields({ name: item.name, value: `${item.price} coins`, inline: true });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
