const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const embeds = require('../../utils/embeds');

function getBal(userId) {
  return db.get('economy', userId) || { balance: 100, lastDaily: 0 };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Economy system')
    .addSubcommand(s => s.setName('balance').setDescription('Check your balance'))
    .addSubcommand(s => s.setName('daily').setDescription('Claim your daily reward'))
    .addSubcommand(s => s.setName('gamble').setDescription('Gamble your coins').addIntegerOption(o => o.setName('amount').setDescription('Amount to gamble').setRequired(true).setMinValue(1))),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const data = getBal(userId);

    switch (sub) {
      case 'balance': {
        await interaction.reply({ embeds: [embeds.info('Balance', `${interaction.user} has **${data.balance}** coins.`)] });
        break;
      }
      case 'daily': {
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;
        if (now - data.lastDaily < cooldown) {
          const remaining = Math.ceil((cooldown - (now - data.lastDaily)) / 3600000);
          return interaction.reply({ embeds: [embeds.warning('Cooldown', `Come back in ${remaining} hour(s).`)], ephemeral: true });
        }
        data.balance += 50;
        data.lastDaily = now;
        db.set('economy', userId, data);
        await interaction.reply({ embeds: [embeds.success('Daily Reward', `You received **50** coins! Balance: **${data.balance}**`)] });
        break;
      }
      case 'gamble': {
        const amount = interaction.options.getInteger('amount');
        if (amount > data.balance) {
          return interaction.reply({ embeds: [embeds.error('Error', 'Insufficient funds.')], ephemeral: true });
        }
        const win = Math.random() < 0.45;
        if (win) {
          data.balance += amount;
          await interaction.reply({ embeds: [embeds.success('You Won!', `You doubled your **${amount}** coins! Balance: **${data.balance}**`)] });
        } else {
          data.balance -= amount;
          await interaction.reply({ embeds: [embeds.error('You Lost!', `You lost **${amount}** coins. Balance: **${data.balance}**`)] });
        }
        db.set('economy', userId, data);
        break;
      }
    }
  },
};
