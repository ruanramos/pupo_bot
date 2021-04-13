import { Client, Guild, User } from 'discord.js';

function getUserFromMention(mention: string, client: Client): User {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

function isNumeric(value: string): boolean {
    return /^-?\d+$/.test(value);
}

const createUserMention = (user: User) => {
    return `<@${user.id}>`;
};

function shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const getGuild = (botClient: Client): Guild => {
    botClient.guilds.cache.each((g) => {
        console.log(`Guild Name: ${g.name}     Guild id: ${g.id}`);
        g.channels.cache.each((c) => {
            console.log(`Channel: ${c.name}    Type: ${c.type}     Permissions: ${JSON.stringify(c.permissionOverwrites)}`)
        });
    });
    return
}

const getUsersFromMessageReactions = () => {

};

export { getUserFromMention, isNumeric, createUserMention, shuffleArray, randomIntFromInterval };