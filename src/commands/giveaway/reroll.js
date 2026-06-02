const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reroll')
    .setDescription('Reroll a giveaway winner')
    .addStringOption(o => o.setName('message_id').setDescription('The giveaway message ID').setRequired(true))
    .addChannelOption(o => o.setName('channel').setDescription('The channel the giveaway is in').setRequired(false)),
  async execute(interaction) {
    await interaction.deferReply();

    const messageId = interaction.options.getString('message_id');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel.isTextBased()) {
      return interaction.editReply({ embeds: [embeds.error('Error', 'Invalid channel.')] });
    }

    const ended = db.get('giveaways', 'ended') || [];
    const giveaway = ended.find(g => g.messageId === messageId);

    if (!giveaway) {
      return interaction.editReply({ embeds: [embeds.error('Error', 'No ended giveaway found with that message ID.')] });
    }

    try {
      const fetched = await channel.messages.fetch(messageId);
      const reaction = fetched.reactions.cache.get('🎉');
      if (!reaction) {
        return interaction.editReply({ embeds: [embeds.error('Error', 'No giveaway reaction found on that message.')] });
      }

      const users = await reaction.users.fetch();
      const entries = users.filter(u => !u.bot).map(u => u);

      if (!entries.length) {
        return interaction.editReply({ embeds: [embeds.warning('Reroll', 'No valid participants found.')] });
      }

      const winner = entries[Math.floor(Math.random() * entries.length)];
      await interaction.editReply({ embeds: [embeds.success('🎉 New Winner!', `Congratulations ${winner}! You won **${giveaway.prize}**!`)] });
    } catch (err) {
      logger.error('Reroll error:', err);
      return interaction.editReply({ embeds: [embeds.error('Error', 'Could not fetch the giveaway message. Check the channel and message ID.')] });
    }
  },
};
