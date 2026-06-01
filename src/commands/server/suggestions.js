const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion')
    .addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true)),
  async execute(interaction) {
    const guildData = db.get('guilds', interaction.guild.id);
    if (!guildData?.suggestionChannel) {
      return interaction.reply({ embeds: [embeds.warning('Not Configured', 'Suggestion channel has not been set up.')], ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(guildData.suggestionChannel);
    if (!channel) {
      return interaction.reply({ embeds: [embeds.error('Error', 'Suggestion channel not found.')], ephemeral: true });
    }

    const suggestion = interaction.options.getString('suggestion');
    const embed = embeds.info(`💡 Suggestion from ${interaction.user.tag}`, suggestion);
    const msg = await channel.send({ embeds: [embed] });
    await msg.react('✅');
    await msg.react('❌');

    await interaction.reply({ embeds: [embeds.success('Submitted', 'Your suggestion has been submitted.')], ephemeral: true });
  },
};
