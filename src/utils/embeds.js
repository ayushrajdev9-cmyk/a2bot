const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

function base(title, color = config.colors.primary) {
  const embed = new EmbedBuilder().setColor(color).setTimestamp();
  if (title) embed.setTitle(title);
  return embed;
}

function success(title, description) {
  const embed = base(title, config.colors.success);
  if (description) embed.setDescription(description);
  return embed;
}

function error(title, description) {
  const embed = base(title, config.colors.error);
  if (description) embed.setDescription(description);
  return embed;
}

function warning(title, description) {
  const embed = base(title, config.colors.warning);
  if (description) embed.setDescription(description);
  return embed;
}

function info(title, description) {
  const embed = base(title, config.colors.primary);
  if (description) embed.setDescription(description);
  return embed;
}

module.exports = { base, success, error, warning, info };
