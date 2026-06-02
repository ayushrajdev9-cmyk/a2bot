const snipeMap = new Map();

module.exports = {
  snipeMap,
  async execute(message) {
    if (!message.author.bot && message.content) {
      snipeMap.set(message.channel.id, {
        content: message.content,
        author: message.author.tag,
        avatar: message.author.displayAvatarURL(),
        time: Date.now(),
      });
    }
  },
};
