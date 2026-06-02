const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('List all servers the bot is in'),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You do not have permission to use this command.')], ephemeral: true });
    }

    const guilds = [...client.guilds.cache.values()].sort((a, b) => b.memberCount - a.memberCount);
    if (!guilds.length) {
      return interaction.reply({ embeds: [embeds.info('Servers', 'The bot is not in any servers.')] });
    }

    const pageSize = 10;
    const totalPages = Math.ceil(guilds.length / pageSize);
    let page = 1;

    function buildEmbed(p) {
      const start = (p - 1) * pageSize;
      const end = start + pageSize;
      const list = guilds.slice(start, end).map(g => `**${g.name}** (${g.id}) - ${g.memberCount} members`).join('\n');
      return embeds.info(`Servers (Page ${p}/${totalPages})`, list);
    }

    const msg = await interaction.reply({ embeds: [buildEmbed(page)], fetchReply: true });

    if (totalPages <= 1) return;

    await msg.react('⬅️');
    await msg.react('➡️');

    const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
    const collector = msg.createReactionCollector({ filter, time: 60000 });

    collector.on('collect', (reaction) => {
      if (reaction.emoji.name === '⬅️' && page > 1) page--;
      else if (reaction.emoji.name === '➡️' && page < totalPages) page++;
      else return;
      reaction.users.remove(interaction.user.id).catch(() => {});
      msg.edit({ embeds: [buildEmbed(page)] });
    });
  },
};
