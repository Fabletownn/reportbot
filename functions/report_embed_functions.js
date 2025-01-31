const CONFIG = require('../models/config.js');
const PLATS = require('../models/platformsets.json');
const {findTag} = require("./button_functions");

// *******************************************************************************************************************
// Adds any embed fields necessary to an embed, and if exceeds character limit, adds (Continued) fields until complete
// *******************************************************************************************************************
async function addEmbedFields(embed, description, steps, difficulty, mapWeather, ghostType, edit = 0, headset = 0, language = 0) {
    const characterLimit = 1024;

    async function addField(content, field) {
        const fieldsNeeded = content.length / characterLimit;
        const fieldsCeil = Math.ceil(fieldsNeeded);
        const fieldCount = Math.max(1, Math.min(fieldsCeil, 3));

        for (let i = 0; i < fieldCount; i++) {
            let startIndex = i * characterLimit;
            let splitContent = content.substring(startIndex, startIndex + characterLimit);
            let exceeds = fieldCount > 1;

            embed.addFields({ name: `${field}${i > 0 ? ' (Continued)' : ''}`, value: splitContent, inline: exceeds });
        }

        if (fieldCount === 2) embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
    }

    if (language !== 0)
        await addField(language, 'Language');

    if (headset !== 0)
        await addField(headset, 'Headset');

    if (description !== 0)
        await addField(description, steps !== 0 ? 'Description' : 'Translation Issue');

    if (steps !== 0)
        await addField(steps, 'Steps to Recreate');

    // Difficulty and mapWeather are set to the same for VR's condensed option, so check this
    // If they're not the same (non-VR report)
    if (difficulty !== mapWeather) {
        if (difficulty !== 0)
            await addField(difficulty, 'Difficulty');

        if (mapWeather !== 0)
            await addField(mapWeather, 'Map & Weather');
    } else {
        // If they are the same (VR or repeated report)
        await addField(difficulty, 'Difficulty & Map & Weather');
    }

    if (ghostType !== 0)
        await addField(ghostType, 'Ghost Type');

    if (edit !== 0)
        await addField(edit, 'Suggested Edit');
}

// *****************************************************************************
// Sets the color, icon, and author of a report embed depending on the platform
// *****************************************************************************
async function setEmbedBody(embed, platform) {
    switch (platform.toLowerCase()) {
        case "pc":
            await embed.setColor(PLATS.PC.COLOR);
            await embed.setAuthor({
                name: `${platform} Bug Report`,
                iconURL: PLATS.PC.ICON
            });
            break;
        case "xbox":
            await embed.setColor(PLATS.XBOX.COLOR);
            await embed.setAuthor({
                name: `${platform} Bug Report`,
                iconURL: PLATS.XBOX.ICON
            });
            break;
        case "playstation":
            await embed.setColor(PLATS.PS.COLOR);
            await embed.setAuthor({
                name: `${platform} Bug Report`,
                iconURL: PLATS.PS.ICON
            });
            break;
        case "vr":
            await embed.setColor(PLATS.VR.COLOR);
            await embed.setAuthor({
                name: `${platform} Bug Report`,
                iconURL: PLATS.VR.ICON
            });
            break;
        case "translation":
            await embed.setColor(PLATS.TRANSLATION.COLOR);
            await embed.setAuthor({
                name: 'Translation Issue Report',
                iconURL: PLATS.TRANSLATION.ICON
            });
            break;
        default:
            break;
    }
}

// **********************************************************************
// Adds the proper forum tag onto a bug report depending on the platform
// **********************************************************************
async function setPlatformTag(interaction, channel, platform) {
    const cData = await CONFIG.findOne({ guildID: interaction.guild.id });
    
    if (cData) {
        switch (platform.toLowerCase()) {
            case "pc":
                const pcTag = await findTag(interaction, channel, 'pc');
                
                await channel.setAppliedTags([pcTag]);
                break;
            case "xbox":
                const xboxTag = await findTag(interaction, channel, 'xbox');
                
                await channel.setAppliedTags([xboxTag]);
                break;
            case "playstation":
                const psTag = await findTag(interaction, channel, 'playstation');
                
                await channel.setAppliedTags([psTag]);
                break;
            case "vr":
                const vrTag = await findTag(interaction, channel, 'vr');
                
                await channel.setAppliedTags([vrTag]);
                break;
            default:
                break;
        }
    }
}

// ***************************************************
// Capitalizes the first letter of a sliced custom ID
// ***************************************************
function capCustomId(string, index) {
    return string.split('-')[index].charAt(0).toUpperCase() + string.split('-')[index].slice(1).toLowerCase();
}

// ***************************************
// Capitalizes each first letter of a word
// ***************************************
function capLetters(string, index) {
    let parts = string.split('-');

    for (let i = index; i < parts.length; i++) {
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
    }

    return parts.slice(index).join(' ');
}

// ***************************************************
// Returns the proper capitalization of platform names
// ***************************************************
function capPlatformId(string) {
    const lowerPlatform = string.toLowerCase();

    return lowerPlatform === 'pc' ? 'PC' : lowerPlatform === 'vr' ? 'VR' : lowerPlatform === 'xbox' ? 'XBox' :
        lowerPlatform === 'playstation' ? 'PlayStation' : string;
}

module.exports = {
    addEmbedFields,
    setEmbedBody,
    setPlatformTag,
    capCustomId,
    capPlatformId,
    capLetters
};