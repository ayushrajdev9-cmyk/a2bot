const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const COOLDOWN = 60 * 60 * 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to rob')
        .setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('user');

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embeds.error('You cannot rob yourself.')] });
    }
    if (target.bot) {
      return interaction.reply({ embeds: [embeds.error('You cannot rob a bot.')] });
    }

    let robberData = db.get('economy', interaction.user.id);
    if (!robberData) robberData = { balance: 0, bank: 0, inventory: [], lastRob: 0 };

    const now = Date.now();
    if (now - (robberData.lastRob || 0) < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - (robberData.lastRob || 0))) / 60000);
      return interaction.reply({
        embeds: [embeds.warning(`You must wait **${remaining}** minutes before robbing again.`)],
      });
    }

    let targetData = db.get('economy', target.id);
    if (!targetData) targetData = { balance: 0, bank: 0, inventory: [] };

    if (targetData.balance < 50) {
      return interaction.reply({
        embeds: [embeds.error(`${target.username} has less than **50** coins. Not worth robbing.`)],
      });
    }

    const success = Math.random() < 0.4;

    if (success) {
      const stealPercent = Math.random() * 0.2 + 0.1;
      const stolenAmount = Math.floor(targetData.balance * stealPercent);

      targetData.balance -= stolenAmount;
      robberData.balance += stolenAmount;
      robberData.lastRob = now;
      if (!robberData.totalEarned) robberData.totalEarned = 0;
      robberData.totalEarned += stolenAmount;

      db.set('economy', interaction.user.id, robberData);
      db.set('economy', target.id, targetData);

      await interaction.reply({
        embeds: [embeds.success(`You robbed **${target.username}** and stole **${stolenAmount}** coins!`)],
      });
    } else {
      const fine = Math.floor(robberData.balance * 0.25);

      robberData.balance -= fine;
      targetData.balance += fine;
      robberData.lastRob = now;
      if (!robberData.totalLost) robberData.totalLost = 0;
      robberData.totalLost += fine;

      db.set('economy', interaction.user.id, robberData);
      db.set('economy', target.id, targetData);

      await interaction.reply({
        embeds: [embeds.error(`You got caught! Paid **${fine}** coins to **${target.username}** as compensation.`)],
      });
    }
  },
};
