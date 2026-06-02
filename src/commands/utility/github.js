const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Get GitHub user info')
    .addStringOption(o => o.setName('username').setDescription('GitHub username').setRequired(true)),
  async execute(interaction) {
    const username = interaction.options.getString('username');
    await interaction.deferReply();

    try {
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
      if (!res.ok) return interaction.editReply({ embeds: [embeds.error('Not Found', 'That GitHub user does not exist.')] });

      const data = await res.json();
      const embed = embeds.info(data.login)
        .setURL(data.html_url)
        .setThumbnail(data.avatar_url)
        .addFields(
          { name: 'Name', value: data.name || 'N/A', inline: true },
          { name: 'Followers', value: `${data.followers}`, inline: true },
          { name: 'Following', value: `${data.following}`, inline: true },
          { name: 'Public Repos', value: `${data.public_repos}`, inline: true },
          { name: 'Location', value: data.location || 'N/A', inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(new Date(data.created_at).getTime() / 1000)}:R>`, inline: true },
        );

      if (data.bio) embed.setDescription(data.bio);

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply({ embeds: [embeds.error('API Error', 'Failed to fetch GitHub data.')] });
    }
  },
};
