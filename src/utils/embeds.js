const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

function base(title, color = config.colors.primary) {
  return new EmbedBuilder()
    .setTitle(title)
    .setColor(color)
    .setTimestamp();
}

function success(title, description) {
  return base(title, config.colors.success).setDescription(description);
}

function error(title, description) {
  return base(title, config.colors.error).setDescription(description);
}

function warning(title, description) {
  return base(title, config.colors.warning).setDescription(description);
}

function info(title, description) {
  return base(title, config.colors.primary).setDescription(description);
}

module.exports = { base, success, error, warning, info };
