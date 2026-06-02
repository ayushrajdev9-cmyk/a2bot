const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll-quick')
    .setDescription('Create a quick yes/no or multi-option poll')
    .addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Custom option 1'))
    .addStringOption(o => o.setName('option2').setDescription('Custom option 2')),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const opt1 = interaction.options.getString('option1');
    const opt2 = interaction.options.getString('option2');

    let embed, emojis;

    if (opt1 && opt2) {
      emojis = ['1️⃣', '2️⃣'];
      embed = embeds.info(`📊 ${question}`, `${emojis[0]} ${opt1}\n${emojis[1]} ${opt2}`);
    } else {
      emojis = ['👍', '👎'];
      embed = embeds.info(`📊 ${question}`, `${emojis[0]} Yes\n${emojis[1]} No`);
    }

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (const emoji of emojis) {
      await msg.react(emoji);
    }
  },
};
