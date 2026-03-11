const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const express = require('express');
const app = express();

// --- WEB STATUS PAGE ---
app.get('/', (req, res) => {
  const status = client.isReady() ? 'ONLINE' : 'OFFLINE';
  const color = client.isReady() ? '#57f287' : '#ed4245';
  res.send(`
    <html>
      <head><title>Discord Bot Dashboard</title></head>
      <body style="background:#313338; color:white; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;">
        <h1 style="color:#5865f2;">Discord Bot Dashboard</h1>
        <div style="background:#2b2d31; padding:30px; border-radius:12px; text-align:center; min-width:300px;">
          <p><strong>Bot Tag:</strong> ${client.isReady() ? client.user.tag : 'Connecting...'}</p>
          <p><strong>Status:</strong> <span style="color:${color};">${status}</span></p>
          <p><strong>Servers:</strong> ${client.isReady() ? client.guilds.cache.size : '0'}</p>
          <p><strong>Ping:</strong> ${client.isReady() ? client.ws.ping + 'ms' : 'N/A'}</p>
        </div>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Web dashboard running on port ${PORT}`));

// --- DISCORD BOT ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`SUCCESS: Logged in as ${client.user.tag}`);
  console.log(`Serving ${client.guilds.cache.size} server(s)`);
});

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return;

  if (msg.content === '!ping') {
    msg.reply(`Pong! Latency: ${client.ws.ping}ms`);
  }

  if (msg.content === '!info') {
    msg.reply(`Bot is online. Serving ${client.guilds.cache.size} server(s).`);
  }
});

// --- REGISTER SLASH COMMANDS ---
const commands = [
  { name: 'ping', description: 'Check bot latency' },
  { name: 'info', description: 'Get bot info' },
  { name: 'admin', description: 'Check admin status' }
];

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.error('ERROR: DISCORD_TOKEN environment variable is not set.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Failed to register slash commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply(`Pong! Latency: ${client.ws.ping}ms`);
  }

  if (interaction.commandName === 'info') {
    await interaction.reply(`Bot is online. Serving ${client.guilds.cache.size} server(s).`);
  }

  if (interaction.commandName === 'admin') {
    await interaction.reply({ content: 'Admin status: **VERIFIED**', ephemeral: true });
  }
});

client.login(TOKEN);
