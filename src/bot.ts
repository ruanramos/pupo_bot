import { Message, Client, User } from "discord.js";

require('dotenv').config();

const client: Client = new Client();


/* User mentions are like this: <@86890631690977280>.
If they have a nickname, there will also be a ! after the @.

Role mentions look like <@&134362454976102401>

channel mentions like <#222197033908436994>
 */
const commandPrefix = '!';
const commands = ['help', 'user', 'avatar', 'pirate'];

let pirateGame = false;

const pirateGameStart = (message: Message, args: string[]) => {
    if (args.length < 2) {
        console.log(`Please use the format !pirate numberOfPlayers numberOfSwords`);
        message.reply(`Please use the format !pirate numberOfPlayers numberOfSwords`);
        return;
    }
    const author: User = message.author;
    console.log(`PIRATE GAME STARTING BY ORDERS OF ${message.author}`);
    message.reply(`<@${message.author.id}>`);
    pirateGame = true;
    const numOfPlayers = args[0];
    const numOfSwords = args[1];
    console.log(message.author, message.channel, numOfPlayers, numOfSwords);
};

client.on('ready', () => {
    console.log("Our bot is ready to go!!!!");
});

client.login(process.env.BOT_TOKEN);

client.on('message', message => {
    // Not a command or bot message
    if (!message.content.startsWith(commandPrefix) || message.author.bot) return;

    const args = message.content.slice(commandPrefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(`Command: ${command}`);
    console.log(`args:`, args);

    // Command not found
    if (!commands.includes(command)) {
        message.reply(`Command not found!`);
    }

    else if (command === 'user') {
        message.reply(JSON.stringify(message.author));
    }

    else if (command === 'avatar') {
        // Send the user's avatar URL
        message.reply(`${message.author.displayAvatarURL()}`);
    }

    else if (command === "" || message.content === "help") {
        message.reply(commands.map((cmd) => message.reply(cmd)));
    }

    else if (command === "pirate") {
        if (pirateGame) return
        pirateGameStart(message, args);
    }
});

client.on('messageDelete', (message) => {
    message.channel.send(`TO VENDO ESSA PORRA AÍ`);
});
