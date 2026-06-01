const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages in bulk')
    .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    const messages = await interaction.channel.bulkDelete(amount, true);
    logger.info(`${interaction.user.tag} purged ${messages.size} messages in #${interaction.channel.name}`);

    const reply = await interaction.reply({ embeds: [embeds.success('Purged', `Deleted ${messages.size} messages.`)], fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 3000);
  },
};
