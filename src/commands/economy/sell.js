const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const items = {
  'Fishing Rod': 100,
  'Hunting Rifle': 150,
  'Mining Pick': 200,
  'Lottery Ticket': 50,
  'Healing Potion': 75,
  'Lucky Charm': 300,
  'Pizza': 25,
  'Laptop': 500,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell an item from your inventory')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item to sell')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Quantity to sell')
        .setRequired(false)
        .setMinValue(1)),
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;

    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [] };

    const invItem = userData.inventory.find(
      i => i.item.toLowerCase() === itemName.toLowerCase(),
    );

    if (!invItem || invItem.quantity < quantity) {
      return interaction.reply({
        embeds: [embeds.error(`You don't have enough **${itemName}** to sell.`)],
      });
    }

    const price = Object.keys(items).find(
      k => k.toLowerCase() === itemName.toLowerCase(),
    );
    if (!price) {
      return interaction.reply({
        embeds: [embeds.error(`**${itemName}** cannot be sold.`)],
      });
    }

    const sellPrice = Math.floor((items[price] * quantity) / 2);
    invItem.quantity -= quantity;

    if (invItem.quantity <= 0) {
      userData.inventory = userData.inventory.filter(i => i.item !== invItem.item);
    }

    userData.balance += sellPrice;
    db.set('economy', interaction.user.id, userData);

    await interaction.reply({
      embeds: [embeds.success(`Sold **${quantity}x ${invItem.item}** for **${sellPrice}** coins.`)],
    });
  },
};
