const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('firstmessage')
    .setDescription('Get the first message in a channel')
    .addChannelOption(o => o.setName('channel').setDescription('Target channel')),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    let messages;
    try {
      messages = await channel.messages.fetch({ after: '0', limit: 1 });
    } catch {
      return interaction.reply({ embeds: [embeds.error('Error', 'Could not fetch messages in that channel.')], ephemeral: true });
    }

    const first = messages.first();
    if (!first) {
      return interaction.reply({ embeds: [embeds.warning('No Messages', 'No messages found in this channel.')] });
    }

    const content = first.content || '*No text content*';
    const embed = embeds.info(`First message in #${channel.name}`)
      .addFields(
        { name: 'Author', value: `${first.author.tag} (${first.author.id})`, inline: true },
        { name: 'Sent', value: `<t:${Math.floor(first.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Content', value: content.length > 1024 ? `${content.slice(0, 1020)}...` : content },
      )
      .setURL(first.url);

    if (first.attachments.size > 0) embed.setImage(first.attachments.first().url);

    await interaction.reply({ embeds: [embed] });
  },
};
