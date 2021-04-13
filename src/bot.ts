import {
    Message,
    Client,
    MessageReaction,
    CollectorFilter,
    User,
    TextChannel,
    DMChannel,
    NewsChannel
} from "discord.js";

require('dotenv').config();

const utils = require('./utils');
import { colorText, highlightText } from './formatting';
import { createUserMention } from "./utils";

const client: Client = new Client();

/* User mentions are like this: <@86890631690977280>.
If they have a nickname, there will also be a ! after the @.

Role mentions look like <@&134362454976102401>

channel mentions like <#222197033908436994>
 */
const BOT_COMMAND_PREFIX = '!';
const REGISTRATION_TIMER = 10000;
const MAX_PIRATE_PLAYERS = 7;
const NUMBER_OF_SWORDS_FOR_EACH_PLAYER = 5;
const commands = ['help', 'user', 'avatar', 'pirate', 'a', 'b'];

let pirateGame = false;


// Make it a generic countdown, with start message, end message, time of countdown.
const registerCountdown = (actualTimer: number, registrationMessage: Message, REGISTRATION_MESSAGE_ANNOUNCEMENT: string): void => {
    registrationMessage.edit(`${REGISTRATION_MESSAGE_ANNOUNCEMENT}
    Time to register: ${actualTimer / 1000}`);
    actualTimer -= 1000;
    if (actualTimer >= 0) setTimeout(() => registerCountdown(actualTimer, registrationMessage, REGISTRATION_MESSAGE_ANNOUNCEMENT), 1000);
};

const awaitRegistrations = async (message: Message, time: number, filter: CollectorFilter) => {
    let players: User[] = [];
    // const reaction = message.reactions.cache.get('🏴‍☠️');
    await message.awaitReactions(filter, { time: time, max: MAX_PIRATE_PLAYERS })
        .then(collected => {
            collected.each((r) => {
                r.users.cache.each((user) => {
                    if (!user.bot) players.push(user);
                })
            });
        });
    return players;
};

const pirateGameStart = async (message: Message) => {
    pirateGame = true;
    const creator = message.author;

    const REGISTRATION_MESSAGE_ANNOUNCEMENT = `${utils.createUserMention(creator)} started a new pirate game! React to this message with a 🏴‍☠️ to enter the game!`;
    const registrationMessage = await message.reply(REGISTRATION_MESSAGE_ANNOUNCEMENT);

    // Example reaction to make it easier to react
    registrationMessage.react('🏴‍☠️');

    const pirateGameReactionFilter = (reaction: MessageReaction, user: User) => reaction.emoji.name == '🏴‍☠️' && !user.bot;

    let actualRegistrationTimer = REGISTRATION_TIMER;
    registerCountdown(actualRegistrationTimer, registrationMessage, REGISTRATION_MESSAGE_ANNOUNCEMENT);

    const players = await awaitRegistrations(registrationMessage, REGISTRATION_TIMER, pirateGameReactionFilter);

    if (players.length === 0) {
        message.channel.send(`Sorry ${utils.createUserMention(creator)} but no one registered to play. Try again with !pirate`);
        finishPirateGame();
        return;
    }
    else if (players.length === 1) {
        message.channel.send(`Sorry ${utils.createUserMention(creator)} but only one user registered to play and minimum is 2 users. Try again with !pirate`);
        finishPirateGame();
        return;
    }

    generateRegistredPlayersAnnoucement(players, message.channel);

    // TODO change positions to be O and X. O is clear, ⚔️ is full with a sword, 🏴‍☠️ is the losing one
    const { positions, losePosition, shuffledPlayers } = randomizeGame(players);

};

// TODO change positions to be O and X. O is clear, ⚔️ is full with a sword, 🏴‍☠️ is the losing one
const pirateGameExecution = (positions: number[], losePosition: number, shuffledPlayers: User[], channel: TextChannel | DMChannel | NewsChannel) => {
    // ask first player to chose a position
    const chosenPosition = askForPosition(shuffledPlayers[0], positions, channel);
    if (chosenPosition) {
        // insert sword and check position
        insertSword(positions, parseInt(chosenPosition), shuffledPlayers);
        // show new state
        showGrid(positions, channel);
        // next turn
        nextTurn(shuffledPlayers);
    } else {
        nextTurn(shuffledPlayers);
    }
};

// TODO change positions to be O and X. O is clear, ⚔️ is full with a sword, 🏴‍☠️ is the losing one
const insertSword = (positions: number[], position: number, shuffledPlayers: User[]): void => {
    if (positions[position] !== 0) {
        positions[position] = 1;
    };
};

const nextTurn = (players: User[]) => {
    players.push(players.shift());
    return players;
};

// TODO change positions to be O and X. O is clear, ⚔️ is full with a sword, 🏴‍☠️ is the losing one
const askForPosition = (user: User, positions: number[], channel: TextChannel | DMChannel | NewsChannel): string | undefined => {
    const userMention = createUserMention(user);
    channel.send(`It's your turn, ${userMention}!! `);
    showGrid(positions, channel);
    const filter = (m: Message) => utils.isNumeric(m.content) && positions[parseInt(m.content)] === 0;

    channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
        .then(collected => {
            if (collected.first()) return collected.first().content;
        })
        .catch(collected => {
            channel.send(`${userMention} did not chose a number. `);
            return undefined;
        });
    return undefined;
};

// TODO change positions to be O and X. O is clear, ⚔️ is full with a sword, 🏴‍☠️ is the losing one
const showGrid = (positions: number[], channel: TextChannel | DMChannel | NewsChannel) => {
    channel.send(`${positions}`);
};

const randomizeGame = (players: User[]) => {
    const NUMBER_OF_SWORDS = players.length * NUMBER_OF_SWORDS_FOR_EACH_PLAYER;
    let positions: number[] = new Array().fill(0);
    const losePosition = utils.randomIntFromInterval(0, NUMBER_OF_SWORDS - 1);
    positions[losePosition] = 1;
    return { positions: positions, losePosition: losePosition, shuffledPlayers: utils.shuffleArray(players) };
};

const generateRegistredPlayersAnnoucement = (players: User[], channel: TextChannel | DMChannel | NewsChannel) => {
    let message = `
    Registration over, game will start!
    Who is playing:
    `;

    players.forEach((p) => {
        message += utils.createUserMention(p);
        message += `
        `;

    });
    channel.send(message);
};

const finishPirateGame = () => {
    console.log("Finishing Game");

    pirateGame = false;
};

client.once('ready', () => {
    console.log("Pupo bot is online!!!!");
});

const clearChannel = (channel: TextChannel | DMChannel | NewsChannel) => {
    channel.messages.cache.each((m) => {
        console.log(m.content);
        // m.delete({ reason: 'I want it, I delete it.' });
    });
};

client.login(process.env.BOT_TOKEN);

client.on('message', async message => {
    // Not a command or bot message
    if (!message.content.startsWith(BOT_COMMAND_PREFIX) || message.author.bot) return;

    // Command to the bot
    const args = message.content.slice(BOT_COMMAND_PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Command not found
    if (!commands.includes(command)) {
        message.reply(`Command not found!`);
    }

    switch (command) {
        case 'user':
            message.reply(JSON.stringify(message.author));
            break;
        case 'b':
            // getGuild();
            break;
        case 'a':
            message.channel.lastMessage.react('🏴‍☠️').then(() => {
                // message.react('👎');
                message.awaitReactions((reaction, user) => reaction.emoji.name == '🏴‍☠️', { max: 10, time: 5000 })
                    .then(collected => {
                        if (collected.first()) {
                            collected.each(a => message.reply(a.emoji.name));
                        }
                        else {
                            message.reply('Operation canceled.');
                        }
                    }).catch(() => {
                        message.reply('No reaction after 10 seconds, game wont start');
                        finishPirateGame();
                    });
            });
            break;
        case 'avatar':
            // Send the user's avatar URL
            message.reply(`${message.author.displayAvatarURL()}`);
            break;
        case '' || 'help':
            message.reply(commands.map((cmd) => message.reply(cmd)));
            break;
        case 'pirate':
            if (pirateGame) return
            pirateGameStart(message);
            break;
        default:
            break;
    }
});

client.on('messageDelete', (message) => {
    message.reply(`TO VENDO ESSA PORRA AÍ`);
    console.log(message.reactions);

});

