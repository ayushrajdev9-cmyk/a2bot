const { SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');
const embeds = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklist a user from using the bot')
    .addUserOption(o => o.setName('user').setDescription('The user to blacklist').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for blacklisting').setRequired(false)),
  async execute(interaction, client) {
    if (interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Error', 'You do not have permission to use this command.')], ephemeral: true });
    }

    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const blacklist = db.get('blacklist') || {};
    if (blacklist[target.id]) {
      delete blacklist[target.id];
      db.set('blacklist', 'list', Object.keys(blacklist));
      db.set('blacklist', target.id, null);
      return interaction.reply({ embeds: [embeds.success('Unblacklisted', `${target.tag} has been removed from the blacklist.`)] });
    }

    const list = db.get('blacklist', 'list') || [];
    list.push(target.id);
    db.set('blacklist', 'list', list);
    db.set('blacklist', target.id, { reason, by: interaction.user.tag, date: Date.now() });

    await interaction.reply({ embeds: [embeds.success('Blacklisted', `${target.tag} has been blacklisted.\nReason: ${reason}`)] });
  },
};
