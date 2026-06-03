const embeds = require('../utils/embeds');

module.exports = {
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.mentions.has(client.user)) return;

    const prefix = client.config.prefix || '!';
    await message.reply({
      embeds: [embeds.info('Hey there!', `I'm **${client.user.username}**. Use \`/\` commands to interact with me.\nTry \`/help\` to see all my commands!`)],
      allowedMentions: { repliedUser: false },
    });
  },
};
