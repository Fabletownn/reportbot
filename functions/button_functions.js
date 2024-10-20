const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const CONFIG = require('../models/config.js');

// ************************************
// Report handling button functionality
// ************************************
async function handleBugReport(interaction, channel, id) {
    const buttonId = id.replace('bughandle-', '');
    const channelTags = channel.appliedTags;
    
    const data = await CONFIG.findOne({
        guildID: interaction.guild.id
    });
    
    if (!data) return;

    const postTags = channelTags.filter((tagId) => tagId === data?.pctag ||
        tagId === data?.xboxtag || tagId === data?.pstag || tagId === data?.vrtag);
    
    await changeButton(interaction, id);
    
    switch (buttonId) {
        case "noted":
            await channel.setAppliedTags([...postTags, data?.notedtag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "known":
            await channel.setAppliedTags([...postTags, data?.knowntag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "replicate":
            await channel.setAppliedTags([...postTags, data?.reptag]);
            await channel.setArchived(false);
            break;
        case "log":
            await channel.setAppliedTags([...postTags, data?.logtag]);
            await channel.setArchived(false);
            break;
        case "notbug":
            await channel.setAppliedTags([...postTags, data?.xtag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "nf":
            await channel.setAppliedTags([data?.nftag]).catch(() => {});
            break;
        case "fixed":
            await channel.setAppliedTags([data?.fixedtag]).catch(() => {});
            await channel.setArchived(true);
            break;
        case "transnotbug":
            await channel.setAppliedTags([data?.txtag]).catch(() => {});
            await channel.setArchived(true);
            break;
        default:
            break;
    }
}

// **************************************************
// Changes button color depending on what was pressed
// **************************************************
async function changeButton(interaction, id) {
    const row = interaction.message.components[0];
    const buttons = row.components;
    
    const updatedButtons = await buttons.map((button) => {
        if (button.customId === id) {
            if (id === 'bughandle-notbug') {
                return ButtonBuilder.from(button)
                    .setStyle(ButtonStyle.Danger);
            } else {
                return ButtonBuilder.from(button)
                    .setStyle(ButtonStyle.Success);
            }
        }
        
        return ButtonBuilder.from(button)
            .setStyle(ButtonStyle.Secondary);
    });
    
    const updatedRow = new ActionRowBuilder().addComponents(updatedButtons);
    await interaction.update({ components: [updatedRow] });
}

// ***************************
// Bug report handling buttons
// ***************************
const notedButton = new ButtonBuilder()
    .setCustomId('bughandle-noted')
    .setLabel('Noted')
    .setStyle(ButtonStyle.Secondary)

const knownButton = new ButtonBuilder()
    .setCustomId('bughandle-known')
    .setLabel('Known Issue')
    .setStyle(ButtonStyle.Secondary)

const repButton = new ButtonBuilder()
    .setCustomId('bughandle-replicate')
    .setLabel('Cannot Replicate')
    .setStyle(ButtonStyle.Secondary)

const logButton = new ButtonBuilder()
    .setCustomId('bughandle-log')
    .setLabel('Needs More Info')
    .setStyle(ButtonStyle.Secondary)

const xButton = new ButtonBuilder()
    .setCustomId('bughandle-notbug')
    .setLabel('X')
    .setStyle(ButtonStyle.Secondary)

const handleRow = new ActionRowBuilder()
    .addComponents(notedButton)
    .addComponents(knownButton)
    .addComponents(repButton)
    .addComponents(logButton)
    .addComponents(xButton);

// ***********************************
// Translation report handling buttons
// ***********************************
const nfButton = new ButtonBuilder()
    .setCustomId('bughandle-nf')
    .setLabel('Needs Fixed')
    .setStyle(ButtonStyle.Secondary)

const fixedButton = new ButtonBuilder()
    .setCustomId('bughandle-fixed')
    .setLabel('Fixed')
    .setStyle(ButtonStyle.Secondary)

const txButton = new ButtonBuilder()
    .setCustomId('bughandle-transnotbug')
    .setLabel('X')
    .setStyle(ButtonStyle.Secondary)

const transRow = new ActionRowBuilder()
    .addComponents(nfButton)
    .addComponents(fixedButton)
    .addComponents(txButton);

module.exports = {
    handleBugReport,
    handleRow,
    transRow
}