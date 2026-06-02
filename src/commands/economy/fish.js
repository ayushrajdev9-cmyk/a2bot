const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const COOLDOWN = 60 * 1000;
const fishNames = ['Salmon', 'Tuna', 'Goldfish', 'Shark', 'Clownfish', 'Bass', 'Trout', 'Pike', 'Catfish', 'Swordfish'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Go fishing and try to catch something'),
  async execute(interaction) {
    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [], lastFish: 0 };

    const now = Date.now();
    if (now - (userData.lastFish || 0) < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - (userData.lastFish || 0))) / 1000);
      return interaction.reply({
        embeds: [embeds.warning(`You must wait **${remaining}** seconds before fishing again.`)],
      });
    }

    userData.lastFish = now;
    const caught = Math.random() < 0.4;

    if (caught) {
      const earned = Math.floor(Math.random() * 46) + 5;
      const fish = fishNames[Math.floor(Math.random() * fishNames.length)];

      userData.balance += earned;
      if (!userData.totalEarned) userData.totalEarned = 0;
      userData.totalEarned += earned;
      db.set('economy', interaction.user.id, userData);

      await interaction.reply({
        embeds: [embeds.success(`🎣 You caught a **${fish}** and earned **${earned}** coins!`)],
      });
    } else {
      const lost = 5;
      userData.balance = Math.max(0, (userData.balance || 0) - lost);
      if (!userData.totalLost) userData.totalLost = 0;
      userData.totalLost += lost;
      db.set('economy', interaction.user.id, userData);

      await interaction.reply({
        embeds: [embeds.error(`🐟 You didn't catch anything and lost **${lost}** coins on bait.`)],
      });
    }
  },
};
