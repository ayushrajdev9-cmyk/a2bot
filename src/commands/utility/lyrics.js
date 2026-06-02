const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get song lyrics')
    .addStringOption(o => o.setName('song').setDescription('Song name or artist - title').setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('song');
    let artist = '';
    let title = input;

    if (input.includes(' - ')) {
      const parts = input.split(' - ');
      artist = parts[0].trim();
      title = parts[1].trim();
    } else if (input.includes(' by ')) {
      const parts = input.split(' by ');
      title = parts[0].trim();
      artist = parts[1].trim();
    }

    if (!artist) {
      return interaction.reply({
        embeds: [embeds.error('Please specify the song as **artist - title** or **title by artist**.')],
        ephemeral: true,
      });
    }

    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const res = await fetch(url);

    if (!res.ok) {
      return interaction.reply({ embeds: [embeds.error('Could not find lyrics for that song.')] });
    }

    const data = await res.json();
    const lyrics = data.lyrics.slice(0, 4096);

    await interaction.reply({
      embeds: [embeds.info(`🎵 ${title} - ${artist}`, `\`\`\`${lyrics}\`\`\``)],
    });
  },
};
