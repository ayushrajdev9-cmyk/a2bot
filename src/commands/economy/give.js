const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Give coins to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to receive coins')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of coins to give')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embeds.error('Invalid Target', 'You cannot give coins to yourself.')] });
    }

    let senderData = db.get('economy', interaction.user.id);
    if (!senderData) senderData = { balance: 0, bank: 0, inventory: [] };

    if (senderData.balance < amount) {
      return interaction.reply({
        embeds: [embeds.error('Insufficient Funds', `You don't have enough coins. You have **${senderData.balance}** coins.`)],
      });
    }

    let targetData = db.get('economy', target.id);
    if (!targetData) targetData = { balance: 0, bank: 0, inventory: [] };

    senderData.balance -= amount;
    targetData.balance += amount;

    db.set('economy', interaction.user.id, senderData);
    db.set('economy', target.id, targetData);

    await interaction.reply({
      embeds: [embeds.success('Transfer Complete', `Gave **${amount}** coins to **${target.username}**.`)],
    });
  },
};
