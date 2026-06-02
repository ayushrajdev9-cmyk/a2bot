const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '⭐'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');

    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [] };

    if (userData.balance < bet) {
      return interaction.reply({
        embeds: [embeds.error(`You don't have enough coins. You have **${userData.balance}** coins.`)],
      });
    }

    userData.balance -= bet;

    const win = Math.random() < 0.35;
    let reels;
    let winnings = 0;

    if (win) {
      const jackpot = Math.random() < 0.2;
      if (jackpot) {
        const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        reels = [sym, sym, sym];
        winnings = Math.floor(bet * 3);
      } else {
        const sym1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        let sym2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        while (sym2 === sym1) {
          sym2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        }
        const pos = Math.floor(Math.random() * 3);
        if (pos === 0) reels = [sym1, sym1, sym2];
        else if (pos === 1) reels = [sym1, sym2, sym1];
        else reels = [sym2, sym1, sym1];
        winnings = Math.floor(bet * 1.5);
      }
    } else {
      do {
        reels = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];
      } while (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]);
    }

    if (winnings > 0) {
      userData.balance += winnings;
      if (!userData.totalEarned) userData.totalEarned = 0;
      userData.totalEarned += winnings;
    } else {
      if (!userData.totalLost) userData.totalLost = 0;
      userData.totalLost += bet;
    }

    db.set('economy', interaction.user.id, userData);

    const description = `${reels.join(' | ')}\n\n${winnings > 0 ? `You won **${winnings}** coins!` : 'You lost. Better luck next time.'}`;
    const embed = embeds.info()
      .setTitle('🎰 Slots')
      .setDescription(description);

    await interaction.reply({ embeds: [embed] });
  },
};
