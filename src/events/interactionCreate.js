const { Collection, AutocompleteInteraction } = require('discord.js');
const db = require('../utils/database');
const logger = require('../utils/logger');
const embeds = require('../utils/embeds');

const cooldowns = new Collection();

module.exports = {
  async execute(interaction, client) {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command || !command.autocomplete) return;
      try {
        await command.autocomplete(interaction);
      } catch (err) {
        logger.error(`Autocomplete error in /${interaction.commandName}:`, err);
      }
      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Blacklist check
    const blacklisted = db.get('blacklist', 'list') || [];
    if (blacklisted.includes(interaction.user.id) && interaction.user.id !== client.config.ownerId) {
      return interaction.reply({ embeds: [embeds.error('Blacklisted', 'You are blacklisted from using this bot.')], ephemeral: true });
    }

    // Owner bypass for cooldowns
    const isOwner = interaction.user.id === client.config.ownerId;

    if (!isOwner) {
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cdAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expiration = timestamps.get(interaction.user.id) + cdAmount;
        if (now < expiration) {
          const timeLeft = ((expiration - now) / 1000).toFixed(1);
          return interaction.reply({
            embeds: [embeds.warning('Cooldown', `Please wait ${timeLeft}s before using \`/${command.data.name}\` again.`)],
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cdAmount);
    }

    try {
      await command.execute(interaction, client);
    } catch (err) {
      logger.error(`Error in /${command.data.name}:`, err);
      const reply = {
        embeds: [embeds.error('Error', 'An unexpected error occurred. Please try again.')],
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};
