const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('urban')
    .setDescription('Look up a word on Urban Dictionary')
    .addStringOption(o => o.setName('word').setDescription('Word to define').setRequired(true)),
  async execute(interaction) {
    const word = interaction.options.getString('word');
    await interaction.deferReply();
    try {
      const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(word)}`);
      const json = await res.json();
      if (!json.list || !json.list.length) {
        return interaction.editReply({ embeds: [embeds.error('Not Found', `No definition found for **${word}**.`)] });
      }
      const entry = json.list[0];
      const def = entry.definition.length > 1000 ? entry.definition.slice(0, 1000) + '...' : entry.definition;
      const ex = entry.example ? (entry.example.length > 500 ? entry.example.slice(0, 500) + '...' : entry.example) : 'No example';
      const embed = embeds.info(`📖 ${entry.word}`)
        .setDescription(def)
        .addFields(
          { name: '📝 Example', value: ex, inline: false },
          { name: '👍', value: `${entry.thumbs_up}`, inline: true },
          { name: '👎', value: `${entry.thumbs_down}`, inline: true },
        );
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Failed to fetch definition. Try again later.')] });
    }
  },
};
