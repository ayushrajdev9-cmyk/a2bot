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
        embeds: [embeds.error('Error', 'Please specify the song as **artist - title** or **title by artist**.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (!data.lyrics) throw new Error('No lyrics');

      const lyrics = data.lyrics.slice(0, 4096);
      await interaction.editReply({
        embeds: [embeds.info(`🎵 ${title} - ${artist}`, `\`\`\`${lyrics}\`\`\``)],
      });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('Error', 'Could not find lyrics for that song.')] });
    }
  },
};
