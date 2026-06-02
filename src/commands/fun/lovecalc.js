const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lovecalc')
    .setDescription('Calculate love compatibility')
    .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
    .addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(true)),
  async execute(interaction) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');
    const seed = user1.id + user2.id;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const percent = Math.abs(hash) % 101;
    let msg;
    if (percent >= 90) msg = 'Perfect match! 💕';
    else if (percent >= 70) msg = 'Great compatibility! 💖';
    else if (percent >= 50) msg = 'Not bad, could work! 💗';
    else if (percent >= 30) msg = 'Room for improvement... 💔';
    else msg = 'Run while you can! 😱';
    await interaction.reply({
      embeds: [embeds.info('💘 Love Calculator', `${user1} ❤️ ${user2}\n\n**${percent}%** - ${msg}`)],
    });
  },
};
