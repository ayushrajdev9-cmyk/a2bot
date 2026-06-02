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
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('The item to buy')
        .setRequired(true)
        .addChoices(
          { name: 'Fishing Rod', value: 'Fishing Rod' },
          { name: 'Hunting Rifle', value: 'Hunting Rifle' },
          { name: 'Mining Pick', value: 'Mining Pick' },
          { name: 'Lottery Ticket', value: 'Lottery Ticket' },
          { name: 'Healing Potion', value: 'Healing Potion' },
          { name: 'Lucky Charm', value: 'Lucky Charm' },
          { name: 'Pizza', value: 'Pizza' },
          { name: 'Laptop', value: 'Laptop' },
        ))
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Quantity to buy')
        .setRequired(false)
        .setMinValue(1)),
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;
    const price = items[itemName];
    const totalCost = price * quantity;

    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [] };

    if (userData.balance < totalCost) {
      return interaction.reply({
        embeds: [embeds.error(`You need **${totalCost}** coins but only have **${userData.balance}**.`)],
      });
    }

    userData.balance -= totalCost;

    const existing = userData.inventory.find(i => i.item === itemName);
    if (existing) {
      existing.quantity += quantity;
    } else {
      userData.inventory.push({ item: itemName, quantity });
    }

    db.set('economy', interaction.user.id, userData);

    await interaction.reply({
      embeds: [embeds.success(`Purchased **${quantity}x ${itemName}** for **${totalCost}** coins.`)],
    });
  },
};
