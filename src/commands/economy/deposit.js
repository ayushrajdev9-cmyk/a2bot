const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Deposit coins into your bank')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount to deposit')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [] };

    if (userData.balance < amount) {
      return interaction.reply({
        embeds: [embeds.error(`You only have **${userData.balance}** coins to deposit.`)],
      });
    }

    userData.balance -= amount;
    userData.bank += amount;
    db.set('economy', interaction.user.id, userData);

    await interaction.reply({
      embeds: [embeds.success(`Deposited **${amount}** coins into your bank.`)],
    });
  },
};
