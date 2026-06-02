const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const embeds = require('../../utils/embeds');

const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];
const payouts = { '🍒': 2, '🍋': 3, '🍊': 4, '🍇': 5, '🔔': 10, '💎': 20, '7️⃣': 50 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('Play the slot machine')
    .addIntegerOption(o => o.setName('bet').setDescription('Amount to bet').setRequired(true).setMinValue(1)),
  async execute(interaction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const data = db.get('economy', userId) || { balance: 100 };
    if (bet > data.balance) {
      return interaction.reply({ embeds: [embeds.error('Insufficient Funds', `You only have **${data.balance}** coins.`)], ephemeral: true });
    }

    const reels = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    const allSame = reels.every(r => r === reels[0]);
    const twoSame = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];

    let winnings = 0;
    if (allSame) winnings = bet * (payouts[reels[0]] || 5) * 2;
    else if (twoSame) winnings = Math.floor(bet * 1.5);

    data.balance += winnings - bet;
    db.set('economy', userId, data);

    const line = reels.join(' | ');
    const result = winnings > 0
      ? `You won **${winnings}** coins! 🎉`
      : 'Better luck next time!';
    await interaction.reply({
      embeds: [embeds.info('🎰 Slot Machine', `**[ ${line} ]**\n\n${result}\nBalance: **${data.balance}** coins`)],
    });
  },
};
