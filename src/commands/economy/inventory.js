const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View your or another user\'s inventory')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const userData = db.get('economy', target.id) || { balance: 0, bank: 0, inventory: [] };

    if (!userData.inventory || userData.inventory.length === 0) {
      return interaction.reply({
        embeds: [embeds.info(`${target.username} has no items in their inventory.`)],
      });
    }

    const embed = embeds.info()
      .setTitle(`${target.username}'s Inventory`)
      .setDescription(`Wallet: **${userData.balance}** coins | Bank: **${userData.bank}** coins`);

    userData.inventory.forEach(inv => {
      embed.addFields({ name: inv.item, value: `x${inv.quantity}`, inline: true });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
