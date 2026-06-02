const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const embeds = require('../../utils/embeds');
const logger = require('../../utils/logger');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('economy-admin')
    .setDescription('Economy administration commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub => sub
      .setName('set-balance')
      .setDescription("Set a user's balance")
      .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('add-balance')
      .setDescription('Add balance to a user')
      .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('remove-balance')
      .setDescription('Remove balance from a user')
      .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('set-bank')
      .setDescription("Set a user's bank balance")
      .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('reset')
      .setDescription("Reset a user's economy data")
      .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true)))
    .addSubcommand(sub => sub
      .setName('give-all')
      .setDescription('Give money to all members')
      .addIntegerOption(opt => opt.setName('amount').setDescription('Amount').setRequired(true))),
  execute: async (interaction, client) => {
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const userId = user?.id;

    switch (sub) {
      case 'set-balance': {
        const data = db.get('economy', userId) || {};
        data.balance = amount;
        db.set('economy', userId, data);
        await interaction.reply({ embeds: [embeds.success('Balance Set', `Set ${user}'s balance to **${amount}**`)] });
        break;
      }
      case 'add-balance': {
        const data = db.get('economy', userId) || {};
        data.balance = (data.balance || 0) + amount;
        db.set('economy', userId, data);
        await interaction.reply({ embeds: [embeds.success('Balance Added', `Added **${amount}** to ${user}`)] });
        break;
      }
      case 'remove-balance': {
        const data = db.get('economy', userId) || {};
        data.balance = Math.max(0, (data.balance || 0) - amount);
        db.set('economy', userId, data);
        await interaction.reply({ embeds: [embeds.success('Balance Removed', `Removed **${amount}** from ${user}`)] });
        break;
      }
      case 'set-bank': {
        const data = db.get('economy', userId) || {};
        data.bank = amount;
        db.set('economy', userId, data);
        await interaction.reply({ embeds: [embeds.success('Bank Set', `Set ${user}'s bank to **${amount}**`)] });
        break;
      }
      case 'reset': {
        db.set('economy', userId, { balance: 0, bank: 0 });
        await interaction.reply({ embeds: [embeds.success('Economy Reset', `Reset economy data for ${user}.`)] });
        break;
      }
      case 'give-all': {
        const members = interaction.guild.members.cache.filter(m => !m.user.bot);
        members.forEach(m => {
          const data = db.get('economy', m.id) || {};
          data.balance = (data.balance || 0) + amount;
          db.set('economy', m.id, data);
        });
        await interaction.reply({ embeds: [embeds.success('Give All', `Given **${amount}** to **${members.size}** members.`)] });
        break;
      }
    }

    logger.info(`Economy admin ${sub} executed by ${interaction.user.tag}`);
  }
};
