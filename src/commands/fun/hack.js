const { SlashCommandBuilder } = require('discord.js');
const embeds = require('../../utils/embeds');

const steps = [
  '[▰▱▱▱▱▱▱▱▱▱] Connecting to remote server...',
  '[▰▰▱▱▱▱▱▱▱▱] Brute forcing firewall...',
  '[▰▰▰▱▱▱▱▱▱▱] Accessing database...',
  '[▰▰▰▰▱▱▱▱▱▱] Extracting user data...',
  '[▰▰▰▰▰▱▱▱▱▱] Cracking passwords...',
  '[▰▰▰▰▰▰▱▱▱▱] Downloading personal files...',
  '[▰▰▰▰▰▰▰▱▱▱] Injecting malware...',
  '[▰▰▰▰▰▰▰▰▱▱] Covering tracks...',
  '[▰▰▰▰▰▰▰▰▰▱] Exfiltrating data...',
  '[▰▰▰▰▰▰▰▰▰▰] Hack complete!',
];

const results = [
  'Found 3TB of cat photos',
  'Browser history: mostly Discord and Stack Overflow',
  'Password is "password123"',
  'Email inbox: 2,304 unread newsletters',
  'Search history: "how to code", "why no work"',
  'Desktop full of unorganized files',
  'Last Google search: "am i getting fired tomorrow"',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hack')
    .setDescription('Fake hack a user')
    .addUserOption(o => o.setName('user').setDescription('User to hack').setRequired(true)),
  cooldown: 10,
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [embeds.warning('Nice try', 'You can\'t hack yourself!')], ephemeral: true });
    }
    await interaction.deferReply();
    for (let i = 0; i < steps.length; i++) {
      const embed = embeds.info(`🖥️ Hacking ${target.username}...`, steps[i]);
      await interaction.editReply({ embeds: [embed] });
      await new Promise(r => setTimeout(r, 600));
    }
    const result = results[Math.floor(Math.random() * results.length)];
    const final = embeds.info('✅ Hack complete', `${target} has been hacked!\n\n**Result:** ${result}`);
    await interaction.editReply({ embeds: [final] });
  },
};
