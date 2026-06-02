const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Withdraw coins from your bank')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to withdraw')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [] };

    if (userData.bank < amount) {
      return interaction.reply({
        embeds: [embeds.error(`You only have **${userData.bank}** coins in your bank.`)],
      });
    }

    userData.balance += amount;
    userData.bank -= amount;
    db.set('economy', interaction.user.id, userData);

    await interaction.reply({
      embeds: [embeds.success(`Withdrew **${amount}** coins from your bank.`)],
    });
  },
};
