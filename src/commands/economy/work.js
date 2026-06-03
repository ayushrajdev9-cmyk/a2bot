const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

const COOLDOWN = 30 * 60 * 1000;
const jobs = ['Programmer', 'Chef', 'Builder', 'Teacher', 'Writer', 'Artist', 'Farmer', 'Driver', 'Nurse', 'Engineer'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work a random job and earn coins'),
  async execute(interaction) {
    let userData = db.get('economy', interaction.user.id);
    if (!userData) userData = { balance: 0, bank: 0, inventory: [], lastWork: 0 };

    const now = Date.now();
    if (now - (userData.lastWork || 0) < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - (userData.lastWork || 0))) / 60000);
      return interaction.reply({
        embeds: [embeds.warning('Cooldown', `You must wait **${remaining}** minutes before working again.`)],
      });
    }

    const earned = Math.floor(Math.random() * 81) + 20;
    const job = jobs[Math.floor(Math.random() * jobs.length)];

    userData.balance += earned;
    userData.lastWork = now;
    if (!userData.totalEarned) userData.totalEarned = 0;
    userData.totalEarned += earned;

    db.set('economy', interaction.user.id, userData);

    await interaction.reply({
      embeds: [embeds.success('💼 Work Complete', `You worked as a **${job}** and earned **${earned}** coins!`)],
    });
  },
};
