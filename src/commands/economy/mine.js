const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const COOLDOWN = 2 * 60 * 1000;
const ores = ['Coal', 'Iron', 'Gold', 'Diamond', 'Emerald', 'Ruby', 'Copper'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Go mining for valuable ores'),
  async execute(interaction) {
    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [], lastMine: 0 };

    const now = Date.now();
    if (now - (userData.lastMine || 0) < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - (userData.lastMine || 0))) / 60000);
      return interaction.reply({
        embeds: [embeds.warning(`You must wait **${remaining}** minutes before mining again.`)],
      });
    }

    userData.lastMine = now;
    const found = Math.random() < 0.5;

    if (found) {
      const earned = Math.floor(Math.random() * 71) + 10;
      const ore = ores[Math.floor(Math.random() * ores.length)];

      userData.balance += earned;
      if (!userData.totalEarned) userData.totalEarned = 0;
      userData.totalEarned += earned;
      db.set('economy', interaction.user.id, userData);

      await interaction.reply({
        embeds: [embeds.success(`⛏️ You mined **${ore}** and earned **${earned}** coins!`)],
      });
    } else {
      db.set('economy', interaction.user.id, userData);
      await interaction.reply({
        embeds: [embeds.error('⛏️ You mined but found nothing valuable.')],
      });
    }
  },
};
