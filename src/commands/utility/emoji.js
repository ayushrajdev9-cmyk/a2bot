const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Enlarge a custom emoji')
    .addStringOption(o => o.setName('emoji').setDescription('Emoji to enlarge').setRequired(true)),
  async execute(interaction) {
    const emojiInput = interaction.options.getString('emoji');
    const match = emojiInput.match(/<?a?:?\w+:(\d{17,20})>/);

    if (!match) {
      return interaction.reply({ embeds: [embeds.warning('Cannot Enlarge', 'That appears to be a unicode emoji which cannot be enlarged.')] });
    }

    const id = match[1];
    const animated = emojiInput.startsWith('<a:');
    const url = `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=2048`;

    const embed = embeds.info('Emoji Enlarged').setImage(url).setFooter({ text: `ID: ${id}` });
    await interaction.reply({ embeds: [embed] });
  },
};
